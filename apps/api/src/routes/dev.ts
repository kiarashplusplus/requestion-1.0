import { Hono } from "hono";
import type { AppEnv } from "../env.js";
import { fail } from "../middleware.js";

/** WS-D owns this file. Dev/staging only: triggers a Workflow by name. Absent in production. */
const dev = new Hono<AppEnv>();

dev.post("/workflow/:name", async (c) => {
  if (c.env.ENVIRONMENT === "production") return fail(c, "not_found", "no such route");
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const expected = (c.env as unknown as { DEV_TRIGGER_TOKEN?: string }).DEV_TRIGGER_TOKEN;
  if (!expected || token !== expected) return fail(c, "validation", "missing or invalid dev token");
  const name = c.req.param("name");
  const params = { cron: c.req.query("cron") ?? "manual", scheduledTime: new Date().toISOString() };
  const bindings: Record<string, Workflow<unknown> | undefined> = {
    ingest: c.env.INGEST as Workflow<unknown>,
    macro: c.env.MACRO as Workflow<unknown>,
    news: c.env.NEWS as Workflow<unknown>,
    posts: c.env.POSTS as Workflow<unknown>,
  };
  const binding = bindings[name];
  if (!binding) return fail(c, "not_found", `unknown workflow ${name}`);
  const instance = await binding.create({ params });
  return c.json({ data: { id: instance.id, name }, meta: { requestId: c.get("requestId") } });
});

export default dev;
