# Request Lifecycle (Step-by-Step)

This document explains exactly what happens from the moment a client
sends an HTTP request until a response is returned in our mini Express
implementation.

---

## 1. Server Starts

When `app.listen(port)` is called:

- The port number is validated (must be 0-65535).
- `Bun.serve()` starts an HTTP server.
- Bun begins listening for incoming requests.
- Every request triggers the `fetch(req)` handler.

At this point, the server is ready.

---

## 2. Request Arrives

When a client makes a request (example: GET /users):

- Bun creates a Web `Request` object.
- The `fetch(req)` function runs.
- We build a route key using:

  METHOD + ":" + pathname

  Example:
  GET:/users

This key is used to look up the matching route handler.

---

## 3. Route Matching

- The server checks `this.routes[key]`.
- If no handler exists:
  - A `404 Not Found` response is immediately returned.
- If a handler exists:
  - Execution continues to the next step.

This is a simple exact-match router.

---

## 4. Response Wrapper Creation

Before calling the route handler:

- `response` is initialized as `null`.
- A `Headers` object is created.
- A custom `res` (MiniResponse) object is built.

This object provides Express-like methods:

- `res.status(code)`
- `res.set(header, value)`
- `res.send(body)`
- `res.json(body)`
- `res.redirect(url)`

Internally, these methods prepare a standard Web `Response` object.

Important rule:

- If a response is already created, calling send/json/redirect again throws an error.

This prevents double responses.

---

## 5. Route Handler Execution

The matching route handler is executed:

  await handler(req, res)

Inside the handler, the developer can:

- Read data from `req`
- Set headers with `res.set()`
- Set status with `res.status()`
- Send output with `res.send()` or `res.json()`

When `send()` or `json()` is called:

- A real `Response` object is created.
- The status code is applied.
- Headers are attached.
- The body is serialized (JSON if object).
- It is stored in the outer `response` variable.

But it is NOT returned yet.

---

## 6. After Handler Finishes

Once the handler completes:

- If `response` exists:
  - That Response is returned.
- If no response was sent:
  - A fallback response "No response sent" is returned.

This ensures every request receives something.

---

## 7. Error Handling

If the handler throws an error:

- The error is caught in the try/catch block.
- The server logs the error.
- A 500 Internal Server Error JSON response is returned:

  {
    "error": "Internal Server Error"
  }

This prevents the server from crashing.

---

## 8. Final Response Sent

The `Response` object is returned from `fetch()`.

Bun then:

- Sends HTTP status code
- Sends headers
- Sends body
- Closes the request

The lifecycle for that request is complete.

---

## Complete Flow (Short Version)

1. Client sends request
2. Bun calls `fetch(req)`
3. Route key is built
4. Route handler is found
5. `res` wrapper is created
6. Handler runs
7. Response is generated
8. Response is returned to client

---

## Mental Model

Think of it as:

Incoming Request -> Route Lookup -> Custom Response Builder -> Final Web Response -> Client

Your Express-like layer is just a thin abstraction on top of Bun's
native `Request` and `Response` APIs.
