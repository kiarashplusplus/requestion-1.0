# Paid acquisition & US privacy (research as of 2026-10-05; UNVERIFIED items marked)

Owner decisions: US-only product; Google Ads + TikTok Ads from launch (target Mon 2026-10-12); no monetization; 18+ ad targeting.

## Five findings that shape implementation
1. **The US geo-gate must let Google's AdsBot through** (`AdsBot-Google`, `AdsBot-Google-Mobile`). A "not available in your location" landing page is a Google Ads policy violation (support.google.com/adspolicy/answer/16428223). Implemented in `apps/api/src/middleware.ts`.
2. **Connecticut (since 2026-07-01)** applies with no visitor minimum to anyone who "offers personal data for sale"; pixel sharing may count (UNVERIFIED). Honor Global Privacy Control everywhere from day one.
3. **TikTok bans any ad touching policy** ("promote or oppose government policies or officials"). "Why gas is up" creative must cite market causes only.
4. **Server-side Google conversion uploads require the Data Manager API** (`UploadClickConversions` closed to new users since 2026-06-15). Rely on gtag/Zaraz for click attribution; keep `gclid`/`_gcl_aw` intact.
5. **TikTok minimums:** $50/day per campaign, $20/day per ad group; a small test must omit the campaign-level budget.

## US privacy baseline (no consent banner; opt-out model)
- Laws: CCPA/CPRA ($26.6M revenue or 100k CA consumers "sold/shared"; pixels = sharing), Connecticut (35k, or any sale, no minimum), Texas (no threshold; SBA small businesses exempt except consent before selling sensitive data), Indiana/Kentucky/Rhode Island/Oregon 2026 phases, 12+ states require honoring GPC.
- **Never prompt for browser geolocation** (precise geolocation is sensitive data; Oregon bans its sale). Use `request.cf.city` or the typed place.
- Implement nationwide: privacy policy (categories, pixels/vendors, "sharing" for cross-context ads, opt-out/GPC, email, retention, contact, 18+ targeting), Notice at Collection beside the email form, footer **"Your Privacy Choices"** toggle, honor `Sec-GPC: 1` (+ `navigator.globalPrivacyControl`), publish `/.well-known/gpc.json` `{"gpc": true, "lastUpdate": "YYYY-MM-DD"}`.
- Opted-out visitor: Google tag `restricted_data_processing: true` + `allow_ad_personalization_signals: false` (or `zaraz.consent.set({ads:false})`); TikTok: load no Pixel, send no Events API calls (LDU flag as fallback). Google auto-applies RDP on GPC in applicable states. No Customer Match uploads (Google is not a service provider for it).
- CAN-SPAM for email: physical postal address, opt-out within 10 business days, truthful headers; up to $53,088 per email.

## Measurement architecture on Cloudflare
- **Option A (simplest):** Cloudflare Zaraz (1M events/month free, then $5/M) running GA4 + Google Ads conversion + TikTok Events API v2, consent purposes driven by the GPC/opt-out flag. Enhanced Conversions reportedly unsupported in Zaraz (UNVERIFIED); Zaraz changelog is quiet since 2025.
- **Option B (if Enhanced Conversions matter):** gtag + TikTok Pixel client-side; Worker sends TikTok Events API (`POST https://business-api.tiktok.com/open_api/v1.3/event/track/`, `event_id` dedup within 48 h, `ttclid`/`_ttp`, SHA-256 email, IP, UA) and GA4 Measurement Protocol (`/mp/collect`, store `client_id` at signup).
- Worker must preserve `gclid`, `ttclid`, UTMs; TikTok in-app browser drops referrer; never use pageview as a conversion (TikTok preloading); do not use TikTok Instant Pages (bypasses the site).

| Event | GA4 | Google Ads | TikTok | Role |
|---|---|---|---|---|
| Subscribe confirmed | `sign_up` | Subscribe | `CompleteRegistration` | Primary |
| Place request | `generate_lead` | Submit lead form | `SubmitForm` | Primary |
| Alert signup | `sign_up` | — | `Subscribe` | Primary |
| Engaged view (75% scroll + 30 s) | `engaged_view` | — | `ViewContent` | Secondary |
| Share | `share` | — | `ClickButton` | Secondary |

## Google Ads
- **Election ads** = ads featuring a current officeholder/candidate (federal, state, territory), a party, or a state/territory ballot measure → verification (two steps, up to 5 business days each) and restricted targeting. Factual price ads are not election ads; naming a governor, the President, a party or a gas-tax ballot measure makes them one. 2024 had a post-election pause Nov 5–11; assume the same around 2026-11-03 (UNVERIFIED).
- Misrepresentation: no clickbait/sensationalist text, no misleading pricing; **ad price must match the landing page** and carry an "as of" date. Editorial: no gimmicky caps, no repeated punctuation, no emoji. Landing pages: no content "replicated from another source without adding value" (our verified data satisfies this).
- Start **advertiser verification on day 1** (up to 5 business days; deadlines cannot be extended). Limited ad serving applies to new advertisers (pin domain to headline 1).
- Campaigns: **Search** per-DMA ad groups (210 DMAs), `{LOCATION(City)}` insertion, ad customizers for daily price (updated from the same JSON the page uses; drop the number if stale), negatives for "gas station near me". DSA is being retired into AI Max (no new DSA from Sept 2026). Demand Gen only as a reach test (needs ~50 conversions to learn). Skip PMax and Display remarketing at launch.
- RSA: ≤ 15 headlines (30 chars), ≤ 4 descriptions (90), two 15-char paths. Demand Gen images 1200×628, 1200×1200, 960×1200 (≤ 5 MB); logo 1200×1200 ≤ 150 KB.
- Google Ads API access: Explorer 2,880 ops/day suffices for 20 metro ad groups + daily customizer updates; or Google Ads Scripts fetching our price JSON.
- Benchmarks (third-party, UNVERIFIED): "gas prices near me" ~368k US searches/month, ~$2.27 CPC; expect $0.40–2.50 CPC on informational queries.

