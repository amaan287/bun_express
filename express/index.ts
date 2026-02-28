// A route handler function.
// It receives the incoming Request (Web standard Request from Bun)

import { errorMessage, methods, portRange, statusCode } from "./constants"

// and a simplified response object (MiniResponse) that mimics Express.
type Handler = (req: Request, res: any) => void
// A minimal Express-like response interface.
// This wraps the Web Response API to provide familiar methods
// like res.status(), res.json(), res.send(), etc.
export interface MiniResponse {
    // Current HTTP status code (defaults to 200)
    statusCode: number

    // Set HTTP status code and allow chaining
    status(code: number): MiniResponse

    // Set one header (key/value) or multiple headers via object
    set(header: string | Record<string, string>, value?: string): MiniResponse

    // Send a response body (auto-detects JSON for objects)
    send(body: any): void

    // Explicitly send JSON response
    json(body: any): void

    // Redirect to another URL with optional status (default 302)
    redirect(url: string, status: number): void
}
// Core Express-like application class
class Express {
    // Internal route registry.
    // Key format: "METHOD:/path" (example: "GET:/users")
    private routes: { [key: string]: Handler } = {}
    // Register a GET route
    get(path: string, handler: Handler) {
        // Store handler using method + path as unique key
        this.routes[`${methods.get}:${path}`] = handler
    }   
    post(path: string, handler: Handler) {
        // Store handler using method + path as unique key
        this.routes[`${methods.post}:${path}`] = handler
    }
    put(path:string,handler:Handler){
        this.routes[`${methods.put}:${path}`] = handler
    }
    delete(path: string, handler: Handler) {
        // Store handler using method + path as unique key
        this.routes[`${methods.delete}:${path}`] = handler 
    }
    
    // Start the HTTP server
    listen(port: number=portRange.defaultPort) {
        // Validate port range (standard TCP range)
        if (!Number.isInteger(port) || port < portRange.minimumPort || port > portRange.maximumPort) {
            throw new RangeError(errorMessage.portRangeExceed)
        }
        // Bun.serve starts a native Bun HTTP server
        Bun.serve({
            port: port,
            // fetch() is called for every incoming request
            fetch: async (req) => {
                // Build lookup key from HTTP method + pathname
                const key = `${req.method}:${new URL(req.url).pathname}`

                const handler = this.routes[key]
                // If no route matches, return 404
                if (!handler) {
                    return new Response(errorMessage.notFound, { status: statusCode.notFound })
                }

                // Will hold the final Response object once created
                let response: Response | null = null

                // Collect headers before building the final Response
                const headers = new Headers()
                
                // Create Express-like response wrapper
                const res: MiniResponse = {
                    // Default HTTP status
                    statusCode: statusCode.defaultSucess,

                    // Set status code and return this for chaining
                    status(code: number) {
                        this.statusCode = code
                        return this
                    },

                    // Set response headers
                    set(header: string | Record<string, string>, value?: string) {
                        if (typeof header === "string") {
                            // Single header: res.set("Content-Type", "text/plain")
                            headers.set(header, value as string)
                        } else {
                            // Multiple headers: res.set({ key: value })
                            Object.entries(header).forEach(([k, v]) => {
                                headers.set(k, v)
                            })
                        }
                        return this
                    },

                    // Send response body
                    send(body: any) {
                        // Prevent double send
                        if (response) throw new Error(errorMessage.duplicateResponse)

                        // If body is an object, treat it as JSON
                        if (typeof body === "object" && body !== null) {
                            headers.set("Content-Type", "application/json")
                            response = new Response(JSON.stringify(body), {
                                status: this.statusCode,
                                headers
                            })
                            return
                        }

                        // Otherwise convert to string
                        response = new Response(String(body), {
                            status: this.statusCode,
                            headers
                        })
                    },

                    // Explicit JSON response helper
                    json(body: any) {
                        if (response) throw new Error(errorMessage.duplicateResponse)

                        // Always set JSON content type
                        headers.set("Content-Type", "application/json")

                        response = new Response(JSON.stringify(body), {
                            status: this.statusCode,
                            headers
                        })
                    },

                    // Redirect helper
                    redirect(url: string, status: number = statusCode.defaultRedirect) {
                        if (response) throw new Error(errorMessage.duplicateResponse)

                        // Location header tells browser where to go
                        headers.set("Location", url)

                        response = new Response(null, {
                            status,
                            headers
                        })

                    }
                }

                try {
                    // Execute the matched route handler
                    await handler(req, res)

                    // If handler didn't send a response, return fallback
                    return response ?? new Response(errorMessage.noResponseError)
                } catch (err: any) {
                    // Catch unexpected errors in route handlers
                    console.error("Route error:", err)

                    return new Response(
                        JSON.stringify({ error: errorMessage.internalServer }),
                        {
                            status: statusCode.internServer,
                            headers: { "Content-Type": "application/json" }
                        }
                    )
                }
            }
        })
        // Log server start message
        console.log(`server is running on port http://localhost:${port}`)
    }
}
// Factory function to create a new Express instance
// Usage: const app = express()
export default function express() {
    return new Express()
}
