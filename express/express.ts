import { errorMessage, methods, portRange, statusCode } from "./constants"
import { createResponse } from "./response"
import { runMiddlewares } from "./middleware"
import type { Handler, Middleware } from "./types"

class Express {
    private routes: { [key: string]: Handler } = {}
    private middlewares: Middleware[] = []

    use(middleware: Middleware) {return this.middlewares.push(middleware)}
    get(path: string, handler: Handler) { this.routes[`${methods.get}:${path}`] = handler }
    post(path: string, handler: Handler) { this.routes[`${methods.post}:${path}`] = handler }
    put(path: string, handler: Handler) { this.routes[`${methods.put}:${path}`] = handler }
    delete(path: string, handler: Handler) { this.routes[`${methods.delete}:${path}`] = handler }

    listen(port: number = portRange.defaultPort) {
        if (!Number.isInteger(port) || port < portRange.minimumPort || port > portRange.maximumPort) {
            throw new RangeError(errorMessage.portRangeExceed)
        }

        Bun.serve({
            port,
            fetch: async (req) => {
                const start = Date.now()
                const key = `${req.method}:${new URL(req.url).pathname}`
                const handler = this.routes[key]

                if (!handler) {
                    return new Response(errorMessage.notFound, { status: statusCode.notFound })
                }

                const { res, getResponse } = createResponse()

                try {
                    await runMiddlewares(this.middlewares, req, res)

                    if (!getResponse()) {
                        await handler(req, res)
                    }

                    const finalResponse = getResponse() ?? new Response(errorMessage.noResponseError)
                    const duration = Date.now() - start
                    console.log(`${req.method} ${new URL(req.url).pathname} ${finalResponse.status} - ${duration}ms`)
                    return finalResponse
                } catch (err: any) {
                    const duration = Date.now() - start
                    console.error("Route error:", err)
                    console.log(`${req.method} ${new URL(req.url).pathname} ${statusCode.internServer} - ${duration}ms`)
                    return new Response(
                        JSON.stringify({ error: errorMessage.internalServer }),
                        { status: statusCode.internServer, headers: { "Content-Type": "application/json" } }
                    )
                }
            }
        })
        console.log(`server is running on port http://localhost:${port}`)
    }
}

export  function express() {
    return new Express()
}