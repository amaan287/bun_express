import { describe, expect, test } from "bun:test"
import { express, type MiniRequest, type MiniResponse } from "../express/index"

describe("Not Found Handler", () => {
    test("Uses custom not-found handler for unmatched routes", async () => {
        const app = express()

        app.notFound((req: MiniRequest, res: MiniResponse) => {
            res.status(404).json({ message: `No route for ${new URL(req.url).pathname}` })
        })

        const response = await app.handle(new Request("http://localhost/missing"))
        expect(response.status).toBe(404)

        const body = await response.json() as { message: string }
        expect(body.message).toBe("No route for /missing")
    })

    test("Skips custom not-found handler when a route matches", async () => {
        const app = express()
        let notFoundCalled = false

        app.notFound((_req: MiniRequest, res: MiniResponse) => {
            notFoundCalled = true
            res.status(404).send("custom 404")
        })

        app.get("/health", (_req: MiniRequest, res: MiniResponse) => {
            res.send("ok")
        })

        const response = await app.handle(new Request("http://localhost/health"))
        expect(response.status).toBe(200)
        expect(await response.text()).toBe("ok")
        expect(notFoundCalled).toBe(false)
    })
})
