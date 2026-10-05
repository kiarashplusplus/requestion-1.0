import { z } from "zod";
import {
  DigestStatus,
  Fuel,
  Granularity,
  MacroIndicator,
  Periodicity,
  PostStatus,
  RegionKind,
  RequestStatus,
  ScheduleKey,
  SubscriptionKind,
  Unit,
} from "./enums.js";

/** `US`, `US-TX`, `US-TX-HOUSTON`, `US-PADD3`. */
export const RegionCode = z.string().regex(/^[A-Z]{2}(-[A-Z0-9]+){0,2}$/);
export const CountryCode = z.string().regex(/^[A-Z]{2}$/);
export const IsoDateTime = z.string().datetime({ offset: true });
export const IsoWeek = z.string().regex(/^\d{4}-W\d{2}$/);
export const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const Source = z.object({
  name: z.string(),
  url: z.string().url(),
  license: z.string(),
  attribution: z.string(),
  asOf: IsoDateTime,
});
export type Source = z.infer<typeof Source>;

export const Region = z.object({
  code: RegionCode,
  country: CountryCode,
  name: z.string(),
  kind: RegionKind,
  parentCode: RegionCode.optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  tz: z.string(),
  /** URL path segment, e.g. `us/tx/houston`. */
  slug: z.string().regex(/^[a-z0-9]+(?:\/[a-z0-9-]+){0,2}$/),
  aliases: z.array(z.string()).optional(),
  lang: z.string().default("en-US"),
  /** Dateline city label, e.g. "HOUSTON, Texas". */
  dateline: z.string().optional(),
});
export type Region = z.infer<typeof Region>;

export const FeedLicense = z.object({
  name: z.string(),
  url: z.string().url(),
  attribution: z.string(),
  /** False means rows must not be re-published under CC BY 4.0 via /data/*. */
  redistributable: z.boolean(),
});

export const Feed = z.object({
  id: z.string().regex(/^[a-z]{2}-[a-z0-9-]+$/),
  name: z.string(),
  country: CountryCode,
  granularity: Granularity,
  scheduleKey: ScheduleKey,
  sourceUrl: z.string().url(),
  license: FeedLicense,
  /** Name of the env secret holding the API key, if any. */
  secret: z.string().optional(),
  enabled: z.boolean(),
  fuels: z.array(Fuel),
  unit: Unit,
  currency: z.string().length(3),
  /** Phase 1 = launch; phase 2 = designed but not shipped. */
  phase: z.union([z.literal(1), z.literal(2)]),
});
export type Feed = z.infer<typeof Feed>;

export const PriceObservation = z.object({
  feedId: Feed.shape.id,
  country: CountryCode,
  regionCode: RegionCode,
  stationId: z.string().optional(),
  fuel: Fuel,
  grade: z.string().optional(),
  unit: Unit,
  currency: z.string().length(3),
  price: z.number().min(0).max(50),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  nStations: z.number().int().min(0).optional(),
  observedAt: IsoDateTime,
  periodicity: Periodicity,
  sourceUrl: z.string().url().optional(),
});
export type PriceObservation = z.infer<typeof PriceObservation>;

export const FuelSnapshot = z.object({
  price: z.number(),
  unit: Unit,
  currency: z.string().length(3),
  priceUsdPerGal: z.number(),
  delta7d: z.number().optional(),
  delta30d: z.number().optional(),
  observedAt: IsoDateTime,
  feedId: Feed.shape.id,
});
export type FuelSnapshot = z.infer<typeof FuelSnapshot>;

export const LatestRegion = z.object({
  v: z.literal(1),
  region: Region.pick({ code: true, name: true, kind: true, slug: true }),
  asOf: IsoDateTime,
  fuels: z.partialRecord(Fuel, FuelSnapshot),
  stations: z.object({ n: z.number().int(), min: z.number(), max: z.number(), median: z.number() }).optional(),
  sources: z.array(Source),
  generatedAt: IsoDateTime,
});
export type LatestRegion = z.infer<typeof LatestRegion>;

export const LatestCountry = z.object({
  v: z.literal(1),
  country: CountryCode,
  asOf: IsoDateTime,
  fuels: z.partialRecord(Fuel, FuelSnapshot),
  regions: z.array(
    z.object({
      code: RegionCode,
      name: z.string(),
      kind: RegionKind,
      slug: Region.shape.slug,
      fuels: z.partialRecord(Fuel, FuelSnapshot),
    }),
  ),
  sources: z.array(Source),
  generatedAt: IsoDateTime,
});
export type LatestCountry = z.infer<typeof LatestCountry>;

export const FeedFreshness = z.array(
  z.object({
    feedId: Feed.shape.id,
    lastOkAt: IsoDateTime.nullable(),
    lastRunAt: IsoDateTime.nullable(),
    status: z.enum(["ok", "error", "never"]),
    rows: z.number().int(),
    lagSeconds: z.number().int().nullable(),
  }),
);
export type FeedFreshness = z.infer<typeof FeedFreshness>;

