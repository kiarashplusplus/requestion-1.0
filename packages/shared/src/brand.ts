/**
 * Single source of truth for brand, operator and legal facts.
 * Changing the entity or domain later is a one-file change.
 */
export const BRAND = {
  name: "request.news",
  tagline: "Gas prices are the local news.",
  domain: "request.news",
  siteOrigin: "https://request.news",
  apiOrigin: "https://api.request.news",
  /** Exact string used as <news:name> in the news sitemap and as NewsArticle.publisher.name. */
  publisherName: "request.news",
  /** Terms/Privacy operator line, mirrored from keepsake.ing (owner decision 2026-10-05). */
  operatorName: "Kiarash Adl, an individual in Texas doing business as request.news",
  /** CAN-SPAM requires a valid physical postal address in every commercial email. PO Box / CMRA. */
  operatorPostalAddress: "TODO: PO Box or CMRA address, Texas, USA",
  contactEmail: "hello@request.news",
  governingLaw: "State of Texas, USA",
  venue: "state or federal courts sitting in Harris County, Texas",
  liabilityCapUsd: 100,
  minAgeBrowse: 13,
  minAgeRequest: 18,
  /** Product is US-only (owner decision 2026-10-05). */
  servedCountries: ["US"] as const,
  dataLicense: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
  mcpRegistryName: "news.request/gas-prices",
  social: { instagram: "request.news", tiktok: "request.news" },
} as const;

/** Legacy identifiers kept for the phase-2 mobile app (App Store identity). */
export const APP_IDENTITY = {
  displayName: "request.news",
  scheme: "requestion",
  iosBundleId: "app.requestion.mvp",
  androidPackage: "app.requestion.mvp",
} as const;

/** Visual tokens carried over from the 2019 app and share-card templates. */
export const TOKENS = {
  color: {
    bg: "#21283d",
    surface: "#353d5e",
    accent: "#556cd6",
    accentAlt: "#19857b",
    brandYellow: "#F5CE66",
    text: "#FFFFFF",
    textSecondary: "#c6c6c6",
    textMuted: "#b3b6c3",
    up: "#e5484d",
    down: "#30a46c",
  },
  gradient: {
    card: ["rgba(85,96,127,1)", "rgba(68,79,112,1)", "rgba(48,58,87,1)"] as const,
  },
  radius: { card: 20, chip: 16, input: 10 },
  font: {
    family: "Roboto",
    weights: { light: 300, regular: 400, medium: 500, black: 900 } as const,
  },
} as const;
