export const httpStatus = {
    success: {
        ok: 200,
        created: 201,
        accepted: 202,
        noContent: 204
    },
    redirect: {
        movedPermanently: 301,
        found: 302,
        seeOther: 303,
        temporaryRedirect: 307,
        permanentRedirect: 308
    },
    clientError: {
        badRequest: 400,
        unauthorized: 401,
        forbidden: 403,
        notFound: 404,
        methodNotAllowed: 405,
        conflict: 409,
        unprocessableEntity: 422,
        tooManyRequests: 429
    },
    serverError: {
        internalServerError: 500,
        badGateway: 502,
        serviceUnavailable: 503,
        gatewayTimeout: 504
    }
} as const

export const statusCode = {
    internServer: httpStatus.serverError.internalServerError,
    notFound: httpStatus.clientError.notFound,
    defaultSucess: httpStatus.success.ok,
    defaultRedirect: httpStatus.redirect.found,
    badRequest: httpStatus.clientError.badRequest,
    noContent: httpStatus.success.noContent,
    created: httpStatus.success.created,
    accepted: httpStatus.success.accepted
} as const

export const httpMethod = {
    get: "GET",
    post: "POST",
    put: "PUT",
    patch: "PATCH",
    delete: "DELETE",
    head: "HEAD",
    options: "OPTIONS",
    use: "USE"
} as const

export const methods = {
    get: httpMethod.get,
    post: httpMethod.post,
    put: httpMethod.put,
    delete: httpMethod.delete
} as const

export const headerName = {
    contentType: "Content-Type",
    location: "Location",
    origin: "Origin",
    authorization: "Authorization",
    vary: "Vary",
    accessControlAllowOrigin: "Access-Control-Allow-Origin",
    accessControlAllowMethods: "Access-Control-Allow-Methods",
    accessControlAllowHeaders: "Access-Control-Allow-Headers",
    accessControlAllowCredentials: "Access-Control-Allow-Credentials",
    accessControlExposeHeaders: "Access-Control-Expose-Headers",
    accessControlMaxAge: "Access-Control-Max-Age"
} as const

export const headerValue = {
    applicationJson: "application/json",
    textPlain: "text/plain",
    wildcard: "*",
    true: "true",
    varyOrigin: "Origin"
} as const

export const errorType = {
    internalServerError: "INTERNAL_SERVER_ERROR",
    notFound: "NOT_FOUND",
    noResponseSent: "NO_RESPONSE_SENT",
    duplicateResponse: "DUPLICATE_RESPONSE",
    invalidPortRange: "INVALID_PORT_RANGE",
    invalidJsonContentType: "INVALID_JSON_CONTENT_TYPE"
} as const

export const errorMessage = {
    internalServer: "Internal Server error",
    notFound: "Not found",
    noResponseError: "No response sent",
    duplicateResponse: "Response already sent",
    portRangeExceed: "Port must be an integer between 0 and 65535",
    invalidJsonContentType: "Content-Type must be application/json"
} as const

export const successMessage = {
    ok: "OK",
    created: "Created",
    accepted: "Accepted",
    noContent: "No Content"
} as const

export const portRange = {
    minimumPort: 0,
    maximumPort: 65535,
    defaultPort: 3000
} as const

export const corsDefaults = {
    methods: [
        httpMethod.get,
        httpMethod.head,
        httpMethod.put,
        httpMethod.patch,
        httpMethod.post,
        httpMethod.delete
    ],
    allowedHeaders: [headerName.contentType, headerName.authorization],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400
} as const
