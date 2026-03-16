import type { CorsOptions, Middleware } from "./types"

const defaultOptions: Required<Omit<CorsOptions, "origin">> & { origin: string } = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400
}

function resolveOrigin(
    allowedOrigin: CorsOptions["origin"],
    requestOrigin: string | null,
    credentials: boolean
): string | null {
    if (!requestOrigin) {
        return null
    }

    if (allowedOrigin === "*") {
        return credentials ? requestOrigin : "*"
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
        const requestOrigin = req.headers.get("Origin")
        const resolvedOrigin = resolveOrigin(opts.origin, requestOrigin, opts.credentials)

        if (resolvedOrigin) {
            res.set("Access-Control-Allow-Origin", resolvedOrigin)

            if (resolvedOrigin !== "*") {
                res.set("Vary", "Origin")
            }

            if (opts.credentials) {
                res.set("Access-Control-Allow-Credentials", "true")
            }

            if (opts.exposedHeaders.length > 0) {
                res.set("Access-Control-Expose-Headers", opts.exposedHeaders.join(", "))
            }
        }

        if (req.method === "OPTIONS") {
            if (resolvedOrigin) {
                res.set("Access-Control-Allow-Methods", opts.methods.join(", "))
                res.set("Access-Control-Allow-Headers", opts.allowedHeaders.join(", "))
                res.set("Access-Control-Max-Age", String(opts.maxAge))
            }

            res.status(204).send("")
            return
        }

        await next()
    }
}
