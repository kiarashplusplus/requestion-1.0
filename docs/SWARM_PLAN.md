# Swarm execution plan

Integration branch: `claude/gas-prices-app-rebuild-4ww0r7`. Each workstream (WS) works on `ws/<letter>-<name>` branched from the P0 commit and opens a PR into the integration branch with title prefix `[WS-X]`. Ownership is enforced by `scripts/check-ownership.ts` against `OWNERSHIP.json`.

## Phases

| Phase | Who | Exit gate |
|---|---|---|
| **P0 contracts + scaffold** | WS-A (done in this repo's first commit) | G0: `pnpm check` green; every route stub answers 501 with the error envelope; D1 migration applies in tests; `wrangler deploy --dry-run` passes; `docs/contracts.md` complete |
| **P1 parallel build** | WS-B … WS-P | G1 per PR: ownership check passes on the diff; WS acceptance commands pass after rebase onto integration; owned `docs/` updated; no migration or binding edits |
| **P2 integration** | orchestrator + original agents for fixes | Merge order **A→B→C→D→E→H→G→F→N→I→P→K** (J is phase 2); `scripts/smoke.sh` green locally and on a Worker Preview URL |
| **P3 MVP done** | orchestrator | Definition of done below |

**Critical path:** A → B (`us-eia-weekly` adapter) → D (ingest) → F (posts) → N (email) → smoke. F must work with `macro: null` and `digest: null`, so C and G never block. P depends on F's landing pages and N's subscribe event.

## Workstreams

| WS | Scope | Owns (see OWNERSHIP.json) | Size |
|---|---|---|---|
| **A** | Monorepo, toolchain, zod contracts, registries, D1 `0001_init.sql` + dev seed, `wrangler.jsonc` with every binding, Hono root + stubs, vitest + migrations, ownership check, docs | root, `packages/shared`, `packages/db`, api config/entry/stubs | M (done) |
| **B** | `us-eia-weekly` adapter: EIA v2 `petroleum/pri/gnd` route, facets/series for national, PADD, 9 states, 10 metros, 4 fuels; recorded fixtures + `expected.json`; US region registry extended to top-50 metros mapped to state/PADD series; `docs/feeds.md` with license/attribution verdicts; phase-2 adapter list (EU bulletin, Tankerkönig, data.gouv.fr, UK CMA, NSW/WA, NRCan) | `packages/feeds`, `registry/regions/us.ts`, `registry/feeds/*` | M |
| **C** | BLS v2 adapter (national `CUUR0000SA0/SA0E/SETB/SETB01`, 4 regions, 23 metros; key; attribution statement; missing 2025-10 handled), `MacroWorkflow` steps, `buildMacroContext()` producing one sentence with sources; real-vs-nominal helper; phase-2 list | `packages/macro`, `workflows/macro.ts`, `src/macro/**` | S |
| **D** | `IngestWorkflow`: due feeds from cron → fetch (`fetchUpstream` with `cf.cacheTtl`, `FIXTURE_MODE`) → R2 raw → normalize → D1 (`INSERT OR IGNORE`, ≤ 90 bound params, numbered persist steps) → rollups → KV latest (one write per key) → `feed_run` → Analytics Engine freshness → `Cache-Tag` purge → `POSTS.create({reason:'data-changed'})` → prune > 400 d; verify Workflow `schedules` vs `scheduled()` dispatcher and document the dev loop | `workflows/ingest.ts`, `src/ingest/**`, `routes/dev.ts`, `db/src/writers` | L |
| **E** | `/v1/*` with `@hono/zod-openapi`: latest, history (7d/30d/1y via rollups), regions, ranking, posts, posts/:slug, macro, meta/feeds; readers; `API_RL`; Cache-Control + Cache-Tag; `/openapi.json`; typed `api-client.ts` | `routes/v1.ts`, `src/api/**`, `db/src/readers`, `shared/src/api-client.ts` | M |
| **F** | Posts engine: `POST /v1/requests` intake (Turnstile on web, `REQUEST_RL`), gate, deterministic build, Hono JSX SSR for `/p/<slug>`, hubs, legal/transparency pages (port keepsake.ing wording with deltas in brief §9), JSON-LD graph (NewsArticle + Dataset + BreadcrumbList), sitemaps, RSS/JSON Feed, oEmbed/embed, CSV/JSON data, IndexNow, `PostsWorkflow`, noindex handling, request form with email capture + Notice at Collection, GPC-aware pixel slot | `routes/posts.ts`, `src/posts/**`, `workflows/posts.ts`, `docs/legal/**` | L |
| **G** | News re-digest: GDELT DOC 2.0 (`sourcecountry:US`, serialized, KV-cached), GNews, EIA RSS, curated US local RSS registry; metadata-only extraction (≤ 300-char snippet); canonical-URL + SimHash dedupe; `NewsWorkflow`; Workers AI (`gpt-oss-20b` extract/classify, `gpt-oss-120b` write) via AI Gateway with JSON schema; numeric + citation fact-check; disclosure; `DIGEST_DAILY_BUDGET` | `packages/news`, `workflows/news.ts`, `src/digest/**` | L |
| **H** | satori + resvg `PriceCard.tsx` (brand tokens) in variants og 1200×630 / feed 1080×1350 / story 1080×1920 / sticker 640×480@2× (transparent); sparkline; JPEG/WebP encode (jSquash wasm) for IG/TikTok; `/card/*`; Instagram Graph API daily carousel + Story publisher job (Standard Access, JPEG ≤ 8 MB, ≤ 10 slides, 100 posts/24 h); TikTok semi-manual queue (render → push → Share Kit) | `packages/card`, `routes/cards.ts`, `src/social/**` | M |
| **I** | `/mcp` via `createMcpHandler` (stateless, authless, 6 read-only tools with `title` + `readOnlyHint`, `ttlMs`/`cacheScope`, results carry `source`, `as_of`, `canonical_url`, `license`); `/llms.txt`; `/.well-known/{mcp-registry-auth, indexnow/<key>.txt, gpc.json, openai-apps-challenge}`; `mcp/server.json` as `news.request/gas-prices` | `routes/agent.ts`, `src/mcp/**`, `src/agent/**`, `mcp/**` | S |
| **J (phase 2)** | Expo SDK 57 app (Router, TanStack Query, `expo-background-task`, IG Stories + TikTok Share Kit module), `eas.json`; `apps/web` keeps the static shell until then | `apps/mobile`, `apps/web` | L |
| **K** | CI (typecheck, lint, test, `wrangler types --check`, dry-run deploys, ownership, OpenAPI/robots/sitemap/JSON-LD validators), Workers Builds config (two Workers, root dirs, watch paths, `d1 migrations apply --remote`), Worker Previews + staging env re-declaring every binding, secrets inventory, Cloudflare zone settings (managed robots.txt OFF, AI bot policy never Training=Block at category level, allow citation bots, Crawler Hints on), `scripts/smoke.sh`, runbook | `.github`, `scripts`, `docs/runbook.md`, `docs/deploy.md` | M |
| **N** | Notifications (US): email capture with purpose line + consent log, transactional "page is live", weekly digest + ≥ 10¢ alert jobs, CAN-SPAM footer with postal address, `List-Unsubscribe` one-click (RFC 8058), suppression list, SPF/DKIM/DMARC, provider adapter (Cloudflare Email Sending if GA, else Resend/SES; verify status/limits/prices against primary sources), WhatsApp Channel + `wa.me` capture | `src/notify/**` | M |
| **P** | Paid + measurement: Zaraz or Workers-side GA4/Google Ads/TikTok Events API with `event_id` dedup, GPC/RDP/LDU gating, `/.well-known/gpc.json`, "Your Privacy Choices" toggle wiring, `/c/{slug}` short links → Analytics Engine, per-DMA Search campaign + Spark/carousel configs as code, ad customizer price feed, midterm quiet-window rules; see `docs/paid.md` | `src/track/**`, `ads/**` | M |

Size: S ≈ 0.5–1 agent-day, M ≈ 1–2, L ≈ 3–5.

## Conflict-avoidance rules (CI-enforced)
- Exclusive path ownership; cross-WS notes go in new files `docs/decisions/ADR-<ws>-NNN.md`.
- Registries are append-only, one file per entry; `registry/index.ts` barrel edits are the only shared touch (keep them one-line imports).
- Stub-then-fill: route and workflow modules exist; owners replace contents. `apps/api/src/index.ts`, `middleware.ts`, `env.ts`, `wrangler.jsonc` and `packages/db/migrations/**` are frozen in P1 (orchestrator contracts PR only).
- Dependencies are pinned in `pnpm-workspace.yaml` `catalog:`; a WS adds deps only in its own `package.json` with `catalog:` refs (new catalog entries via contracts PR). Lockfile conflicts: re-run `pnpm install`, never hand-merge.
- Hub routes per MVP region are generated by `scripts/gen-routes.ts` (WS-K) and asserted by a test when custom-domain routes are enabled.

## Gates
- **G0:** `pnpm check` + `pnpm --filter @request.news/api dry-run` green; stubs answer 501 with envelope; seed loads; contracts doc complete.
- **G1 (per PR):** `pnpm tsx scripts/check-ownership.ts <WS>`; WS acceptance commands; owned docs updated; no migration/binding edits.
- **G2:** `scripts/smoke.sh` green locally and against a Worker Preview URL: dev-trigger ingest/macro/news → `/v1/latest?country=US` schema → `POST /v1/requests` → `/p/<slug>` JSON-LD validation + `Cache-Tag` → sitemaps/feeds/oEmbed/data/robots/openapi validators → card PNG 1200×630 → MCP Inspector `tools/list` = 6 and `tools/call get_latest` → US gate (DE → 451 noindex, US → 200, AdsBot → 200) → GPC suppresses pixel payload.

## Risk register
Feed licensing gates `/data/*` via `Feed.license.redistributable` · upstream 403/IP throttles → fixtures + `RECORD_FIXTURES=1`, serialize GDELT · KV 1 write/s/key · Workflows 10k steps / 1 MiB payloads (R2 keys as step outputs) · D1 100 bound params · satori TTF-only + wasm init · Google scaled-content/doorway policy (demand gate, dedupe, noindex, hubs) · Workers AI hallucination (fact-check gate) · news copyright (metadata-only, honest UA, respect `Content-Signal`) · ad-policy (no officials/policy in creative, AdsBot must pass the geo-gate, prices match page) · US state privacy (GPC everywhere, no precise geolocation, 18+ targeting) · cost ceilings (`DIGEST_DAILY_BUDGET`, R2 lifecycle 90 d on `raw/`, traces 0.1) · `cf` CLI forbidden while beta.

## Definition of done (MVP)
- [ ] `us-eia-weekly` ingests from fixtures and live; `meta:v1:feeds` lag within cadence.
- [ ] `/v1/*` documented in `/openapi.json`, cached, rate-limited.
- [ ] A request (web form with Turnstile, or API) yields exactly one published post per (region, fuel, week) when the gate passes, else `noindex`.
- [ ] `/p/<slug>` passes Rich Results Test (NewsArticle + Dataset + BreadcrumbList); visible byline/dateline/published/updated; CPI sentence with sources; digest only when `accepted`, with disclosure and per-claim links.
- [ ] Sitemaps, news sitemap, feeds, oEmbed, embed, data, robots, llms, well-known served and validated; IndexNow fires on publish/update.
- [ ] Cards render in 4 variants; Instagram publisher job posts a carousel to the brand account in staging.
- [ ] MCP Inspector lists and calls all 6 tools.
- [ ] Email: transactional + weekly digest + alerts with one-click unsubscribe and suppression; CAN-SPAM footer.
- [ ] Measurement: GPC-gated pixels, conversion events firing, "Your Privacy Choices" works.
- [ ] Both Workers deploy via Workers Builds; Worker Preview URL per PR; staging env complete.
