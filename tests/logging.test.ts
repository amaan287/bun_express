import { describe, expect, test } from "bun:test"
import { express, type MiniRequest, type MiniResponse } from "../express/index"

describe("Request Logging Flag", () => {
    test("Request logging is off by default", async () => {
        const app = express()
        app.get("/health", (_req: MiniRequest, res: MiniResponse) => {
            res.send("ok")
        })

        const originalLog = console.log
        const logs: string[] = []
        console.log = (...args: unknown[]) => {
            logs.push(args.map(String).join(" "))
        }

        try {
            const response = await app.handle(new Request("http://localhost/health"))
            expect(response.status).toBe(200)
            expect(logs.length).toBe(0)
        } finally {
            console.log = originalLog
        }
    })

    test("Request logging can be enabled with a single true", async () => {
        const app = express({ requestLogging: true })
        app.get("/health", (_req: MiniRequest, res: MiniResponse) => {
            res.send("ok")
        })

        const originalLog = console.log
        const logs: string[] = []
        console.log = (...args: unknown[]) => {
            logs.push(args.map(String).join(" "))
        }

        try {
            const response = await app.handle(new Request("http://localhost/health"))
            expect(response.status).toBe(200)
            expect(logs.some((line) => line.includes("GET /health 200"))).toBe(true)
        } finally {
            console.log = originalLog
        }
    })
})
