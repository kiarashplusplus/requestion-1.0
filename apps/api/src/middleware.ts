import type { Context, MiddlewareHandler } from "hono";
import { HTTP_STATUS, type ErrorCode, type ErrorEnvelope, BRAND, isUsRequest, CACHE_CONTROL } from "@request.news/shared";
import type { AppEnv } from "./env.js";

export const requestId: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  const cf = (c.req.raw as Request & { cf?: { country?: string } }).cf;
  c.set("cfCountry", cf?.country ?? c.req.header("cf-ipcountry") ?? null);
  await next();
  c.header("x-request-id", c.get("requestId"));
};

export function fail(c: Context<AppEnv>, code: ErrorCode, message: string, details?: unknown) {
  const body: ErrorEnvelope = { error: { code, message, requestId: c.get("requestId") ?? "n/a" } };
  if (details !== undefined) body.error.details = details;
  c.header("Cache-Control", CACHE_CONTROL.none);
  return c.json(body, HTTP_STATUS[code] as 404);
}

export const notImplemented = (what: string): MiddlewareHandler<AppEnv> => async (c) =>
  fail(c, "not_implemented", `${what} is not implemented yet (Phase 1 workstream pending)`);

/**
 * US-only gate for HTML surfaces (owner decision 2026-10-05). API/MCP/feeds/cards stay world-readable.
 * Non-US visitors get a static, noindex page with no scripts, no cookies, no pixels.
 */
/** Google policy: ad landing pages must be reachable by AdsBot regardless of geography (support.google.com/adspolicy/answer/16428223). */
const ADS_REVIEW_BOTS = /AdsBot-Google|AdsBot-Google-Mobile|Google-Ads-Overview|Mediapartners-Google|TikTok|Bytespider|ByteDance/i;

export const usOnlyHtml: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.env.ENVIRONMENT !== "production" && c.req.header("x-test-country") === undefined) return next();
  const country = c.req.header("x-test-country") ?? c.get("cfCountry");
  if (isUsRequest(country)) return next();
  if (ADS_REVIEW_BOTS.test(c.req.header("user-agent") ?? "")) return next();
  c.header("X-Robots-Tag", "noindex");
  c.header("Cache-Control", "public, max-age=3600");
  return c.html(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${BRAND.name}</title></head>` +
      `<body style="font-family:system-ui;background:#21283d;color:#fff;display:grid;place-items:center;height:100vh;margin:0">` +
      `<main style="max-width:36rem;padding:1rem"><h1>${BRAND.name}</h1><p>${BRAND.name} is currently available in the United States only.</p>` +
      `<p>Our open data API and MCP server remain available worldwide: <a style="color:#F5CE66" href="${BRAND.siteOrigin}/openapi.json">openapi.json</a>.</p></main></body></html>`,
    451,
  );
};

/** Honors Global Privacy Control: downstream templates check this to drop pixels. */
export function gpcEnabled(c: Context<AppEnv>): boolean {
  return c.req.header("sec-gpc") === "1";
}

export const onError = (err: Error, c: Context<AppEnv>) => {
  console.error("unhandled", { requestId: c.get("requestId"), message: err.message, stack: err.stack });
  return fail(c, "internal", "Something went wrong");
};
