export type NextFunction = (err?: unknown) => Promise<void> | void;

export type Middleware = (
    req: MiniRequest,
    res: MiniResponse,
    next: NextFunction
) => void | Promise<void>;

export type ErrorMiddleware = (
    err: unknown,
    req: MiniRequest,
    res: MiniResponse,
    next: NextFunction
) => void | Promise<void>;

export type Handler = (req: MiniRequest, res: MiniResponse) => void | Promise<void>;
export type NotFoundHandler = Handler;

export interface MiniRequest extends Request {
    params: Record<string, string>;
    query: URLSearchParams;
    /** Safe body parsers */
    json<T = unknown>(): Promise<T>;
    text(): Promise<string>;
}

export interface MiniResponse {
    statusCode: number
    status(code: number): MiniResponse
    set(header: string | Record<string, string>, value?: string): MiniResponse
    send(body: unknown): void
    json(body: unknown): void
    redirect(url: string, status?: number): void
}

export interface CorsOptions {
    origin?: string | string[] | ((origin: string) => boolean)
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
}

export interface ExpressOptions {
    requestLogging?: boolean
}

export interface RouteRecord {
    method: string;
    pathPattern: RegExp;
    paramNames: string[];
    handler: Handler | Middleware | ErrorMiddleware;
    originalPath: string;
    priority: number;
    order: number;
}

export interface MatchResult {
    matched: boolean;
    params: Record<string, string>;
}
