import { Hono } from "hono";
import type { AppEnv } from "../env.js";
import { notImplemented } from "../middleware.js";
import { listRegions, searchRegions, CACHE_CONTROL } from "@request.news/shared";

/** WS-E replaces this file's contents with the zod-openapi app. Route list is the contract. */
const v1 = new Hono<AppEnv>();

v1.get("/regions", (c) => {
  const q = c.req.query("q");
  const country = c.req.query("country") ?? "US";
  const data = q ? searchRegions(q, country) : listRegions(country);
  c.header("Cache-Control", CACHE_CONTROL.history);
  return c.json({
    data,
    meta: { asOf: null, sources: [], license: "CC BY 4.0", generatedAt: new Date().toISOString(), requestId: c.get("requestId") },
  });
});

v1.get("/latest", notImplemented("GET /v1/latest"));
v1.get("/history", notImplemented("GET /v1/history"));
v1.get("/ranking", notImplemented("GET /v1/ranking"));
v1.get("/posts", notImplemented("GET /v1/posts"));
v1.get("/posts/:slug", notImplemented("GET /v1/posts/:slug"));
v1.get("/macro", notImplemented("GET /v1/macro"));
v1.get("/meta/feeds", notImplemented("GET /v1/meta/feeds"));
v1.post("/requests", notImplemented("POST /v1/requests"));

export default v1;
