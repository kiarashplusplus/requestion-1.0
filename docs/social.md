# Social distribution: TikTok + Instagram (research as of 2026-10-05; Snapchat not pursued)

Context: September 2026 averaged $4.33 nationally (50¢ above the previous September record); week-over-week deltas of +13¢ and +16¢ in mid-September are exactly the "gas up 12¢ in Houston" hook.

## Instagram
- **Stories share from the app:** iOS `instagram-stories://share?source_application=<FB_APP_ID>` with pasteboard keys `com.instagram.sharedSticker.backgroundImage|stickerImage|backgroundTopColor|backgroundBottomColor`; Android intent `com.instagram.share.ADD_TO_STORY` with `content://` URIs. **Facebook App ID mandatory** (since Jan 2023). Background JPG/PNG ≥ 720×1280 (9:16); sticker PNG 640×480 recommended, transparency OK. No programmatic link sticker (users add one manually) → print URL + QR on the asset. `react-native-share` 12.3.1 has `Social.InstagramStories` and an Expo config plugin (needs prebuild). Web: `navigator.share({files})` (~93 % support) with a download fallback.
- **Brand-account automation is allowed:** Graph API with Instagram Login (`instagram_business_basic`, `instagram_business_content_publish`); **Standard Access needs no App Review for your own account**; 100 API posts per rolling 24 h; carousels ≤ 10 via API; **JPEG only** (≤ 8 MB, 4:5–1.91:1, 320–1440 px) → encode satori PNG to JPEG on Workers; Stories via API (no link/poll stickers); Collab posts via `collaborators` (≤ 3 usernames, not Stories); Trial Reels show to non-followers first (good at zero followers); hashtags capped at 5 (Dec 2025); grid crops to 3:4 → post 1080×1350 with key content in the central ~1012 px. Business accounts get the Meta Sound Collection, not trending music.
- **What performs:** carousels (Socialinsider Q2 2026: 0.50 % engagement vs Reels 0.48 %, images 0.33 %; Fanpage Karma: +13 % reach, 1.5× engagement vs Reels). Core owned format: 5–8 slide "weekly city gas report" carousel.
- **Safe zones (1080×1920):** ~270 px top, ~670 px bottom, ~65 px sides (Meta ad rule, stricter than organic).
- **Add Yours** sticker chains can only be created in-app; seed "Gas in my town this week ⛽" from the brand account.

