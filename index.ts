import { cors, express, type MiniRequest, type MiniResponse, type NextFunction } from "./express"
import exampleRouter from "./routes"

const ENABLE_REQUEST_LOGGING = false
const app = express({ requestLogging: ENABLE_REQUEST_LOGGING })

app.use(cors({ origin: "*" }))

app.get("/health", (_req: MiniRequest, res: MiniResponse) => {
    res.json({ status: "ok" })
})

app.get("/boom", async (_req: MiniRequest, _res: MiniResponse) => {
    throw new Error("Simulated failure")
})

app.use("/api", exampleRouter)

app.use((err: unknown, _req: MiniRequest, res: MiniResponse, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Unknown error"
    res.status(500).json({ error: message })
})

app.notFound((req: MiniRequest, res: MiniResponse) => {
    res.status(404).json({ error: `No route for ${new URL(req.url).pathname}` })
})

app.listen(3000)
