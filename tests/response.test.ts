import { describe, expect, test } from "bun:test"
import { express, type MiniRequest, type MiniResponse } from "../express/index"

describe("Response Helpers", () => {
    test("send/json/redirect preserve expected behavior", async () => {
        const app = express()

        app.get("/send", (_req: MiniRequest, res: MiniResponse) => {
            res.status(201).send("created")
        })

        app.get("/json", (_req: MiniRequest, res: MiniResponse) => {
            res.status(202).json({ ok: true })
        })

        app.get("/redirect", (_req: MiniRequest, res: MiniResponse) => {
            res.redirect("/next")
        })

        const sendRes = await app.handle(new Request("http://localhost/send"))
        expect(sendRes.status).toBe(201)
        expect(await sendRes.text()).toBe("created")

        const jsonRes = await app.handle(new Request("http://localhost/json"))
        expect(jsonRes.status).toBe(202)
        expect(await jsonRes.json()).toEqual({ ok: true })

        const redirectRes = await app.handle(new Request("http://localhost/redirect"))
        expect(redirectRes.status).toBe(302)
        expect(redirectRes.headers.get("Location")).toBe("/next")
    })

    test("Duplicate response sends are guarded without overriding first response", async () => {
        const app = express()

        app.get("/double", (_req: MiniRequest, res: MiniResponse) => {
            res.send("first")
            res.json({ second: true })
        })

        const response = await app.handle(new Request("http://localhost/double"))
        expect(response.status).toBe(200)
        expect(await response.text()).toBe("first")
    })
})
