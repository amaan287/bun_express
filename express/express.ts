import { errorMessage, portRange, statusCode } from "./constants"
import { runPipeline } from "./middleware"
import { createRequest } from "./request"
import { createResponse } from "./response"
import { Router } from "./router"
import type { ExpressOptions, MiniRequest, MiniResponse, NotFoundHandler } from "./types"

export class Express extends Router {
    private notFoundHandler: NotFoundHandler | null = null
    private requestLoggingEnabled: boolean

    constructor(options: ExpressOptions = {}) {
        super()
        this.requestLoggingEnabled = options.requestLogging ?? false
    }

    setRequestLogging(enabled: boolean = true): this {
        this.requestLoggingEnabled = enabled
        return this
    }

    setNotFoundHandler(handler: NotFoundHandler): this {
        this.notFoundHandler = handler
        return this
    }

    notFound(handler: NotFoundHandler): this {
        return this.setNotFoundHandler(handler)
    }

    async handle(req: Request): Promise<Response> {
        const start = Date.now()
        const parsedUrl = new URL(req.url)
        const { res, getResponse } = createResponse()
        const miniReq = createRequest(req, {}, parsedUrl.searchParams)

        const hasResponseSent = (): boolean => getResponse() !== null

        await runPipeline(this.getRoutes(), miniReq, res, hasResponseSent, {
            onNotFound: async (request: MiniRequest, response: MiniResponse) => {
                if (this.notFoundHandler) {
                    await this.notFoundHandler(request, response)
                }

                if (!hasResponseSent()) {
                    response.status(statusCode.notFound).json({ error: errorMessage.notFound })
                }
            },
            onUnhandledError: async (err: unknown, _request: MiniRequest, response: MiniResponse) => {
                console.error("Unhandled Route Error:", err)
                if (!hasResponseSent()) {
                    response.status(statusCode.internServer).json({ error: errorMessage.internalServer })
                }
            }
        })

        const finalResponse = getResponse() || new Response(errorMessage.noResponseError, { status: statusCode.internServer })
        if (this.requestLoggingEnabled) {
            const duration = Date.now() - start
            console.log(`${miniReq.method} ${parsedUrl.pathname} ${finalResponse.status} - ${duration}ms`)
        }

        return finalResponse
    }

    listen(port: number = portRange.defaultPort): void {
        if (!Number.isInteger(port) || port < portRange.minimumPort || port > portRange.maximumPort) {
            throw new RangeError(errorMessage.portRangeExceed)
        }

        Bun.serve({
            port,
            fetch: (req: Request) => this.handle(req)
        })

        console.log(`Server is running on http://localhost:${port}`)
    }
}

export function express(options: ExpressOptions = {}): Express {
    return new Express(options)
}
