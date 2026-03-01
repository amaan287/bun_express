import type { Middleware, MiniResponse } from "./types"

export async function runMiddlewares(
    middlewares: Middleware[],
    req: Request,
    res: MiniResponse,
    index: number = 0
): Promise<void> {
    if (index < middlewares.length) {
        const middleware = middlewares[index]
        if (!middleware) return
        await middleware(req, res, () => runMiddlewares(middlewares, req, res, index + 1))
    }
}