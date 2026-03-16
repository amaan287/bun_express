import { expect, test, describe } from "bun:test";
import { express, type MiniRequest, type MiniResponse, type NextFunction } from "../express/index";

describe("Middleware Execution Order & Short-circuiting", () => {
    test("Executes in order and reaches handler", async () => {
        const app = express();
        const executionOrder: string[] = [];

        app.use(async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            executionOrder.push("mid1");
            await next();
        });

        app.use("/test", async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            executionOrder.push("mid2");
            await next();
        });

        app.get("/test", (req: MiniRequest, res: MiniResponse) => {
            executionOrder.push("handler");
            res.status(200).send("done");
        });

        const res = await app.handle(new Request("http://localhost/test"));
        expect(res.status).toBe(200);
        expect(executionOrder).toEqual(["mid1", "mid2", "handler"]);
    });

    test("Short-circuits before reaching handler", async () => {
        const app = express();
        const executionOrder: string[] = [];

        app.use(async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            executionOrder.push("mid1");
            await next();
        });

        app.use("/auth", async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            executionOrder.push("auth");
            res.status(401).send("Unauthorized");
            // does NOT call next()
        });

        app.get("/auth", (req: MiniRequest, res: MiniResponse) => {
            executionOrder.push("handler"); // Should not happen
            res.status(200).send("done");
        });

        const res = await app.handle(new Request("http://localhost/auth"));
        expect(res.status).toBe(401);
        expect(await res.text()).toBe("Unauthorized");
        expect(executionOrder).toEqual(["mid1", "auth"]);
    });

    test("Middlewares run on unmatched routes", async () => {
        const app = express();
        let ran = false;

        app.use(async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            ran = true;
            await next();
        });

        const res = await app.handle(new Request("http://localhost/not-found"));
        expect(res.status).toBe(404);
        expect(ran).toBe(true);
    });

    test("Path middleware runs before route finalization even when registered later", async () => {
        const app = express();
        const order: string[] = [];

        app.get("/late", (req: MiniRequest, res: MiniResponse) => {
            order.push("handler");
            res.send("ok");
        });

        app.use("/late", async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            order.push("middleware");
            await next();
        });

        const res = await app.handle(new Request("http://localhost/late"));
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("ok");
        expect(order).toEqual(["middleware", "handler"]);
    });
});
