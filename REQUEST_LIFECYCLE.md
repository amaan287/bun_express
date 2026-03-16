# Nexora Request Lifecycle

This document defines the runtime flow for `Express.handle(req)`.

## 1. Request Entry

- Bun routes an incoming HTTP request into `app.handle(req)`.
- Nexora creates `MiniRequest` and `MiniResponse` wrappers.

## 2. Route Collection

- The framework reads all registered records (`get`, `post`, `use`, nested router mounts).
- For the active pathname, it classifies:
  - normal middleware (`use` with 3-arg handlers)
  - error middleware (`use` with 4-arg handlers)
  - route candidates (method-specific handlers)

## 3. Route Selection

When multiple route handlers match, Nexora picks one by precedence:

1. static routes
2. parameterized routes
3. wildcard routes

If two matches share the same precedence, registration order is used.

## 4. Normal Pipeline

- Matching normal middleware executes first in registration order.
- The selected route handler executes after middleware.
- `next()` advances the chain.
- If middleware or handler sends a response, execution stops.

## 5. Error Pipeline

- If middleware/handler throws or calls `next(err)`, Nexora enters error mode.
- Normal handlers are skipped.
- Matching 4-argument middleware `(err, req, res, next)` executes in order.
- If no error middleware handles the error, Nexora returns a default 500 JSON payload.

## 6. Not Found Handling

- If no response is produced in normal mode, Nexora runs not-found handling.
- If `app.notFound(handler)` is configured, it runs first.
- If it does not send a response, Nexora falls back to default `404 { error: "Not found" }`.

## 7. Finalization

- The built `Response` is returned to Bun.
- If no response exists after all fallbacks, Nexora returns `500 "No response sent"`.
