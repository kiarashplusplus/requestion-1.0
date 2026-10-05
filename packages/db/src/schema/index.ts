import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** All timestamps are ISO-8601 strings with offset. Prices are REAL in the feed's unit/currency. */

export const feed = sqliteTable("feed", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  granularity: text("granularity").notNull(),
  scheduleKey: text("schedule_key").notNull(),
  sourceUrl: text("source_url").notNull(),
  licenseName: text("license_name").notNull(),
  licenseUrl: text("license_url").notNull(),
  attribution: text("attribution").notNull(),
  redistributable: integer("redistributable", { mode: "boolean" }).notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  phase: integer("phase").notNull().default(1),
});

export const region = sqliteTable("region", {
  code: text("code").primaryKey(),
  country: text("country").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  parentCode: text("parent_code"),
  lat: real("lat"),
  lon: real("lon"),
  tz: text("tz").notNull(),
  slug: text("slug").notNull(),
  dateline: text("dateline"),
}, (t) => [uniqueIndex("region_slug_idx").on(t.slug), index("region_country_kind_idx").on(t.country, t.kind)]);

export const priceObservation = sqliteTable("price_observation", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedId: text("feed_id").notNull(),
  country: text("country").notNull(),
  regionCode: text("region_code").notNull(),
  fuel: text("fuel").notNull(),
  grade: text("grade"),
  unit: text("unit").notNull(),
  currency: text("currency").notNull(),
  price: real("price").notNull(),
  priceMin: real("price_min"),
  priceMax: real("price_max"),
  nStations: integer("n_stations"),
  observedAt: text("observed_at").notNull(),
  periodicity: text("periodicity").notNull(),
  ingestedAt: text("ingested_at").notNull(),
}, (t) => [
  uniqueIndex("price_obs_unique").on(t.feedId, t.country, t.regionCode, t.fuel, t.observedAt),
  index("price_obs_lookup").on(t.country, t.regionCode, t.fuel, t.observedAt),
]);

export const stationLatest = sqliteTable("station_latest", {
  stationId: text("station_id").primaryKey(),
  feedId: text("feed_id").notNull(),
  country: text("country").notNull(),
  regionCode: text("region_code").notNull(),
  name: text("name"),
  lat: real("lat"),
  lon: real("lon"),
  pricesJson: text("prices_json").notNull(),
  observedAt: text("observed_at").notNull(),
}, (t) => [index("station_region_idx").on(t.regionCode)]);

export const dailyRollup = sqliteTable("daily_rollup", {
  country: text("country").notNull(),
  regionCode: text("region_code").notNull(),
  fuel: text("fuel").notNull(),
  day: text("day").notNull(),
  avg: real("avg").notNull(),
  min: real("min").notNull(),
  max: real("max").notNull(),
  n: integer("n").notNull(),
}, (t) => [primaryKey({ columns: [t.regionCode, t.fuel, t.day] })]);

export const fxRate = sqliteTable("fx_rate", {
  base: text("base").notNull(),
  quote: text("quote").notNull(),
  rate: real("rate").notNull(),
  asOf: text("as_of").notNull(),
  source: text("source").notNull(),
}, (t) => [primaryKey({ columns: [t.base, t.quote, t.asOf] })]);

export const macroSeries = sqliteTable("macro_series", {
  id: text("id").primaryKey(),
  country: text("country").notNull(),
  regionCode: text("region_code"),
  indicator: text("indicator").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  license: text("license").notNull(),
});

export const macroObservation = sqliteTable("macro_observation", {
  seriesId: text("series_id").notNull(),
  period: text("period").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  observedAt: text("observed_at").notNull(),
}, (t) => [primaryKey({ columns: [t.seriesId, t.period] })]);

export const newsSource = sqliteTable("news_source", {
  id: text("id").primaryKey(),
  country: text("country").notNull(),
  regionCode: text("region_code"),
  name: text("name").notNull(),
  rssUrl: text("rss_url"),
  domain: text("domain").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

export const newsItem = sqliteTable("news_item", {
  id: text("id").primaryKey(),
  canonicalUrl: text("canonical_url").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  publisherDomain: text("publisher_domain").notNull(),
  publishedAt: text("published_at").notNull(),
  snippet: text("snippet"),
  lang: text("lang").notNull(),
  country: text("country").notNull(),
  regionCodesJson: text("region_codes_json").notNull(),
  discoveredVia: text("discovered_via").notNull(),
  simhash: text("simhash"),
  fetchedAt: text("fetched_at").notNull(),
}, (t) => [uniqueIndex("news_canonical_idx").on(t.canonicalUrl), index("news_pub_idx").on(t.country, t.publishedAt)]);

export const digest = sqliteTable("digest", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  model: text("model").notNull(),
  promptHash: text("prompt_hash").notNull(),
  status: text("status").notNull(),
  summaryMd: text("summary_md"),
  bulletsJson: text("bullets_json"),
  factcheckJson: text("factcheck_json").notNull(),
  disclosure: text("disclosure").notNull(),
  createdAt: text("created_at").notNull(),
}, (t) => [index("digest_post_idx").on(t.postId, t.createdAt)]);

export const feedRun = sqliteTable("feed_run", {
  id: text("id").primaryKey(),
  feedId: text("feed_id").notNull(),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  status: text("status").notNull(),
  rows: integer("rows").notNull().default(0),
  r2Key: text("r2_key"),
  error: text("error"),
}, (t) => [index("feed_run_feed_idx").on(t.feedId, t.startedAt)]);

export const request = sqliteTable("request", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  country: text("country").notNull(),
  regionCode: text("region_code").notNull(),
  fuel: text("fuel").notNull(),
  channel: text("channel").notNull(),
  cfCountry: text("cf_country"),
  ipHash: text("ip_hash").notNull(),
  status: text("status").notNull(),
  postId: text("post_id"),
  subscriberId: text("subscriber_id"),
}, (t) => [index("request_region_idx").on(t.regionCode, t.fuel, t.createdAt)]);

export const post = sqliteTable("post", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  status: text("status").notNull(),
  country: text("country").notNull(),
  regionCode: text("region_code").notNull(),
  fuel: text("fuel").notNull(),
  isoWeek: text("iso_week").notNull(),
  title: text("title").notNull(),
  dek: text("dek").notNull(),
  bodyMd: text("body_md").notNull(),
  dataJson: text("data_json").notNull(),
  dataHash: text("data_hash").notNull(),
  digestId: text("digest_id"),
  lang: text("lang").notNull(),
  publishedAt: text("published_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  requestCount: integer("request_count").notNull().default(1),
}, (t) => [
  uniqueIndex("post_slug_idx").on(t.slug),
  uniqueIndex("post_week_idx").on(t.regionCode, t.fuel, t.isoWeek),
  index("post_status_idx").on(t.status, t.publishedAt),
]);

export const subscriber = sqliteTable("subscriber", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  regionCode: text("region_code").notNull(),
  fuel: text("fuel").notNull(),
  kindsJson: text("kinds_json").notNull(),
  consentJson: text("consent_json").notNull(),
  unsubscribedAt: text("unsubscribed_at"),
  createdAt: text("created_at").notNull(),
}, (t) => [uniqueIndex("subscriber_email_region_idx").on(t.email, t.regionCode, t.fuel)]);

export const suppression = sqliteTable("suppression", {
  email: text("email").primaryKey(),
  reason: text("reason").notNull(),
  createdAt: text("created_at").notNull(),
});
