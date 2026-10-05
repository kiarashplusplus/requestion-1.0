# Contracts (Phase 0, frozen during Phase 1)

Source of truth is code in `packages/shared/src`. This page indexes it; change code and docs together via an orchestrator "contracts PR".

## Enums (`schemas/enums.ts`)
`Fuel` gasoline_regular | gasoline_midgrade | gasoline_premium | diesel | lpg | cng | e85 · `Unit` L | gal · `RegionKind` country | padd | state | metro | city · `Granularity` country | region | city | station · `Periodicity` instant | daily | weekly | monthly | quarterly | annual · `ScheduleKey` hourly | daily · `MacroIndicator` cpi_all_index | cpi_all_yoy | cpi_energy_yoy | cpi_fuel_index | cpi_fuel_yoy | cpi_gasoline_index | cpi_gasoline_yoy · `PostStatus` draft | published | noindex | archived · `RequestStatus` queued | published | rejected | duplicate · `DigestStatus` accepted | rejected | skipped · `SubscriptionKind` transactional | weekly_digest | price_alert · `ErrorCode` not_found | validation | rate_limited | upstream | gate_failed | turnstile | geo_restricted | internal | not_implemented

## Entities (`schemas/entities.ts`)
`Region` (code `^[A-Z]{2}(-[A-Z0-9]+){0,2}$`, slug `us/tx/houston`, dateline), `Feed` (+ `license.redistributable`, `secret`, `phase`), `PriceObservation`, `FuelSnapshot`, `LatestRegion` / `LatestCountry` (KV, `v: 1`), `FeedFreshness`, `MacroObservation`, `MacroContext`, `NewsItem` (id = sha256(canonicalUrl)), `Digest`, `Source`, `PostRequest`, `PostData`, `Post` (title ≤ 110, `updatedAt` only changes with `dataHash`), `PostIndexEntry`, `Subscriber` (consent log), `RequestRow`.

## Envelopes (`schemas/envelopes.ts`)
Success `{ data, meta: { asOf, sources, license, generatedAt, requestId } }`. Error `{ error: { code, message, details?, requestId } }` with `HTTP_STATUS` map (404/422/429/502/409/400/451/500/501). Every response carries `x-request-id`.

## Keys (`keys.ts`)
KV: `latest:v1:global`, `latest:v1:country:{CC}`, `latest:v1:country:{CC}:region:{R}`, `meta:v1:feeds`, `macro:v1:country:{CC}`, `fx:v1:latest`, `posts:v1:index`, `digest:budget:{yyyy-mm-dd}`. One write per key per run.
Cache-Tag: `latest`, `country:{CC}`, `region:{R}`, `post:{slug}`, `feed:{R}`, `sitemap`, `card`. `CACHE_CONTROL` presets: latest 300/3600 swr, history 3600, html 300/s-maxage 3600, card 3600, none.
R2: `raw/{feed}/{yyyy}/{mm}/{dd}/{runId}.json`, `normalized/{feed}/{runId}.json`, `cards/{kind}/{id}/{variant}/{dataVersion}.png`.
Workflow steps: `step(...parts)` enforces `^[a-z]+(:[a-z0-9-]+)*$`. Vocabulary: `select-feeds`, `feed:{id}:fetch|normalize|persist:{nn}`, `rollup:{CC}`, `kv:latest:{CC}`, `kv:global`, `kv:meta-feeds`, `metrics`, `purge`, `posts:trigger`, `macro:{seriesId}:fetch|persist`, `kv:macro:{CC}`, `news:discover:{CC}`, `news:extract:{nn}`, `news:dedupe`, `digest:{postId}`, `factcheck:{postId}`, `post:gate|build|render-check:{slug}`, `kv:posts-index`, `indexnow`.

## Helpers (`helpers.ts`)
`convertUnit`, `isoWeek(date, tz)`, `postSlug(region, fuel, week)` → `houston-tx-gas-prices-2026-w41`, `canonicalPostUrl`, `hubUrl`, `cardUrl(kind, id, variant, v)`, `sha256Hex`, `isUsRequest(cfCountry)`, `formatUsd`, `formatDeltaCents`.

## Registry (`registry/`)
`getRegion(code)` (copy or null), `getRegionBySlug`, `listRegions(country?, kind?)` (summary fields only), `searchRegions(q, country?)`, `getFeed(id)`, `listFeeds({ enabledOnly, phase, scheduleKey })`, `SCHEDULE_FOR_CRON`. Append one file per entry under `registry/regions/` and `registry/feeds/`; barrels are hand-maintained in `registry/index.ts` until codegen lands.

## Routes (owned by stubs in `apps/api/src/routes/*.ts`, mount order frozen in `index.ts`)
`agent`: `/robots.txt` (live), `/llms.txt`, `/openapi.json`, `/mcp`, `/.well-known/*` · `cards`: `/card/:kind/:id/:variant.png?v=` · `v1`: `/v1/regions` (live), `/v1/latest`, `/v1/history`, `/v1/ranking`, `/v1/posts`, `/v1/posts/:slug`, `/v1/macro`, `/v1/meta/feeds`, `POST /v1/requests` · `dev`: `POST /__dev/workflow/:name` (token, non-prod) · `posts`: `/sitemap.xml`, `/sitemaps/:name`, `/news-sitemap.xml`, `/feed/:region`, `/oembed`, `/data/:slug`, and US-gated HTML `/p/:slug`, `/embed/:slug`, `/request`, `/us`, `/us/:region`, `/us/:region/:city`, `/about`, `/methodology`, `/editorial-policy`, `/corrections`, `/contact`, `/press`, `/privacy`, `/terms`, `/your-privacy-choices`, `/data-license`.

## Gate for publishing a post (WS-F)
Publish iff ≥ 5 observations for (region, fuel) in the last 7 days AND latest observation ≤ 72 h old AND no published post for (region, fuel, ISO week) (else `request_count++`). Otherwise `status = noindex`, `X-Robots-Tag: noindex`, excluded from sitemaps/feeds/IndexNow/`posts:v1:index`.

## Fact-check for digests (WS-G)
Every numeric token in the output must match a computed/macro number (±0.5 in the last digit, same period and geography) or a number inside a cited snippet ("reported by X"). Every bullet cites ≥ 1 `newsId`. No quotes longer than a short phrase. One retry with the mismatch list, then `skipped`. Posts render without a digest when none is `accepted`.

## Workflow params
`INGEST`/`MACRO`/`NEWS`: `{ cron, scheduledTime }`. `POSTS`: `{ reason: 'data-changed', regions }` | `{ reason: 'request', requestId, regionCode, fuel }`.

## Bindings (`apps/api/wrangler.jsonc`)
`LATEST` KV · `DB` D1 (`packages/db/migrations`) · `RAW` R2 · `INGEST`/`MACRO`/`NEWS`/`POSTS` Workflows · `METRICS` Analytics Engine · `API_RL` 120/60 s, `REQUEST_RL` 5/60 s · `AI` · vars `API_VERSION`, `SITE_ORIGIN`, `ENVIRONMENT`, `DIGEST_DAILY_BUDGET`, `FIXTURE_MODE` · secrets per `.dev.vars.example`.
