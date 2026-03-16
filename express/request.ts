import type { MiniRequest } from "./types";

export function createRequest(
    req: Request,
    letParams: Record<string, string> = {},
    letQuery: URLSearchParams = new URLSearchParams()
): MiniRequest {
    let params = letParams;
    let query = letQuery;
    
    // Create a proxy to wrap the original Request object
    // This allows seamless access to all native Request properties
    const miniReq = new Proxy(req as unknown as MiniRequest, {
        get(target, prop, receiver) {
            if (prop === "params") return params;
            if (prop === "query") return query;

            if (prop === "json") {
                return async <T = unknown>(): Promise<T> => {
                    const contentType = req.headers.get("content-type") || "";
                    if (!contentType.includes("application/json")) {
                        throw new Error("Content-Type must be application/json");
                    }
                    // Clone so it can be read multiple times if needed, though usually it's consumed once.
                    return await req.clone().json() as T;
                };
            }

            if (prop === "text") {
                return async (): Promise<string> => {
                    return await req.clone().text();
                };
            }

            // Bind methods to the original request
            const value = (req as unknown as Record<PropertyKey, unknown>)[prop];
            return typeof value === "function" ? value.bind(req) : value;
        },
        set(target, prop, value, receiver) {
            if (prop === "params") {
                params = value;
                return true;
            }
            if (prop === "query") {
                query = value;
                return true;
            }
            return Reflect.set(target, prop, value, receiver);
        }
    });

    return miniReq;
}
