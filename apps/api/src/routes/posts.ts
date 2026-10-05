import { Hono } from "hono";
import type { AppEnv } from "../env.js";
import { notImplemented, usOnlyHtml } from "../middleware.js";

/**
 * WS-F owns this file: SSR posts, hubs, static/legal pages, sitemaps, feeds, oEmbed, data, request form.
 * HTML surfaces run behind the US-only gate; machine-readable surfaces do not.
 */
const posts = new Hono<AppEnv>();

// Machine-readable (world-readable)
posts.get("/sitemap.xml", notImplemented("sitemap index"));
posts.get("/sitemaps/:name", notImplemented("sitemap"));
posts.get("/news-sitemap.xml", notImplemented("news sitemap"));
posts.get("/feed/:region", notImplemented("RSS/JSON feed"));
posts.get("/oembed", notImplemented("oEmbed"));
posts.get("/data/:slug", notImplemented("CSV/JSON data"));

// HTML (US-only)
posts.use("/p/*", usOnlyHtml);
posts.use("/embed/*", usOnlyHtml);
posts.use("/request", usOnlyHtml);
posts.use("/us", usOnlyHtml);
posts.use("/us/*", usOnlyHtml);
for (const p of ["/about", "/methodology", "/editorial-policy", "/corrections", "/contact", "/press", "/privacy", "/terms", "/your-privacy-choices", "/data-license"]) {
  posts.use(p, usOnlyHtml);
  posts.get(p, notImplemented(`page ${p}`));
}
posts.get("/p/:slug", notImplemented("post page"));
posts.get("/embed/:slug", notImplemented("embed"));
posts.get("/request", notImplemented("request form"));
posts.post("/request", notImplemented("request form submit"));
posts.get("/us", notImplemented("country hub"));
posts.get("/us/:region", notImplemented("state hub"));
posts.get("/us/:region/:city", notImplemented("city hub"));

export default posts;
