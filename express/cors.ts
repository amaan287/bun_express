import type { CorsOptions, Middleware } from "./types"
import { corsDefaults, headerName, headerValue, httpMethod, statusCode } from "./constants"

const defaultOptions: Required<Omit<CorsOptions, "origin">> & { origin: string } = {
    origin: headerValue.wildcard,
    methods: [...corsDefaults.methods],
    allowedHeaders: [...corsDefaults.allowedHeaders],
    exposedHeaders: [...corsDefaults.exposedHeaders],
    credentials: corsDefaults.credentials,
    maxAge: corsDefaults.maxAge
}

function resolveOrigin(
    allowedOrigin: CorsOptions["origin"],
    requestOrigin: string | null,
    credentials: boolean
): string | null {
    if (!requestOrigin) {
        return null
    }

    if (allowedOrigin === headerValue.wildcard) {
        return credentials ? requestOrigin : headerValue.wildcard
    }

    if (typeof allowedOrigin === "string") {
        return allowedOrigin === requestOrigin ? requestOrigin : null
    }

    if (Array.isArray(allowedOrigin)) {
        return allowedOrigin.includes(requestOrigin) ? requestOrigin : null
    }

    if (typeof allowedOrigin === "function") {
        return allowedOrigin(requestOrigin) ? requestOrigin : null
    }

    return null
}

export function cors(options: CorsOptions = {}): Middleware {
    const opts = { ...defaultOptions, ...options }

    return async (req, res, next) => {
        const requestOrigin = req.headers.get(headerName.origin)
        const resolvedOrigin = resolveOrigin(opts.origin, requestOrigin, opts.credentials)

        if (resolvedOrigin) {
            res.set(headerName.accessControlAllowOrigin, resolvedOrigin)

            if (resolvedOrigin !== headerValue.wildcard) {
                res.set(headerName.vary, headerValue.varyOrigin)
            }

            if (opts.credentials) {
                res.set(headerName.accessControlAllowCredentials, headerValue.true)
            }

            if (opts.exposedHeaders.length > 0) {
                res.set(headerName.accessControlExposeHeaders, opts.exposedHeaders.join(", "))
            }
        }

        if (req.method === httpMethod.options) {
            if (resolvedOrigin) {
                res.set(headerName.accessControlAllowMethods, opts.methods.join(", "))
                res.set(headerName.accessControlAllowHeaders, opts.allowedHeaders.join(", "))
                res.set(headerName.accessControlMaxAge, String(opts.maxAge))
            }

            res.status(statusCode.noContent).send("")
            return
        }

        await next()
    }
}
