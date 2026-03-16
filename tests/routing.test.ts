import { expect, test, describe } from "bun:test";
import { express, type MiniRequest, type MiniResponse } from "../express/index";

describe("Routing & Parameters", () => {
    test("Static Route Matches", async () => {
        const app = express();
        
        app.get("/hello", (req: MiniRequest, res: MiniResponse) => {
            res.status(200).send("world");
        });

        const res = await app.handle(new Request("http://localhost/hello"));
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("world");
    });

    test("404 on Unmatched Route", async () => {
        const app = express();
        const res = await app.handle(new Request("http://localhost/missing"));
        expect(res.status).toBe(404);
        const body = await res.json() as { error: string };
        expect(body.error).toBe("Not found");
    });

    test("Dynamic Route Parameters", async () => {
        const app = express();
        
        app.get("/users/:id/books/:bookId", (req: MiniRequest, res: MiniResponse) => {
            res.status(200).json(req.params);
        });

        const res = await app.handle(new Request("http://localhost/users/123/books/abc"));
        expect(res.status).toBe(200);
        
        const body = await res.json();
        expect(body).toEqual({ id: "123", bookId: "abc" });
    });

    test("Wildcard Fallback", async () => {
        const app = express();
        
        app.get("/static", (req: MiniRequest, res: MiniResponse) => {
            res.send("static");
        });

        app.get("/*", (req: MiniRequest, res: MiniResponse) => {
            res.send("wildcard");
        });

        const res1 = await app.handle(new Request("http://localhost/static"));
        expect(await res1.text()).toBe("static");

        const res2 = await app.handle(new Request("http://localhost/anything-else"));
        expect(await res2.text()).toBe("wildcard");
    });

    test("Route precedence favors static over wildcard regardless of registration order", async () => {
        const app = express();

        app.get("/*", (req: MiniRequest, res: MiniResponse) => {
            res.send("wildcard");
        });

        app.get("/static", (req: MiniRequest, res: MiniResponse) => {
            res.send("static");
        });

        const res = await app.handle(new Request("http://localhost/static"));
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("static");
    });

    test("Route precedence favors static over params and params over wildcard", async () => {
        const app = express();

        app.get("/*", (req: MiniRequest, res: MiniResponse) => {
            res.send("wildcard");
        });

        app.get("/users/:id", (req: MiniRequest, res: MiniResponse) => {
            res.send(`param:${req.params.id}`);
        });

        app.get("/users/new", (req: MiniRequest, res: MiniResponse) => {
            res.send("static");
        });

        const staticRes = await app.handle(new Request("http://localhost/users/new"));
        expect(await staticRes.text()).toBe("static");

        const paramsRes = await app.handle(new Request("http://localhost/users/123"));
        expect(await paramsRes.text()).toBe("param:123");

        const wildcardRes = await app.handle(new Request("http://localhost/anything-else"));
        expect(await wildcardRes.text()).toBe("wildcard");
    });

    test("Method Distinctions", async () => {
        const app = express();
        
        app.post("/submit", (req: MiniRequest, res: MiniResponse) => {
            res.send("POST matched");
        });

        const res1 = await app.handle(new Request("http://localhost/submit", { method: "POST" }));
        expect(res1.status).toBe(200);
        expect(await res1.text()).toBe("POST matched");

        const res2 = await app.handle(new Request("http://localhost/submit", { method: "GET" }));
        expect(res2.status).toBe(404);
    });
});
