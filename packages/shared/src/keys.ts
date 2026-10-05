/**
 * KV key schema, Cache-Tag vocabulary and Workflow step-name grammar.
 * Every writer and reader imports these builders; never hand-write keys.
 */
export const kv = {
  latestGlobal: () => "latest:v1:global",
  latestCountry: (cc: string) => `latest:v1:country:${cc}`,
  latestRegion: (cc: string, region: string) => `latest:v1:country:${cc}:region:${region}`,
  metaFeeds: () => "meta:v1:feeds",
  macroCountry: (cc: string) => `macro:v1:country:${cc}`,
  fxLatest: () => "fx:v1:latest",
  postsIndex: () => "posts:v1:index",
  digestBudget: (yyyyMmDd: string) => `digest:budget:${yyyyMmDd}`,
} as const;

export const cacheTag = {
  latest: () => "latest",
  country: (cc: string) => `country:${cc}`,
  region: (code: string) => `region:${code}`,
  post: (slug: string) => `post:${slug}`,
  feed: (code: string) => `feed:${code}`,
  sitemap: () => "sitemap",
  card: () => "card",
} as const;

export const CACHE_CONTROL = {
  latest: "public, max-age=300, stale-while-revalidate=3600",
  history: "public, max-age=3600, stale-while-revalidate=86400",
  html: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  card: "public, max-age=3600, stale-while-revalidate=86400",
  none: "no-store",
} as const;

const STEP_RE = /^[a-z]+(:[a-z0-9-]+)*$/;
export function step(...parts: Array<string | number>): string {
  const name = parts.map(String).join(":").toLowerCase();
  if (!STEP_RE.test(name)) throw new Error(`invalid step name: ${name}`);
  return name;
}

export const r2 = {
  raw: (feedId: string, date: Date, runId: string) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `raw/${feedId}/${y}/${m}/${d}/${runId}.json`;
  },
  normalized: (feedId: string, runId: string) => `normalized/${feedId}/${runId}.json`,
  card: (kind: string, id: string, variant: string, dataVersion: string) =>
    `cards/${kind}/${id}/${variant}/${dataVersion}.png`,
} as const;