export const MacroObservation = z.object({
  seriesId: z.string(),
  country: CountryCode,
  regionCode: RegionCode.optional(),
  indicator: MacroIndicator,
  value: z.number(),
  unit: z.enum(["index", "pct"]),
  /** `YYYY`, `YYYY-MM` or `YYYY-Qn`. */
  period: z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]|Q[1-4]))?$/),
  observedAt: IsoDateTime,
  source: Source,
});
export type MacroObservation = z.infer<typeof MacroObservation>;

export const MacroContext = z.object({
  country: CountryCode,
  regionCode: RegionCode.optional(),
  asOf: IsoDateTime,
  cpiAllYoy: z.number().optional(),
  cpiGasolineYoy: z.number().optional(),
  cpiPeriod: z.string().optional(),
  /** One plain-English sentence with every number traceable to `sources`. */
  sentence: z.string(),
  sources: z.array(Source),
});
export type MacroContext = z.infer<typeof MacroContext>;

export const NewsItem = z.object({
  /** sha256(canonicalUrl) hex. */
  id: z.string().length(64),
  url: z.string().url(),
  canonicalUrl: z.string().url(),
  title: z.string().max(300),
  publisher: z.string(),
  publisherDomain: z.string(),
  publishedAt: IsoDateTime,
  snippet: z.string().max(300).optional(),
  lang: z.string(),
  country: CountryCode,
  regionCodes: z.array(RegionCode),
  discoveredVia: z.enum(["gdelt", "rss", "api"]),
  fetchedAt: IsoDateTime,
});
export type NewsItem = z.infer<typeof NewsItem>;

export const Digest = z.object({
  postId: z.string(),
  model: z.string(),
  promptHash: z.string(),
  status: DigestStatus,
  summaryMd: z.string().optional(),
  bullets: z.array(z.object({ text: z.string(), newsIds: z.array(NewsItem.shape.id).min(1) })).optional(),
  factcheck: z.object({
    numbersChecked: z.number().int(),
    mismatches: z.array(z.object({ token: z.string(), reason: z.string() })),
  }),
  disclosure: z.string(),
  createdAt: IsoDateTime,
});
export type Digest = z.infer<typeof Digest>;

export const PostRequest = z.object({
  country: CountryCode,
  regionCode: RegionCode,
  fuel: Fuel.default("gasoline_regular"),
  locale: z.string().default("en-US"),
  channel: z.enum(["app", "web", "mcp"]),
  email: z.string().email().optional(),
  turnstileToken: z.string().optional(),
});
export type PostRequest = z.infer<typeof PostRequest>;

export const PostData = z.object({
  latest: z.object({ price: z.number(), unit: Unit, currency: z.string(), observedAt: IsoDateTime }),
  delta7d: z.number().nullable(),
  delta30d: z.number().nullable(),
  nationalAvg: z.number().nullable(),
  stations: z.object({ n: z.number().int(), min: z.number(), max: z.number() }).optional(),
  series7d: z.array(z.number()),
  series30d: z.array(z.number()),
  sources: z.array(Source),
  macro: MacroContext.nullable(),
  digestId: z.string().nullable(),
  dataPoints: z.number().int(),
  isoWeek: IsoWeek,
});
export type PostData = z.infer<typeof PostData>;

export const Post = z.object({
  id: z.string(),
  slug: Slug,
  status: PostStatus,
  country: CountryCode,
  regionCode: RegionCode,
  fuel: Fuel,
  title: z.string().max(110),
  dek: z.string().max(300),
  bodyMd: z.string(),
  data: PostData,
  lang: z.string(),
  publishedAt: IsoDateTime,
  /** Changes only when `dataHash` changes. */
  updatedAt: IsoDateTime,
  canonicalUrl: z.string().url(),
  requestCount: z.number().int(),
  dataHash: z.string(),
});
export type Post = z.infer<typeof Post>;

export const PostIndexEntry = z.object({
  slug: Slug,
  title: z.string(),
  country: CountryCode,
  regionCode: RegionCode,
  fuel: Fuel,
  publishedAt: IsoDateTime,
  updatedAt: IsoDateTime,
  cardUrl: z.string().url(),
});
export type PostIndexEntry = z.infer<typeof PostIndexEntry>;

export const Subscriber = z.object({
  id: z.string(),
  email: z.string().email(),
  regionCode: RegionCode,
  fuel: Fuel,
  kinds: z.array(SubscriptionKind),
  /** Consent log: what the form said, when, from which IP hash + UA, GPC state. */
  consent: z.object({
    noticeVersion: z.string(),
    at: IsoDateTime,
    ipHash: z.string(),
    userAgent: z.string(),
    gpc: z.boolean(),
  }),
  unsubscribedAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
});
export type Subscriber = z.infer<typeof Subscriber>;

export const RequestRow = z.object({
  id: z.string(),
  createdAt: IsoDateTime,
  country: CountryCode,
  regionCode: RegionCode,
  fuel: Fuel,
  channel: PostRequest.shape.channel,
  cfCountry: CountryCode.nullable(),
  ipHash: z.string(),
  status: RequestStatus,
  postId: z.string().nullable(),
});
export type RequestRow = z.infer<typeof RequestRow>;
