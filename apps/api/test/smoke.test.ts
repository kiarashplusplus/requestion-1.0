import { describe, expect, it } from "vitest";
import { env, SELF } from "cloudflare:test";

describe("P0 scaffold", () => {
  it("health answers", async () => {
    const res = await SELF.fetch("https://example.com/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it("stub routes answer 501 with the error envelope and a request id", async () => {
    const res = await SELF.fetch("https://example.com/v1/latest?country=US");
    expect(res.status).toBe(501);
    const body = (await res.json()) as { error: { code: string; requestId: string } };
    expect(body.error.code).toBe("not_implemented");
    expect(body.error.requestId).toMatch(/[0-9a-f-]{36}/);
    expect(res.headers.get("x-request-id")).toBe(body.error.requestId);
  });

  it("unknown route is a 404 envelope", async () => {
    const res = await SELF.fetch("https://example.com/nope");
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("not_found");
  });

  it("regions list leaks only summary fields", async () => {
    const res = await SELF.fetch("https://example.com/v1/regions?country=US&q=houston");
    const body = (await res.json()) as { data: Array<Record<string, unknown>> };
    expect(body.data.length).toBeGreaterThan(0);
    expect(Object.keys(body.data[0]!).sort()).toEqual(["code", "kind", "name", "slug"]);
  });

  it("robots.txt carries Content-Signal and keeps citation bots allowed", async () => {
    const res = await SELF.fetch("https://example.com/robots.txt");
    const text = await res.text();
    expect(text).toContain("Content-Signal: search=yes, ai-input=yes, ai-train=no");
    expect(text).toContain("Sitemap: https://request.news/sitemap.xml");
    for (const bot of ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "PerplexityBot", "Googlebot", "Google-Extended", "Bingbot"]) {
      expect(text).not.toMatch(new RegExp(`User-agent: ${bot}\\s+Disallow: /`));
    }
  });

  it("US gate: non-US visitor to an HTML route gets the 451 page with noindex and no scripts", async () => {
    const res = await SELF.fetch("https://example.com/p/houston-tx-gas-prices-2026-w41", { headers: { "x-test-country": "DE" } });
    expect(res.status).toBe(451);
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    const html = await res.text();
    expect(html).not.toContain("<script");
    expect(html).toContain("United States only");
  });

  it("US gate: US visitor passes through to the (stub) post route", async () => {
    const res = await SELF.fetch("https://example.com/p/houston-tx-gas-prices-2026-w41", { headers: { "x-test-country": "US" } });
    expect(res.status).toBe(501);
  });

  it("machine-readable routes are not geo-gated", async () => {
    const res = await SELF.fetch("https://example.com/sitemap.xml", { headers: { "x-test-country": "DE" } });
    expect(res.status).toBe(501);
  });

  it("D1 migrations applied: schema has the post table with the weekly uniqueness index", async () => {
    const idx = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='post_week_idx'").first<{ name: string }>();
    expect(idx?.name).toBe("post_week_idx");
    const tables = await env.DB.prepare("SELECT count(*) AS n FROM sqlite_master WHERE type='table'").first<{ n: number }>();
    expect(tables!.n).toBeGreaterThanOrEqual(15);
  });

  it("dev trigger rejects without the token", async () => {
    const res = await SELF.fetch("https://example.com/__dev/workflow/ingest", { method: "POST" });
    expect(res.status).toBe(422);
  });
});
