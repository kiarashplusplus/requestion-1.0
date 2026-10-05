# News re-digest (WS-G owns this file; research as of 2026-10-05)

## Sources (US)
| Source | Access | Fields | Terms | Notes |
|---|---|---|---|---|
| GDELT DOC 2.0 `https://api.gdeltproject.org/api/v2/doc/doc?query=(theme:FUELPRICES OR theme:ECON_GASOLINEPRICE OR theme:ECON_OILPRICE) sourcecountry:US&mode=artlist&maxrecords=250&timespan=7d&sort=datedesc&format=json` | none; **1 request per 5 s per IP** (enforced) | url, title, seendate, socialimage, domain, language, sourcecountry (no snippet/body) | unrestricted incl. commercial, cite + link GDELT | noisy; serialize calls, cache 15 min in KV |
| GNews Essential (€49.99/mo) `https://gnews.io/api/v4/search?q=gas+prices&country=us&lang=en&max=25&apikey=…` (path UNVERIFIED) | key | title, description, url, image, source, publishedAt, full content | commercial on paid plans | real-time; primary paid source |
| Mediastack Standard ($24.99/mo) | key | similar | commercial on paid | backup |
| EIA Gasoline & Diesel Update RSS `https://www.eia.gov/petroleum/gasdiesel/includes/gas_diesel_rss.xml`; Today in Energy `https://www.eia.gov/rss/todayinenergy.xml` | none | weekly/daily items | public domain | safest to quote; TWIP discontinued 2025-10-29 |
| Curated US local-outlet RSS registry (`packages/news/src/sources/us.ts`) | none | varies | per outlet | one file per source; respect robots and `Content-Signal` |

**Do not use:** Google News RSS (its `<copyright>`: "solely for … personal, non-commercial use"), NewsAPI.org dev tier (no production), Bing News Search (retired 2025-08-11; "Grounding with Bing" returns an agent answer, not results). AAA newsroom feed is bot-challenged.

## Legal posture (US-only)
Metadata only: title, outlet, date, canonical link, ≤ 300-char snippet from `og:description`. Summaries in our own words (1–2 sentences per item); no verbatim beyond a short phrase; no third-party thumbnails (`socialimage`) without license; honest UA `RequestNewsBot/1.0 (+https://request.news/about)`; respect `robots.txt` and `Content-Signal: ai-input=no` on publisher sites; disclose AI generation. US fair use is unsettled for AI summaries (Copyright Office Part 3, May 2025, sceptical of substitutive uses) → keep digests non-substitutive and link-forward. Counsel review before any non-US expansion (EU DSM Art. 15).

## Pipeline (NewsWorkflow, 6-hourly)
1. **Discover:** GDELT (serialized) + GNews + gov/publisher RSS; store `NewsItem` with `discoveredVia`.
2. **Dedupe:** canonical URL (lowercase host, strip `www.`, `utm_*`, `fbclid`, `gclid`, `/amp`; honor `rel=canonical` when fetched) + 64-bit SimHash over title+snippet shingles, Hamming ≤ 3 = duplicate (Manku et al. 2007).
3. **Relevance:** place match (region aliases + `sourcecountry`) AND fuel term (gas, gasoline, diesel, pump, fuel) → confirm with a `gpt-oss-20b` classifier (JSON schema, `response_format: json_schema`).
4. **Extract claims:** `gpt-oss-20b` → `claims[{ value, unit, currency, period, geography, kind, articleUrl, evidenceSpan ≤ 25 words }]`.
5. **Write digest:** `gpt-oss-120b` (low/medium reasoning) prompted only with our D1 numbers (latest, deltas, national avg, CPI) and the extracted claims; 3–5 bullets, each with `[n]` citations to `newsId`s; no quotes; `lang` = post lang.
6. **Fact-check (gate):** parse every numeric token (`1,234.56`, `€1.95`, `12 %`, `+3.1pp`); each must match a D1/macro value within ±0.5 of the last digit for the same period and geography, or a cited extracted claim rendered as "reported by X"; every bullet cites ≥ 1 existing `newsId`. One regenerate with the mismatch list; then `status = skipped` and the post renders without a digest.
7. **Disclose + attribute:** fixed disclosure string ("AI-generated summary; sources linked; data: EIA, BLS") plus the BLS statement. Store `model`, `promptHash`, `factcheck_json`.
8. **Budget:** `digest:budget:{date}` counter in KV; stop at `DIGEST_DAILY_BUDGET` (default 300/day ≈ 1M tokens ≈ $3.2 per 1k digests on 120b).

## Workers AI facts
`@cf/openai/gpt-oss-120b` $0.35/$0.75 per M tokens (128k ctx, reasoning levels); `gpt-oss-20b` $0.20/$0.30; `llama-4-scout-17b-16e-instruct` $0.27/$0.85 with `guided_json`. Free 10k neurons/day. `response_format: { type: "json_schema" }` accepted by all three (validate with zod; JSON mode can fail with "JSON Mode couldn't be met"; no streaming). AI Gateway: exact-match caching via `cf-aig-cache-ttl` (60 s–1 month), `cf-aig-cache-key`, core features free. Browser Run `/markdown` quick action only for public-domain/government pages (10 browser-min/day free; paid 10 h/month then $0.09/h).
