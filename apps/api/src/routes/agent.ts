import { Hono } from "hono";
import type { AppEnv } from "../env.js";
import { notImplemented } from "../middleware.js";
import { BRAND } from "@request.news/shared";

/** WS-I owns this file: robots, llms.txt, well-known, MCP. robots.txt ships in P0 so crawlers see the policy on day one. */
const agent = new Hono<AppEnv>();

const ROBOTS = `# ${BRAND.name}
Content-Signal: search=yes, ai-input=yes, ai-train=no

User-agent: *
Allow: /
Disallow: /__dev/
Disallow: /v1/requests

# Training-only crawlers (citation/search bots stay allowed: OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
# Claude-User, PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, Applebot)
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: Applebot-Extended
Disallow: /

Sitemap: ${BRAND.siteOrigin}/sitemap.xml
`;

agent.get("/robots.txt", (c) => {
  c.header("Cache-Control", "public, max-age=3600");
  return c.text(ROBOTS);
});
agent.get("/llms.txt", notImplemented("llms.txt"));
agent.get("/openapi.json", notImplemented("openapi.json"));
agent.all("/mcp", notImplemented("MCP server"));
agent.get("/.well-known/*", notImplemented("well-known"));

export default agent;
