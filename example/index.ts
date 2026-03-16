import {
    cors,
    errorMessage,
    express,
    headerValue,
    portRange,
    statusCode,
    successMessage,
    type MiniRequest,
    type MiniResponse,
    type NextFunction
} from "../express"
import exampleRouter from "./routes"

const ENABLE_REQUEST_LOGGING = false
const app = express({ requestLogging: ENABLE_REQUEST_LOGGING })

app.use(cors({ origin: headerValue.wildcard }))

app.get("/health", (_req: MiniRequest, res: MiniResponse) => {
    res.status(statusCode.defaultSucess).json({ status: successMessage.ok })
})

app.get("/boom", async (_req: MiniRequest, _res: MiniResponse) => {
    throw new Error(errorMessage.internalServer)
})

app.use("/api", exampleRouter)

app.use((err: unknown, _req: MiniRequest, res: MiniResponse, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Unknown error"
    res.status(statusCode.internServer).json({ error: message })
})

app.notFound((req: MiniRequest, res: MiniResponse) => {
    res.status(statusCode.notFound).json({ error: `No route for ${new URL(req.url).pathname}` })
})

app.listen(portRange.defaultPort)
