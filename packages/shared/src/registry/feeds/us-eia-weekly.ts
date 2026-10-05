import type { Feed } from "../../schemas/index.js";

/**
 * EIA Weekly Retail Gasoline and Diesel Prices.
 * API v2 route: /v2/petroleum/pri/gnd/data  (WS-B verifies facets + series ids and records them in docs/feeds.md)
 * Key: free, api_key query param, https://www.eia.gov/opendata/
 */
export const US_EIA_WEEKLY: Feed = {
  id: "us-eia-weekly",
  name: "EIA Weekly Retail Gasoline and Diesel Prices",
  country: "US",
  granularity: "region",
  scheduleKey: "daily",
  sourceUrl: "https://www.eia.gov/petroleum/gasdiesel/",
  license: {
    name: "U.S. Government work (public domain)",
    url: "https://www.eia.gov/about/copyrights_reuse.php",
    attribution: "Source: U.S. Energy Information Administration (EIA)",
    redistributable: true,
  },
  secret: "EIA_API_KEY",
  enabled: true,
  fuels: ["gasoline_regular", "gasoline_midgrade", "gasoline_premium", "diesel"],
  unit: "gal",
  currency: "USD",
  phase: 1,
};
