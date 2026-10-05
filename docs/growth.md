# Growth loops (research as of 2026-10-05)

## Climate
- Google Search referrals to publishers fell 40.2 % YoY (Chartbeat, Sept 2026); small publishers lost ~60 % over two years; Discover −34 %. Zero-click searches 68 % of US Google searches. AI Overviews cut clicks roughly in half when shown.
- AI referrals grew 8× in two years but remain ~0.01 % of traffic and convert better than search (Microsoft Clarity: ~1.66 % vs 0.15 % sign-up). AI citations concentrate on top-20 outlets (Reuters 22.8 %, AP 12.2 % of OpenAI news citations).
- Google News inclusion is algorithmic; Publisher Center manual applications closed Oct 2025. Apple News is closed to applications. Google Preferred Sources (global since Dec 2025) roughly doubles clicks for readers who select a source; an embeddable button shipped Aug 2026.
- 10 % of people use AI chatbots for news weekly (16 % under 35); trust in news 37 %, in chatbots 20 % (Reuters DNR 2026).
- Gas prices are a top story: national average $2.98 (Feb 2026) → $4.63 peak (May 11) → $4.42 (Sept 30); gasoline CPI +27.4 % YoY in Aug 2026; next CPI 2026-10-14; midterms 2026-11-03. 213 US news-desert counties; 1,524 single-source counties (Medill 2025).

## Ranked loops for request.news (zero audience, solo founder)
1. **Citation loop (data as PR + embeds).** Publish a press-ready weekly number per place; outlets quote it → backlinks → rankings → AI citations → more reporters. Evidence: GasBuddy's templated state releases reprinted weekly; a LendingTree gas survey picked up by 9+ Gray TV stations the same day; The Conversation's republish model (~20k republishing sites). Ship: `/p/<slug>` with a quotable sentence + "cite this" box, `/methodology`, `/corrections`, `/press` weekly state releases, `/data/<slug>.csv`, oEmbed cards with a plain brand link (Google forbids keyword-rich widget links). KPI: referring domains/week, pickups, live embeds, branded searches. Killer risk: data provenance or one wrong figure. Time to effect 4–12 weeks; cost: outreach time (HARO relaunched Apr 2025; Qwoted; Source of Sources).
2. **Request → page → alert loop.** Requesting a place captures an email for "alert me when prices move"; every page shows "nearby places requested" and "request yours". Evidence: Nextdoor's 10-households-in-21-days launch gate; Scott's Cheap Flights 300 → 600k subscribers on < $500 marketing; 6AM City ~1.3M subscribers at 45–50 % opens; Axios Local 2M+ subscribers. KPI: request→subscribe ≥ 30 %, alert opens ≥ 40 % (beehiiv avg 41 %), share-sourced requests. Killer risk: thin pages → Google scaled-content enforcement (index only with unique data; AI digest as attributed commentary).
3. **AI/agent citation loop.** Allow OAI-SearchBot, PerplexityBot, Claude-User and Google-Extended; list the MCP server in the MCP Registry (~2,000 servers), ChatGPT Plugin Directory (unified July 2026) and Claude Connectors; canonical URL + "Source: request.news" in every tool result; Preferred Source button. KPI: MCP calls/week, AI sessions and their conversion, citation spot-checks. Killer risk: zero-click (AI referrals fell across assistants in 2026); measure mentions and conversions, not traffic.

## Avoid for now
Aggregator applications (Apple News closed; MSN Partner Hub invite-style; Showcase invite-only); pre-generating every place or a heavy AI re-digest (scaled-content risk); fediverse/Bluesky/Threads as primary (Threads < 0.1 % of referrals; Bluesky users −52 % since Q4 2024); crowdsourced price reports (GasBuddy's moat; moderation cost).

## 90-day sequence
- **Days 0–30:** crawler access + robots + news sitemap; methodology and corrections pages; seed the 50 highest-volatility US places (states + top metros) with embeds and CSV; email capture on request; MCP Registry listing; Google advertiser verification.
- **Days 31–60:** weekly "state of the pump" pitch to ~100 local TV and newspaper digital desks (news-desert-adjacent first); HARO/Qwoted; CPI-day (Oct 14) data note; midterm "price by district" factual angle; ChatGPT and Claude directory submissions.
- **Days 61–90:** expand pages only to requested neighbours; weekly digest; local subreddits under their rules; cut zero-impression pages.

## Implementation table
| Loop | Mechanism | Must ship | KPI |
|---|---|---|---|
| Citation | weekly local number → quotes → backlinks | `/p/*` cite box, `/methodology`, `/corrections`, `/press`, `/data/*.csv` | referring domains/week |
| Embed | free card with brand attribution | `/embed/<slug>`, `/oembed`, share PNG, republish button | live embeds, impressions |
| Request → alert | opt-in at request → page → alerts → shares | `/request` with email, alert rules, "nearby requested", noindex gate | request→subscribe %, opens |
| AI/agent | canonical structured source cited/called | crawler allow-list, `/mcp` with canonical URLs, registry listings, Preferred Source button | MCP calls/week, AI sessions |
| Search/Top Stories | timely unique data pages | news sitemap, NewsArticle schema, 1200 px images, visible timestamps | GSC impressions, indexed share |