## TikTok Ads
- Policy: no political/issue content (officials, candidates, parties, ballot measures, legislative/executive outcomes, "government policies"); misinformation rules; no exaggeration/fake buttons; AI-generated/edited content needs the AIGC label or disclaimer (data cards exempt; AI voiceover not). Landing page must be reachable from the targeted market (reviewer reachability from outside the US UNVERIFIED → geo-gate also allows TikTok/Bytespider UAs).
- Account review < 24 h; business verification ≤ 2 business days at a spend threshold. Business account: Commercial Music Library only.
- Campaigns: In-Feed **Spark Ads** (boost brand posts; auth codes 7–365 days) + **image carousel ads** (2–35 images at 1200×628 / 640×640 / 720×1280, ~100 KB each, music required). Website Conversions objective; Smart+ not at launch (needs 10–30× CPA history). Targeting by state/DMA/city/ZIP (≤ 3,000 locations per ad group).
- Measurement: Pixel + Events API with `event_id` dedup, `ttclid` cookie ≥ 28 days, SHA-256 email/phone, IP/UA match keys; Marketing API review 2–3 business days (not needed at launch).
- Creative: 9:16 1080×1920, 9–15 s best, bottom ~340 px clear; display name ≤ 20 chars; captions no links/@/hashtags. Benchmarks (secondary): CPM $6–14, CPC ~$1.

## Six-week launch plan (Mon 2026-10-12 → 2026-11-29; Election Day Tue 2026-11-03; Thanksgiving Thu 2026-11-26)
Markets: top-20 DMAs as a stand-in (re-rank with Keyword Planner in week 1): NYC, LA, Chicago, Philadelphia, Dallas–Fort Worth, Houston, Atlanta, DC, SF Bay Area, Boston, Phoenix, Seattle, Tampa, Detroit, Minneapolis, Orlando, Denver, Miami, Cleveland, Sacramento.

| Weeks | Google | TikTok |
|---|---|---|
| 1–2 (Oct 12–25) | Search metros $30/day, Maximize Clicks, $1.50 CPC cap, one ad group per DMA, presence-only; Search "why up" $10/day | Website Conversions, 2 ad groups × $25/day (no campaign budget); Spark + carousel |
| 3 (Oct 26–Nov 1) | Switch to Maximize Conversions at 15+ conversions (UNVERIFIED threshold); add Demand Gen $25/day test | Keep winners only |
| Quiet window (Oct 27–Nov 10) | Factual price creative only; pause "why up"; no "vote/midterm/election/ballot" | Pause "why up"; ad landing pages hide the AI news digest (could mention officials) |
| 5–6 (Nov 9–22) | Resume "why up" after any post-election pause lifts | Resume |
| Thanksgiving (Nov 16–29) | Add "thanksgiving gas prices", "road trip gas cost"; +50% budget Nov 21–25 | "Driving for Thanksgiving? [City] regular $X, Y¢ vs last week. Set a price alert." |

Total ≈ $90–125/day, ≈ $4.5–5.5k for the plan. Creative variants: (1) hero price card "Phoenix regular $3.41 avg, Oct 12"; (2) vs national "18¢ below U.S. avg"; (3) why up this week (market causes only).

Kill rules: Google ad group CTR < 3% after 1,000 impressions → rewrite; avg CPC > $2.00 after 5 days → lower cap/pause; cost per subscribe > $25 after $150/ad group → pause. TikTok CTR < 0.5% after 10k impressions → replace creative; cost per subscribe > $20 after $100 → replace; frequency > 3/week → refresh. Engaged-session rate < 40% → fix the page before adding spend.
Estimates: Google Search CPC $0.40–2.50, CPA $10–40; TikTok CPM $6–14, CPC $0.50–1.50, CPA $10–35.

## Policy guardrails (both platforms)
Never name officials, candidates, parties, ballot measures, taxes or policies in ads. No election words Oct 27–Nov 10. Prices in ads match the page with "as of" date. No "!!", all caps, emoji (Google). No AI avatars/voices unless labeled. Start Google verification day 1. 18+ targeting everywhere.

## UNVERIFIED
2026 Google post-election pause; TikTok "issue ad" exact wording and AI-label mandate date (2026-07-21); TikTok `limited_data_use` field placement; Google RDP state list; California 2026 "display GPC honored" rule; Connecticut treatment of pixel sharing as sale; Colorado/Virginia thresholds; Zaraz Enhanced Conversions; all third-party CPC/CPM benchmarks; DMA ranking; TikTok reviewer reachability of a US-only site; TikTok interest names/lookalike minimums; Spark Ads without code for own posts; Google Ads Scripts limits; learning-phase thresholds.
