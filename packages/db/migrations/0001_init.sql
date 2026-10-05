-- request.news D1 schema, migration 0001 (frozen during Phase 1; changes via orchestrator contracts PR).
CREATE TABLE IF NOT EXISTS feed (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  granularity TEXT NOT NULL,
  schedule_key TEXT NOT NULL,
  source_url TEXT NOT NULL,
  license_name TEXT NOT NULL,
  license_url TEXT NOT NULL,
  attribution TEXT NOT NULL,
  redistributable INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  phase INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS region (
  code TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  parent_code TEXT,
  lat REAL,
  lon REAL,
  tz TEXT NOT NULL,
  slug TEXT NOT NULL,
  dateline TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS region_slug_idx ON region (slug);
CREATE INDEX IF NOT EXISTS region_country_kind_idx ON region (country, kind);

CREATE TABLE IF NOT EXISTS price_observation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id TEXT NOT NULL,
  country TEXT NOT NULL,
  region_code TEXT NOT NULL,
  fuel TEXT NOT NULL,
  grade TEXT,
  unit TEXT NOT NULL,
  currency TEXT NOT NULL,
  price REAL NOT NULL,
  price_min REAL,
  price_max REAL,
  n_stations INTEGER,
  observed_at TEXT NOT NULL,
  periodicity TEXT NOT NULL,
  ingested_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS price_obs_unique ON price_observation (feed_id, country, region_code, fuel, observed_at);
CREATE INDEX IF NOT EXISTS price_obs_lookup ON price_observation (country, region_code, fuel, observed_at);

CREATE TABLE IF NOT EXISTS station_latest (
  station_id TEXT PRIMARY KEY,
  feed_id TEXT NOT NULL,
  country TEXT NOT NULL,
  region_code TEXT NOT NULL,
  name TEXT,
  lat REAL,
  lon REAL,
  prices_json TEXT NOT NULL,
  observed_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS station_region_idx ON station_latest (region_code);

CREATE TABLE IF NOT EXISTS daily_rollup (
  country TEXT NOT NULL,
  region_code TEXT NOT NULL,
  fuel TEXT NOT NULL,
  day TEXT NOT NULL,
  avg REAL NOT NULL,
  min REAL NOT NULL,
  max REAL NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (region_code, fuel, day)
);

CREATE TABLE IF NOT EXISTS fx_rate (
  base TEXT NOT NULL,
  quote TEXT NOT NULL,
  rate REAL NOT NULL,
  as_of TEXT NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (base, quote, as_of)
);

CREATE TABLE IF NOT EXISTS macro_series (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  region_code TEXT,
  indicator TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  license TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS macro_observation (
  series_id TEXT NOT NULL,
  period TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  PRIMARY KEY (series_id, period)
);

CREATE TABLE IF NOT EXISTS news_source (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  region_code TEXT,
  name TEXT NOT NULL,
  rss_url TEXT,
  domain TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS news_item (
  id TEXT PRIMARY KEY,
  canonical_url TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publisher_domain TEXT NOT NULL,
  published_at TEXT NOT NULL,
  snippet TEXT,
  lang TEXT NOT NULL,
  country TEXT NOT NULL,
  region_codes_json TEXT NOT NULL,
  discovered_via TEXT NOT NULL,
  simhash TEXT,
  fetched_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS news_canonical_idx ON news_item (canonical_url);
CREATE INDEX IF NOT EXISTS news_pub_idx ON news_item (country, published_at);

CREATE TABLE IF NOT EXISTS digest (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  summary_md TEXT,
  bullets_json TEXT,
  factcheck_json TEXT NOT NULL,
  disclosure TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS digest_post_idx ON digest (post_id, created_at);

CREATE TABLE IF NOT EXISTS feed_run (
  id TEXT PRIMARY KEY,
  feed_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,
  rows INTEGER NOT NULL DEFAULT 0,
  r2_key TEXT,
  error TEXT
);
CREATE INDEX IF NOT EXISTS feed_run_feed_idx ON feed_run (feed_id, started_at);

CREATE TABLE IF NOT EXISTS request (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  country TEXT NOT NULL,
  region_code TEXT NOT NULL,
  fuel TEXT NOT NULL,
  channel TEXT NOT NULL,
  cf_country TEXT,
  ip_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  post_id TEXT,
  subscriber_id TEXT
);
CREATE INDEX IF NOT EXISTS request_region_idx ON request (region_code, fuel, created_at);

CREATE TABLE IF NOT EXISTS post (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  status TEXT NOT NULL,
  country TEXT NOT NULL,
  region_code TEXT NOT NULL,
  fuel TEXT NOT NULL,
  iso_week TEXT NOT NULL,
  title TEXT NOT NULL,
  dek TEXT NOT NULL,
  body_md TEXT NOT NULL,
  data_json TEXT NOT NULL,
  data_hash TEXT NOT NULL,
  digest_id TEXT,
  lang TEXT NOT NULL,
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS post_slug_idx ON post (slug);
CREATE UNIQUE INDEX IF NOT EXISTS post_week_idx ON post (region_code, fuel, iso_week);
CREATE INDEX IF NOT EXISTS post_status_idx ON post (status, published_at);

CREATE TABLE IF NOT EXISTS subscriber (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  region_code TEXT NOT NULL,
  fuel TEXT NOT NULL,
  kinds_json TEXT NOT NULL,
  consent_json TEXT NOT NULL,
  unsubscribed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS subscriber_email_region_idx ON subscriber (email, region_code, fuel);

CREATE TABLE IF NOT EXISTS suppression (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);