## TikTok
- **Share from the app:** Share Kit. iOS passes Photos-library `localIdentifiers` (save the card to Photos first), 1–35 images or ≤ 12 videos, aspect 1/2.2–2.2, `redirectURI` must be a universal link; Android FileProvider `content://` URIs. No caption/hashtag prefill → copy a caption to the clipboard. `react-native-share` has no TikTok target; `tiktok-opensdk-react-native` 0.10.9 is unverified → budget a small Expo Module; fallback is the system share sheet (TikTok appears, no callback).
- **Own-account posting automation is disallowed:** TikTok lists "a utility tool to help upload contents to the account(s) you or your team manages" as unacceptable; unaudited clients are SELF_ONLY with ≤ 5 users/day. Use an audited scheduler or a semi-manual flow (Worker renders the daily carousel → push to the founder's phone → Share Kit → pick a Commercial Music Library sound). Photo posts JPEG/WebP only (no PNG), ≤ 1080p, ≤ 20 MB, titles ≤ 90 chars, 6 calls/min/token.
- **Business account:** bio link from day 1, Commercial Music Library (~1M tracks) only. Hashtags reportedly capped at 5 (UNVERIFIED). Creator Search Insights "content gap" filter → title carousels to "gas prices [city]" / "cheap gas near me" gaps.
- **What performs:** photo posts +81 % engagement and +82 % likes vs video but ~⅓ fewer shares (Fanpage Karma, Jan–May 2025). Carousels for saves/comments ("comment your city"); 15–20 s videos for shares.
- **Policy:** unoriginal/watermarked static images are ineligible for the For You feed; realistic AI content must be labeled (disclose "AI summary" anyway); **paid political and issue ads are banned** → boosts that mention policy can be rejected; engagement bots prohibited.
- **Safe zones (1080×1920):** ~130 px top, 480–560 px bottom, ~140 px right (secondary sources).

## Other platforms (short)
Threads API (same Meta app; JPEG/PNG ≤ 8 MB; 500 chars; carousels 2–20; 250 posts/24 h) and Bluesky (free AT Protocol API; 5,000 points/h) and Telegram channels are fine for automated per-city bots. X API: $0.20 per post containing a URL (skip). Facebook: Share Dialog + og tags only. Reddit: every new OAuth app needs approval (Nov 2025) → manual participation only. Pinterest trial tier is sandbox-only. WhatsApp: `wa.me/?text=` share only; forwards limited. Snapchat: not pursued.

## Image spec table
| Asset | Size | Format | Transparent | Notes |
|---|---|---|---|---|
| IG Story background (share intent) | 1080×1920 (min 720×1280) | PNG/JPG | no | clear 270 top / 670 bottom |
| IG Story sticker | 640×480 (render 2×, UNVERIFIED) | PNG | **yes** | tight cutout over the user's photo |
| IG Feed/carousel (API) | 1080×1350 | **JPEG** ≤ 8 MB | no | survives 3:4 grid crop |
| IG Story (API) | 1080×1920 | JPEG | no | same safe zones |
| TikTok photo | 1080×1920 | **JPEG/WebP** ≤ 20 MB | no | clear 130 top / ~500 bottom / 140 right |
| OG link card | 1200×630 | PNG/JPEG | no | Threads, Bluesky, Facebook, X, iMessage unfurls |

## Design principles (Spotify Wrapped: 500M+ shares on day one; Wordle: 90 → 2M players via the emoji grid)
One hero number (~40 % of the card); colored delta ("▲12¢ this week", red up / green down); city in the headline; comparison ("29¢ above US avg"); "Week of Oct 5 · EIA · request.news" source line; small brand mark + URL + QR (minimal on TikTok, where branding rules are ambiguous for Share Kit); identical weekly template; sticker variant leaves half the frame for the user's own photo.

## Card variants
| Variant | Sizes | Fields | Platforms |
|---|---|---|---|
| Hero price | 1080×1920, 1080×1350, 1200×630 | city, $X.XX, ▲/▼¢ WoW, date, source, URL/QR | all |
| 7-day sparkline | 1080×1350, 1080×1920 | daily points, min/max, delta | carousel slide 2 |
| vs national | 1080×1350, 1080×1920 | city vs US avg, ¢ gap, rank among requested places | slide 3, OG |
| Cheapest stations near you | 1080×1920 | top 3 stations, price, as-of (in-app, user-triggered; phase 2 data) | Story / TikTok share |
| This week in news | 1080×1350 | 3 headlines + outlets + "AI summary" label + link | carousel last slide |
| Sticker cutout | 640×480 @2× | price + delta + city, transparent | IG Story sticker, GIPHY |

## Loops (ranked) and campaign calendar
1. **In-app "share your city's card"** to IG Stories (background + sticker) and TikTok (3-slide photo share), triggered by each weekly publish and any ≥ 10¢ move; caption on clipboard; CTA "Request your city at request.news". KPI: shares/WAU, short-link clicks.
2. **Owned brand carousel engine:** Instagram fully automated (1 carousel "Biggest movers today" + 1 Story daily), TikTok same images semi-manual with a CML sound, one Trial Reel slideshow weekly. KPI: saves, comments, follows, profile link clicks.
3. **Request-your-city UGC chain:** "comment your city" → reply with that city's card; IG Add Yours prompt; public leaderboard; "Now live in X" cards; 3–5 Collab posts with local creators (micro-creators cost ~$200–2,000/post; prefer free personalized cards + Collab reach). GIPHY brand channel (5+ uploads, company-domain email) for searchable Stories stickers.

| Week (from Mon 2026-10-12) | Theme | Instagram | TikTok |
|---|---|---|---|
| W1 | "Record September, where does your city rank?" | daily carousels; launch Add Yours | 1 carousel/day; "comment your city" |
| W2 | winter-blend relief watch | first Collab; Trial Reel | reply-with-card |
| W3 | Halloween "scariest gas prices" | carousel + GIPHY stickers | spooky carousel, CML sound |
| W4 (election week) | strictly factual "what you pay" | carousels, no boosts | carousels, no boosts |
| W5 | "cheapest gas in 30 days" relief + leaderboard | 2 Collabs | Creator Search Insights gaps |
| W6 | Thanksgiving road-trip fill-up cost | carousel + Stories | road-trip carousel; optional $50/day test, non-policy copy |

## Measurement
Instagram's in-app browser strips referrers → per-card short links `request.news/c/{city}-{week}?utm_source=ig&utm_medium=story_sticker` logged by the Worker to Analytics Engine. Image fetch counts do **not** measure IG/TikTok impressions (both re-host media). Universal links: iOS `associatedDomains` + AASA (≤ 128 KB), Android `intentFilters` with `autoVerify` + `/.well-known/assetlinks.json`; the universal link doubles as TikTok's `redirectURI`.

## Skip at launch
Snapchat; own TikTok Direct Post client; X API automation; Reddit/Pinterest APIs; per-city IG/TikTok accounts; Broadcast Channels (< ~10k followers); iMessage/Telegram sticker packs; paid TikTok before organic signal.

## UNVERIFIED
Instagram `attributionURL` behavior; Share Kit branding rule; TikTok 5-hashtag cap; Meta social-issue ad classification for gas prices; Web Share file support per browser; `tiktok-opensdk-react-native` quality; GIPHY–Meta terms; sticker max resolution; TikTok scheduler pricing; Meta minimum budget; 2026 referral/waitlist effectiveness.
