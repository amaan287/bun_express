export type Next = () => Promise<void>
export type Middleware = (req: Request, res: MiniResponse, next: Next) => void | Promise<void>
export type Handler = (req: Request, res: any) => void | Promise<void>

export interface MiniResponse {
    statusCode: number
    status(code: number): MiniResponse
    set(header: string | Record<string, string>, value?: string): MiniResponse
    send(body: any): void
    json(body: any): void
    redirect(url: string, status: number): void
}

export interface CorsOptions {
    origin?: string | string[] | ((origin: string) => boolean)
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
}
