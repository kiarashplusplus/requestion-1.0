# Fuel-price feeds (WS-B owns this file)

## Launch (phase 1, US-only)

| Feed id | Source | Access | Cadence | Granularity | License / attribution | Status |
|---|---|---|---|---|---|---|
| `us-eia-weekly` | EIA Weekly Retail Gasoline and Diesel Prices, API v2 `https://api.eia.gov/v2/petroleum/pri/gnd/data` | free `api_key` query param (register at eia.gov/opendata; key emailed) | weekly (Mondays, published Monday ~17:00 ET) | national, PADD 1–5 (+ sub-PADDs), 9 states (CA, CO, FL, MA, MN, NY, OH, TX, WA), 10 metros (Boston, Chicago, Cleveland, Denver, Houston, Los Angeles, Miami, New York, San Francisco, Seattle); regular/midgrade/premium gasoline (all formulations), diesel | US Government work, public domain; "Source: U.S. Energy Information Administration (EIA)" | registry entry exists; adapter TODO |

API v2 request shape (documentation.php, confirmed 2026-10-05): `/v2/{route}/data?api_key=…&frequency=weekly&data[0]=value&facets[duoarea][]=…&facets[product][]=…&start=YYYY-MM-DD&sort[0][column]=period&sort[0][direction]=desc&length=5000` (max 5,000 rows per JSON response; `offset` for paging). Response `{ response: { total, dateFormat, frequency, data: [{ period, duoarea, area-name, product, product-name, process, series, series-description, value, units }] } }`. Rate limits are not published; throttle and cache. **WS-B must confirm the exact `duoarea`/`product` facet values and series ids** (e.g. the long-standing weekly regular series for the US is `EMM_EPMR_PTE_NUS_DPG`; state/metro ids follow `EMM_EPMR_PTE_S{ST}_DPG` / `EMM_EPMR_PTE_Y{code}_DPG`, UNVERIFIED) by calling `/v2/petroleum/pri/gnd/facet/duoarea` and `/facet/product`, record them here, and commit recorded fixtures under `packages/feeds/fixtures/us-eia-weekly/`.

Observed-at convention: EIA's `period` is the Monday survey date → `observedAt = period + "T00:00:00Z"`, `periodicity = weekly`. Unit `gal`, currency `USD`. Region mapping lives in `packages/shared/src/registry/regions/us.ts` (states → `US-XX`, PADDs → `US-PADDn`, metros → `US-XX-NAME`).

## Not allowed
Scraping GasBuddy, OPIS, AAA (proprietary; AAA buys OPIS data). No open US station-level feed exists as of 2026-10-05.

## Phase 2 (designed into the registry, not shipped)

| Feed id | Source | Access | Granularity | License |
|---|---|---|---|---|
| `eu-oil-bulletin` | EU Weekly Oil Bulletin (xlsx) | none | 27 countries weekly | EU reuse (CC BY 4.0-equivalent), attribution |
| `de-tankerkoenig` | Tankerkönig JSON API | free key | station-level (radius queries) | CC BY 4.0 + API ToS |
| `fr-prix-carburants` | data.gouv.fr via OpenDataSoft `prix-des-carburants-en-france-flux-instantane-v2` | none | station-level | Licence Ouverte 2.0 |
| `gb-cma-fuel-finder` | UK CMA retailer JSON feeds (gov.uk list) | none | station-level | OGL v3 |
| `au-nsw-fuelcheck` | NSW FuelCheck API | OAuth client credentials | station-level | CC BY |
| `au-wa-fuelwatch` | WA FuelWatch RSS | none | station-level (next-day prices) | attribution |
| `ca-nrcan-weekly` | Natural Resources Canada weekly CSV | none | cities weekly | OGL-Canada |
| later | IN PPAC, BR ANP, ES MITECO, IT MIMIT, NZ MBIE, JP ANRE, KR Opinet | varies | varies | verify |

FX (phase 2): ECB `eurofxref-daily.xml` primary, frankfurter.app fallback.

## Adapter contract
`FeedAdapter = { feed: Feed; fetch(ctx): Promise<{ raw, contentType }>; normalize(raw, ctx): PriceObservation[] }`. Tests: `adapter.normalize(fixture)` deep-equals `fixtures/<feedId>/expected.json`; every row passes `PriceObservation.parse`; every `regionCode` resolves via `getRegion`; unknown codes fail the test. `fetchUpstream` records fixtures with `RECORD_FIXTURES=1` and replays them with `FIXTURE_MODE=1`.
