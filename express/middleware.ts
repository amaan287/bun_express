import type { ErrorMiddleware, Middleware, MiniRequest, MiniResponse, RouteRecord } from "./types"

interface PreparedRoute {
    route: RouteRecord
    params: Record<string, string>
}

interface PipelineOptions {
    onNotFound: (req: MiniRequest, res: MiniResponse) => Promise<void> | void
    onUnhandledError: (err: unknown, req: MiniRequest, res: MiniResponse) => Promise<void> | void
}

interface PipelineResult {
    matchedRoute: boolean
}

function matchRoute(pathname: string, route: RouteRecord): PreparedRoute | null {
    const match = pathname.match(route.pathPattern)
    if (!match) {
        return null
    }

    const params: Record<string, string> = {}
    route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1] || ""
    })

    return { route, params }
}

function pickBestRoute(candidates: PreparedRoute[]): PreparedRoute | null {
    if (candidates.length === 0) {
        return null
    }

    const sorted = candidates.sort((a, b) => {
        if (a.route.priority !== b.route.priority) {
            return b.route.priority - a.route.priority
        }
        return a.route.order - b.route.order
    })

    return sorted[0] || null
}

export async function runPipeline(
    pipeline: RouteRecord[],
    req: MiniRequest,
    res: MiniResponse,
    hasResponseSent: () => boolean,
    options: PipelineOptions
): Promise<PipelineResult> {
    const pathname = new URL(req.url).pathname
    const normalMiddlewares: PreparedRoute[] = []
    const errorMiddlewares: PreparedRoute[] = []
    const routeCandidates: PreparedRoute[] = []

    for (const route of pipeline) {
        const matchedRoute = matchRoute(pathname, route)
        if (!matchedRoute) {
            continue
        }

        const isErrorMiddleware = route.handler.length === 4

        if (route.method === "USE") {
            if (isErrorMiddleware) {
                errorMiddlewares.push(matchedRoute)
            } else {
                normalMiddlewares.push(matchedRoute)
            }
            continue
        }

        if (!isErrorMiddleware && route.method === req.method) {
            routeCandidates.push(matchedRoute)
        }
    }

    const matchedHandler = pickBestRoute(routeCandidates)
    const normalStack = matchedHandler ? [...normalMiddlewares, matchedHandler] : normalMiddlewares

    let enteredErrorMode = false

    const runErrorStack = async (startIndex: number, err: unknown): Promise<void> => {
        enteredErrorMode = true

        if (hasResponseSent()) {
            return
        }

        for (let index = startIndex; index < errorMiddlewares.length; index++) {
            const current = errorMiddlewares[index]
            if (!current) {
                continue
            }

            req.params = { ...req.params, ...current.params }
            const errorMiddleware = current.route.handler as ErrorMiddleware

            let forwarded = false
            let nextError = err

            try {
                await errorMiddleware(err, req, res, async (incomingErr?: unknown) => {
                    forwarded = true
                    if (typeof incomingErr !== "undefined") {
                        nextError = incomingErr
                    }
                })
            } catch (caughtErr) {
                forwarded = true
                nextError = caughtErr
            }

            if (hasResponseSent()) {
                return
            }

            if (forwarded) {
                await runErrorStack(index + 1, nextError)
            }

            return
        }

        if (!hasResponseSent()) {
            await options.onUnhandledError(err, req, res)
        }
    }

    const runNormalStack = async (index: number): Promise<void> => {
        if (hasResponseSent()) {
            return
        }

        const current = normalStack[index]
        if (!current) {
            return
        }

        req.params = { ...req.params, ...current.params }

        let nextCalled = false

        try {
            const normalHandler = current.route.handler as Middleware
            await normalHandler(req, res, async (err?: unknown) => {
                nextCalled = true
                if (typeof err !== "undefined") {
                    await runErrorStack(0, err)
                    return
                }
                await runNormalStack(index + 1)
            })
        } catch (caughtErr) {
            await runErrorStack(0, caughtErr)
            return
        }

        if (!nextCalled) {
            return
        }
    }

    await runNormalStack(0)

    if (!hasResponseSent() && !enteredErrorMode) {
        await options.onNotFound(req, res)
    }

    return {
        matchedRoute: matchedHandler !== null
    }
}
