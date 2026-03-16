import type { ErrorMiddleware, Handler, MatchResult, Middleware, RouteRecord } from "./types"
import { methods } from "./constants"

export class Router {
    protected _routes: RouteRecord[] = []
    private nextOrder = 0

    private normalizePath(method: string, path: string): string {
        if (!path && method !== "USE") {
            return "/"
        }

        return path
    }

    private getPriority(method: string, path: string): number {
        if (method === "USE") {
            return 0
        }
        const hasWildcard = path.includes("*")
        const hasParams = /:([a-zA-Z0-9_]+)/.test(path)
        const segmentCount = path.split("/").filter(Boolean).length
        if (hasWildcard) {
            return 1000 + segmentCount
        }
        if (hasParams) {
            return 2000 + segmentCount
        }
        return 3000 + segmentCount
    }

    protected addRoute(method: string, path: string, handler: Handler | Middleware | ErrorMiddleware): this {
        const normalizedPath = this.normalizePath(method, path)
        const paramNames: string[] = []

        let regexStr = normalizedPath.replace(/([\/?.+()\[\]{}\\|^$])/g, "\\$1")
        regexStr = regexStr.replace(/\*/g, "(.*)")

        regexStr = regexStr.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
            paramNames.push(paramName)
            return "([^\\/]+)"
        })

        if (method !== "USE") {
            regexStr = `^${regexStr}$`
        } else {
            regexStr = `^${regexStr}(?:/|$)`
        }

        this._routes.push({
            method,
            pathPattern: new RegExp(regexStr),
            paramNames,
            handler,
            originalPath: normalizedPath,
            priority: this.getPriority(method, normalizedPath),
            order: this.nextOrder++
        })

        return this
    }

    use(path: string | Middleware | ErrorMiddleware | Router, middlewareOrRouter?: Middleware | ErrorMiddleware | Router): this {
        if (typeof path !== "string") {
            if (path instanceof Router) {
                this.mountRouter("", path)
            } else {
                this.addRoute("USE", "", path)
            }
            return this
        }

        if (middlewareOrRouter instanceof Router) {
            this.mountRouter(path, middlewareOrRouter)
        } else if (middlewareOrRouter) {
            this.addRoute("USE", path, middlewareOrRouter)
        }

        return this
    }

    private mountRouter(mountPath: string, router: Router): void {
        const cleanMountPath = mountPath.endsWith("/") ? mountPath.slice(0, -1) : mountPath

        for (const route of router._routes) {
            const newPath = `${cleanMountPath}${route.originalPath}`
            this.addRoute(route.method, newPath, route.handler)
        }
    }

    get(path: string, handler: Handler): this { return this.addRoute(methods.get, path, handler) }
    post(path: string, handler: Handler): this { return this.addRoute(methods.post, path, handler) }
    put(path: string, handler: Handler): this { return this.addRoute(methods.put, path, handler) }
    delete(path: string, handler: Handler): this { return this.addRoute(methods.delete, path, handler) }

    getRoutes(): RouteRecord[] {
        return this._routes
    }

    protected matchRoute(route: RouteRecord, pathname: string): MatchResult {
        const match = pathname.match(route.pathPattern)
        if (!match) {
            return { matched: false, params: {} }
        }

        const params: Record<string, string> = {}
        route.paramNames.forEach((name, index) => {
            params[name] = match[index + 1] || ""
        })

        return { matched: true, params }
    }
}
