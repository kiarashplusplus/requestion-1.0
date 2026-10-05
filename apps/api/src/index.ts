import { Hono } from "hono";
import type { AppEnv } from "./env.js";
import { requestId, onError, fail } from "./middleware.js";
import agent from "./routes/agent.js";
import cards from "./routes/cards.js";
import v1 from "./routes/v1.js";
import posts from "./routes/posts.js";
import dev from "./routes/dev.js";

export { IngestWorkflow } from "./workflows/ingest.js";
export { MacroWorkflow } from "./workflows/macro.js";
export { NewsWorkflow } from "./workflows/news.js";
export { PostsWorkflow } from "./workflows/posts.js";

/**
 * Mount order is fixed by WS-A and frozen during Phase 1:
 * middleware → agent (robots, llms, well-known, mcp) → cards → v1 → dev → posts (hub catch-all last).
 */
const app = new Hono<AppEnv>();
app.use("*", requestId);
app.onError(onError);
app.notFound((c) => fail(c, "not_found", `No route for ${c.req.method} ${c.req.path}`));

app.get("/health", (c) => c.json({ ok: true, service: "request-news-api", version: c.env.API_VERSION }));

app.route("/", agent);
app.route("/card", cards);
app.route("/v1", v1);
app.route("/__dev", dev);
app.route("/", posts);

export default {
  fetch: app.fetch,
  /**
   * Cron handler kept as a thin dispatcher until Workflow `schedules` are verified end to end (WS-D).
   * Each cron creates one Workflow instance; the Workflow decides what is due from the cron string.
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const cron = controller.cron;
    const params = { cron, scheduledTime: new Date(controller.scheduledTime).toISOString() };
    const run = async () => {
      if (cron === "40 6 * * *") return env.MACRO.create({ params });
      if (cron === "15 */6 * * *") return env.NEWS.create({ params });
      return env.INGEST.create({ params });
    };
    ctx.waitUntil(run());
  },
} satisfies ExportedHandler<Env>;
