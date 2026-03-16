import { expect, test, describe } from "bun:test";
import { express, Router, type MiniRequest, type MiniResponse, type NextFunction } from "../express/index";

describe("Router Nesting & Error Handling", () => {
    test("Nested router correctly prefixes paths", async () => {
        const app = express();
        const apiRouter = new Router();
        const v1Router = new Router();

        v1Router.get("/users", (req: MiniRequest, res: MiniResponse) => {
            res.send("v1 users");
        });

        apiRouter.use("/v1", v1Router);
        app.use("/api", apiRouter);

        const res = await app.handle(new Request("http://localhost/api/v1/users"));
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("v1 users");
    });

    test("Error middleware correctly catches thrown errors", async () => {
        const app = express();

        app.get("/broken", async (req: MiniRequest, res: MiniResponse) => {
            throw new Error("Something broke!");
        });

        app.use("/broken", (err: unknown, req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            const message = err instanceof Error ? err.message : "Unknown error";
            res.status(500).json({ customError: message });
        });

        const res = await app.handle(new Request("http://localhost/broken"));
        expect(res.status).toBe(500);
        const body = await res.json() as { customError: string };
        expect(body.customError).toBe("Something broke!");
    });

    test("next(err) skips normal middlewares and invokes error middleware", async () => {
        const app = express();
        const executed: string[] = [];

        app.use(async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            executed.push("mid1");
            await next(new Error("Manual error"));
        });

        app.use(async (req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            executed.push("mid2"); // Should NOT run
            await next();
        });

        // Error middleware (4 arguments!)
        app.use((err: unknown, req: MiniRequest, res: MiniResponse, next: NextFunction) => {
            const message = err instanceof Error ? err.message : "Unknown error";
            executed.push("err1");
            res.status(400).send("Caught: " + message);
        });

        const res = await app.handle(new Request("http://localhost/skip"));
        expect(res.status).toBe(400);
        expect(await res.text()).toBe("Caught: Manual error");
        expect(executed).toEqual(["mid1", "err1"]);
    });
});
