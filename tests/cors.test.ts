import { expect, test, describe } from "bun:test";
import { express, cors, type MiniRequest, type MiniResponse, type NextFunction } from "../express/index";

describe("CORS & Preflight Flow", () => {
    test("Preflight OPTIONS returns 204 and CORS headers immediately", async () => {
        const app = express();
        
        let accessedHandler = false;
        
        app.use(cors({
            origin: "https://example.com",
            methods: ["GET", "POST"]
        }));

        app.post("/submit", (req: MiniRequest, res: MiniResponse) => {
            accessedHandler = true;
            res.send("done");
        });

        const req = new Request("http://localhost/submit", {
            method: "OPTIONS",
            headers: { "Origin": "https://example.com" }
        });

        const res = await app.handle(req);

        // Should return 204 No Content for preflight short-circuit
        expect(res.status).toBe(204);
        
        // Assert handler was definitely not executed
        expect(accessedHandler).toBe(false);

        // Core CORS response validations for preflight
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
        expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST");
        expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
    });

    test("Actual requests get origin headers, but handler triggers", async () => {
        const app = express();
        
        app.use(cors({ origin: "https://example.com" }));

        app.get("/data", (req: MiniRequest, res: MiniResponse) => {
            res.send("secure data");
        });

        const req = new Request("http://localhost/data", {
            method: "GET",
            headers: { "Origin": "https://example.com" }
        });

        const res = await app.handle(req);
        
        // Ensure success logic is intact and the handler produced the body
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("secure data");

        // Validate CORS appends origin locally to successful response
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
    });
    
    test("Unmatched origins do not get headers", async () => {
        const app = express();
        
        app.use(cors({ origin: "https://specific.com" }));

        app.get("/data", (req: MiniRequest, res: MiniResponse) => {
            res.send("secure data");
        });

        const req = new Request("http://localhost/data", {
            method: "GET",
            headers: { "Origin": "https://stranger.com" }
        });

        const res = await app.handle(req);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("secure data");

        // Validate no headers are set since origin doesn't match
        expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    test("Credentials with wildcard origin reflects request origin", async () => {
        const app = express();

        app.use(cors({ origin: "*", credentials: true }));
        app.get("/data", (req: MiniRequest, res: MiniResponse) => {
            res.send("secure data");
        });

        const req = new Request("http://localhost/data", {
            method: "GET",
            headers: { "Origin": "https://client.app" }
        });

        const res = await app.handle(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://client.app");
        expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
        expect(res.headers.get("Vary")).toBe("Origin");
    });

    test("Preflight works for unmatched routes", async () => {
        const app = express();

        app.use(cors({ origin: "https://example.com" }));

        const req = new Request("http://localhost/missing", {
            method: "OPTIONS",
            headers: { "Origin": "https://example.com" }
        });

        const res = await app.handle(req);
        expect(res.status).toBe(204);
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
    });
});
