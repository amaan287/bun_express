import type { Handler, Middleware } from "./types"
import { methods } from "./constants"

export class Router {
    private routes: { [key: string]: Handler } = {}
    private middlewares: Middleware[] = []
    private prefix: string = ""

    use(middleware: Middleware) {
        this.middlewares.push(middleware)
        return this
    }

    get(path: string, handler: Handler) {
        this.routes[`${methods.get}:${this.prefix}${path}`] = handler
        return this
    }

    post(path: string, handler: Handler) {
        this.routes[`${methods.post}:${this.prefix}${path}`] = handler
        return this
    }

    put(path: string, handler: Handler) {
        this.routes[`${methods.put}:${this.prefix}${path}`] = handler
        return this
    }

    delete(path: string, handler: Handler) {
        this.routes[`${methods.delete}:${this.prefix}${path}`] = handler
        return this
    }

    // Used internally by Express to mount the router under a prefix
    _mount(prefix: string): { routes: typeof this.routes, middlewares: Middleware[] } {
        const mounted: { [key: string]: Handler } = {}

        for (const [key, handler] of Object.entries(this.routes)) {
            const [method, path] = key.split(":")
            mounted[`${method}:${prefix}${path}`] = handler
        }

        return { routes: mounted, middlewares: this.middlewares }
    }
}