import { Router, successMessage, type MiniRequest, type MiniResponse, type NextFunction } from "./express"

const apiRouter = new Router()
const v1Router = new Router()

v1Router.use(async (req: MiniRequest, _res: MiniResponse, next: NextFunction) => {
    req.params = { ...req.params, apiVersion: "v1" }
    await next()
})

v1Router.get("/users/:id", (req: MiniRequest, res: MiniResponse) => {
    res.json({ userId: req.params.id, version: req.params.apiVersion })
})

v1Router.get("/files/*", (_req: MiniRequest, res: MiniResponse) => {
    res.send(`${successMessage.ok}: wildcard file route`)
})

apiRouter.use("/v1", v1Router)

export default apiRouter
