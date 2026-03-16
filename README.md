# bun_express

bun_express is a Bun-first, Express-like web framework with strict TypeScript types, a deterministic middleware pipeline, and lightweight routing helpers.

## v1 Direction

bun_express v1 follows an **Express-like developer API** on top of a **Bun-native Request/Response runtime**.

- Express-style ergonomics: `app.use`, `app.get`, `req.params`, `res.json`, error middleware.
- Bun-native execution: native `Request` and `Response` objects with no Node.js adapter layer.

## Behavior Matrix

| Area | Contract |
| --- | --- |
| Route matching | Supports static routes, params (`/users/:id`), and wildcards (`/*`, `*`). |
| Route precedence | `static > params > wildcard`, independent of registration order. |
| Middleware order | Matching `use(...)` middleware runs before route finalization. |
| Unmatched routes | Matching middleware still runs, then not-found handling executes. |
| Error flow | `next(err)` and thrown errors skip normal flow and run 4-arg error middleware. |
| 404 handling | Default 404 JSON or custom handler via `app.notFound(...)`. |
| CORS | Handles both preflight (`OPTIONS`) and actual requests for matched/unmatched paths. |
| Request logging | Off by default; enable with `express({ requestLogging: true })` or `app.setRequestLogging(true)`. |
| Response safety | Duplicate `send/json/redirect` is guarded; first response remains authoritative. |

## Quick Start

```ts
import { express, cors, Router, headerValue, portRange, statusCode } from "express"
import type { MiniRequest, MiniResponse, NextFunction } from "express"

const app = express({ requestLogging: true })
const v1 = new Router()

app.use(cors({ origin: headerValue.wildcard }))

v1.get("/users/:id", (req: MiniRequest, res: MiniResponse) => {
    res.json({ id: req.params.id })
})

app.use("/api/v1", v1)

app.get("/boom", async () => {
    throw new Error("Example error")
})

app.use((err: unknown, _req: MiniRequest, res: MiniResponse, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Unknown error"
    res.status(statusCode.internServer).json({ error: message })
})

app.notFound((req: MiniRequest, res: MiniResponse) => {
    res.status(statusCode.notFound).json({ error: `No route for ${new URL(req.url).pathname}` })
})

app.listen(portRange.defaultPort)
```

## Request Helpers

- `req.params`: route parameters extracted from matcher.
- `req.query`: `URLSearchParams` from request URL.
- `req.json<T>()`: JSON body parser with `content-type` guard.
- `req.text()`: plain-text body parser.

## Routing Rules

- Dynamic params: `/users/:id`
- Wildcards: `/assets/*` or `/*`
- Precedence: static paths win over params, params win over wildcard matches

## Testing

Run the full suite:

```bash
bun test
```

You can test in-memory without opening a socket by calling `app.handle(new Request(...))`.

## Example App

- Example files live in `example/index.ts` and `example/routes.ts`.
- Run the example with:

```bash
bun run example/index.ts
```

## Internal Lifecycle

See `REQUEST_LIFECYCLE.md` for full lifecycle details.

## Packaging Readiness

See `PACKAGING_CHECKLIST.md` for publish/export/version steps.

## Community

- Contribution guide: `CONTRIBUTING.md`
- Code of Conduct: `CODE_OF_CONDUCT.md`
- License: `LICENSE`
