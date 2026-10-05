import { Feed, Region } from "../schemas/index.js";
import { US_REGIONS } from "./regions/us.js";
import { US_EIA_WEEKLY } from "./feeds/us-eia-weekly.js";

/**
 * Curated registries. Pattern carried over from the 2019 app's `localities.js`:
 * getters return copies (never the stored object) and public listings leak no internals.
 */
const REGIONS: ReadonlyMap<string, Region> = new Map(
  US_REGIONS.map((r) => [r.code, Region.parse(r)] as const),
);

const FEEDS: ReadonlyMap<string, Feed> = new Map([US_EIA_WEEKLY].map((f) => [f.id, Feed.parse(f)] as const));

export function getRegion(code: string): Region | null {
  const r = REGIONS.get(code);
  return r ? structuredClone(r) : null;
}

export function getRegionBySlug(slug: string): Region | null {
  for (const r of REGIONS.values()) if (r.slug === slug) return structuredClone(r);
  return null;
}

export type RegionSummary = Pick<Region, "code" | "name" | "kind" | "slug">;

export function listRegions(country?: string, kind?: Region["kind"]): RegionSummary[] {
  const out: RegionSummary[] = [];
  for (const r of REGIONS.values()) {
    if (country && r.country !== country) continue;
    if (kind && r.kind !== kind) continue;
    out.push({ code: r.code, name: r.name, kind: r.kind, slug: r.slug });
  }
  return out;
}

export function searchRegions(q: string, country?: string): RegionSummary[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return listRegions(country).filter((r) => {
    const full = REGIONS.get(r.code);
    return (
      r.name.toLowerCase().includes(needle) ||
      r.code.toLowerCase().includes(needle) ||
      (full?.aliases ?? []).some((a) => a.toLowerCase().includes(needle))
    );
  });
}

export function getFeed(id: string): Feed | null {
  const f = FEEDS.get(id);
  return f ? structuredClone(f) : null;
}

export function listFeeds(opts: { enabledOnly?: boolean; phase?: 1 | 2; scheduleKey?: Feed["scheduleKey"] } = {}): Feed[] {
  const out: Feed[] = [];
  for (const f of FEEDS.values()) {
    if (opts.enabledOnly && !f.enabled) continue;
    if (opts.phase && f.phase !== opts.phase) continue;
    if (opts.scheduleKey && f.scheduleKey !== opts.scheduleKey) continue;
    out.push(structuredClone(f));
  }
  return out;
}

/** Maps the Workflow cron expressions to feed schedule keys. Keep in sync with wrangler.jsonc. */
export const SCHEDULE_FOR_CRON: Record<string, Feed["scheduleKey"]> = {
  "5 * * * *": "hourly",
  "20 3 * * *": "daily",
};
