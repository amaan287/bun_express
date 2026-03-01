import { errorMessage, statusCode } from "./constants"
import type { MiniResponse } from "./types"

export function createResponse(): { res: MiniResponse; getResponse: () => Response | null } {
    let response: Response | null = null
    const headers = new Headers()

    const res: MiniResponse = {
        statusCode: statusCode.defaultSucess,

        status(code: number) {
            this.statusCode = code
            return this
        },

        set(header: string | Record<string, string>, value?: string) {
            if (typeof header === "string") {
                headers.set(header, value as string)
            } else {
                Object.entries(header).forEach(([k, v]) => headers.set(k, v))
            }
            return this
        },

        send(body: any) {
            if (response) throw new Error(errorMessage.duplicateResponse)
            if (typeof body === "object" && body !== null) {
                headers.set("Content-Type", "application/json")
                response = new Response(JSON.stringify(body), { status: this.statusCode, headers })
                return
            }
            response = new Response(String(body), { status: this.statusCode, headers })
        },

        json(body: any) {
            if (response) throw new Error(errorMessage.duplicateResponse)
            headers.set("Content-Type", "application/json")
            response = new Response(JSON.stringify(body), { status: this.statusCode, headers })
        },

        redirect(url: string, status: number = statusCode.defaultRedirect) {
            if (response) throw new Error(errorMessage.duplicateResponse)
            headers.set("Location", url)
            response = new Response(null, { status, headers })
        }
    }

    return { res, getResponse: () => response }
}