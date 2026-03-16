import { expect, test, describe } from "bun:test";
import { express, type MiniRequest, type MiniResponse, type NextFunction } from "../express/index";

describe("Request Helpers", () => {
    test("req.params exposes dynamic route values", async () => {
        const app = express();

        app.get("/users/:id", (req: MiniRequest, res: MiniResponse) => {
            res.json({ id: req.params.id });
        });

        const res = await app.handle(new Request("http://localhost/users/42"));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: "42" });
    });

    test("req.query parses search params correctly", async () => {
        const app = express();
        
        let queryParams: string | null = null;
        
        app.get("/search", (req: MiniRequest, res: MiniResponse) => {
            // we have mapped URLSearchParams to query
            queryParams = req.query.get("term");
            res.send("done");
        });

        const res = await app.handle(new Request("http://localhost/search?term=hello"));
        expect(res.status).toBe(200);
        expect(queryParams as string | null).toBe("hello");
    });
    
    test("req.json() parses body checking content-type", async () => {
        const app = express();
        
        let parsedBody: unknown = null;
        
        app.post("/data", async (req: MiniRequest, res: MiniResponse) => {
            try {
                parsedBody = await req.json();
                res.status(200).send("success");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Unknown error";
                res.status(400).json({ error: message });
            }
        });

        const res1 = await app.handle(new Request("http://localhost/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field: "value" })
        }));
        expect(res1.status).toBe(200);
        expect(parsedBody).toEqual({ field: "value" });

        const res2 = await app.handle(new Request("http://localhost/data", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: "not json"
        }));
        
        expect(res2.status).toBe(400);
        const errJson = await res2.json() as { error: string };
        expect(errJson.error).toBe("Content-Type must be application/json");
    });

    test("req.text() returns plain text body", async () => {
        const app = express();
        let textBody = "";

        app.post("/text", async (req: MiniRequest, res: MiniResponse) => {
            textBody = await req.text();
            res.send("ok");
        });

        const res = await app.handle(new Request("http://localhost/text", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: "hello world"
        }));

        expect(res.status).toBe(200);
        expect(await res.text()).toBe("ok");
        expect(textBody).toBe("hello world");
    });
});
