import type { Region } from "../../schemas/index.js";

/**
 * US region registry: country, EIA PADDs, states with EIA weekly series, and the
 * 10 EIA metro areas. Append-only; one file per country. WS-B extends with the
 * top-50 metros mapped to their state series.
 */
const TZ: Record<string, string> = {
  CA: "America/Los_Angeles", CO: "America/Denver", FL: "America/New_York", MA: "America/New_York",
  MN: "America/Chicago", NY: "America/New_York", OH: "America/New_York", TX: "America/Chicago",
  WA: "America/Los_Angeles", IL: "America/Chicago",
};

const state = (code: string, name: string, padd: string, dateline: string): Region => ({
  code: `US-${code}`,
  country: "US",
  name,
  kind: "state",
  parentCode: `US-${padd}`,
  tz: TZ[code] ?? "America/Chicago",
  slug: `us/${code.toLowerCase()}`,
  lang: "en-US",
  dateline,
});

const metro = (code: string, stateCode: string, name: string, dateline: string, lat: number, lon: number, parentCode = `US-${stateCode}`): Region => ({
  code: `US-${stateCode}-${code}`,
  country: "US",
  name,
  kind: "metro",
  parentCode,
  tz: TZ[stateCode] ?? "America/Chicago",
  slug: `us/${stateCode.toLowerCase()}/${code.toLowerCase()}`,
  lang: "en-US",
  dateline,
  lat,
  lon,
});

export const US_REGIONS: Region[] = [
  { code: "US", country: "US", name: "United States", kind: "country", tz: "America/New_York", slug: "us", lang: "en-US", dateline: "WASHINGTON" },
  { code: "US-PADD1", country: "US", name: "East Coast (PADD 1)", kind: "padd", parentCode: "US", tz: "America/New_York", slug: "us/east-coast", lang: "en-US" },
  { code: "US-PADD2", country: "US", name: "Midwest (PADD 2)", kind: "padd", parentCode: "US", tz: "America/Chicago", slug: "us/midwest", lang: "en-US" },
  { code: "US-PADD3", country: "US", name: "Gulf Coast (PADD 3)", kind: "padd", parentCode: "US", tz: "America/Chicago", slug: "us/gulf-coast", lang: "en-US" },
  { code: "US-PADD4", country: "US", name: "Rocky Mountain (PADD 4)", kind: "padd", parentCode: "US", tz: "America/Denver", slug: "us/rocky-mountain", lang: "en-US" },
  { code: "US-PADD5", country: "US", name: "West Coast (PADD 5)", kind: "padd", parentCode: "US", tz: "America/Los_Angeles", slug: "us/west-coast", lang: "en-US" },
  // States with EIA weekly retail series (EIA publishes 9 states weekly).
  state("CA", "California", "PADD5", "SACRAMENTO, Calif."),
  state("CO", "Colorado", "PADD4", "DENVER"),
  state("FL", "Florida", "PADD1", "TALLAHASSEE, Fla."),
  state("MA", "Massachusetts", "PADD1", "BOSTON"),
  state("MN", "Minnesota", "PADD2", "ST. PAUL, Minn."),
  state("NY", "New York", "PADD1", "ALBANY, N.Y."),
  state("OH", "Ohio", "PADD2", "COLUMBUS, Ohio"),
  state("TX", "Texas", "PADD3", "AUSTIN, Texas"),
  state("WA", "Washington", "PADD5", "OLYMPIA, Wash."),
  // EIA metro areas (10).
  metro("BOSTON", "MA", "Boston", "BOSTON", 42.36, -71.06),
  // Illinois has no EIA weekly state series, so Chicago hangs off its PADD.
  metro("CHICAGO", "IL", "Chicago", "CHICAGO", 41.88, -87.63, "US-PADD2"),
  metro("CLEVELAND", "OH", "Cleveland", "CLEVELAND", 41.5, -81.69),
  metro("DENVER", "CO", "Denver", "DENVER", 39.74, -104.99),
  metro("HOUSTON", "TX", "Houston", "HOUSTON", 29.76, -95.37),
  metro("LOSANGELES", "CA", "Los Angeles", "LOS ANGELES", 34.05, -118.24),
  metro("MIAMI", "FL", "Miami", "MIAMI", 25.76, -80.19),
  metro("NEWYORK", "NY", "New York City", "NEW YORK", 40.71, -74.01),
  metro("SANFRANCISCO", "CA", "San Francisco", "SAN FRANCISCO", 37.77, -122.42),
  metro("SEATTLE", "WA", "Seattle", "SEATTLE", 47.61, -122.33),
];
