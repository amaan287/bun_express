type Handler = (req: Request, res: any) => void
export interface MiniResponse {
    statusCode: number
    status(code: number): MiniResponse
    set(header: string | Record<string, string>, value?: string): MiniResponse
    send(body: any): void
    json(body: any): void
    redirect(status: number, url: string): void
}
class Express {
    private routes: { [key: string]: Handler } = {}
    get(path: string, handler: Handler) {
        this.routes[`GET:${path}`] = handler
    }
    listen(port: number) {
        if (!Number.isInteger(port) || port < 0 || port > 65535) {
            throw new RangeError("Port must be an integer between 0 and 65535")
        }
        Bun.serve({
            port: port,
            fetch: (req) => {
                const key = `${req.method}:${new URL(req.url).pathname}`
                const handler = this.routes[key]
                if (!handler) {
                    return new Response("Not found", { status: 404 })
                }
                let response: Response | null = null
                const headers = new Headers()
                const res: MiniResponse = {
                    statusCode: 200,
                    status(code: number) {
                        this.statusCode = code
                        return this
                    },
                    send(body: any) {
                        if (response) {
                            throw new Error("Response already sent")
                        }
                        if (typeof body === "object") {
                            headers.set("Content-Type","application/json")
                            response = new Response(JSON.stringify(body), {
                                status: this.statusCode,
                                headers
                            })
                            return
                        }
                        response = new Response(body, {
                            status: this.statusCode
                        })
                    },
                    json(body: any) {
                        if (response) {
                            throw new Error("Response already sent")
                        }
                        response = new Response(JSON.stringify(body), {
                            status: this.statusCode,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                    },
                    set(header: string | Record<string, string>, value?: string): MiniResponse {
                        if (typeof header === "string") {
                            headers.set(header, value as string)
                        } else {
                            Object.entries(header).forEach(([key, val]) => {
                                headers.set(key, val)
                            })
                        }
                        return this
                    },
                    redirect(arg1: string | number, arg2?: string) {
                        if (response) {
                            throw new Error("Response already sent")
                        }

                        let status = 302
                        let url: string

                        if (typeof arg1 === "number") {
                            status = arg1
                            url = arg2 as string
                        } else {
                            url = arg1
                        }

                        headers.set("Location", url)

                        response = new Response(null, {
                            status,
                            headers
                        })
                        }
                }
                handler(req, res)
                return response ?? new Response("No response send")

            }
        })
        console.log(`server is running on port http://localhost:${port}`)
    }
}
export default function express() {
    return new Express()
}