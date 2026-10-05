import { describe, expect, it } from "vitest";
import {
  Fuel,
  PriceObservation,
  Region,
  Post,
  getRegion,
  listRegions,
  searchRegions,
  listFeeds,
  getFeed,
  isoWeek,
  postSlug,
  step,
  kv,
  convertUnit,
  isUsRequest,
  formatDeltaCents,
  SCHEDULE_FOR_CRON,
} from "../src/index.js";

describe("schemas", () => {
  it("parses a valid PriceObservation and rejects a bad one", () => {
    const ok = PriceObservation.safeParse({
      feedId: "us-eia-weekly",
      country: "US",
      regionCode: "US-TX",
      fuel: "gasoline_regular",
      unit: "gal",
      currency: "USD",
      price: 3.19,
      observedAt: "2026-09-29T00:00:00Z",
      periodicity: "weekly",
    });
    expect(ok.success).toBe(true);
    expect(PriceObservation.safeParse({ ...ok.data, price: -1 }).success).toBe(false);
    expect(PriceObservation.safeParse({ ...ok.data, regionCode: "tx" }).success).toBe(false);
  });

  it("Post title is capped at 110 chars and slug is kebab", () => {
    const base = Post.shape;
    expect(base.title.safeParse("x".repeat(111)).success).toBe(false);
    expect(base.slug.safeParse("Houston TX").success).toBe(false);
    expect(base.slug.safeParse("houston-tx-gas-prices-2026-w41").success).toBe(true);
  });

  it("enum has every fuel we price", () => {
    expect(Fuel.options).toContain("diesel");
  });
});

describe("registry", () => {
  it("getRegion returns a copy, not the stored object", () => {
    const a = getRegion("US-TX");
    const b = getRegion("US-TX");
    expect(a).not.toBeNull();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    a!.name = "mutated";
    expect(getRegion("US-TX")!.name).toBe("Texas");
  });

  it("unknown region returns null", () => {
    expect(getRegion("US-ZZ")).toBeNull();
  });

  it("listRegions leaks only public summary fields", () => {
    for (const r of listRegions("US")) {
      expect(Object.keys(r).sort()).toEqual(["code", "kind", "name", "slug"]);
    }
  });

  it("every region validates and every parentCode resolves", () => {
    for (const s of listRegions()) {
      const r = getRegion(s.code)!;
      expect(Region.safeParse(r).success).toBe(true);
      if (r.parentCode) expect(getRegion(r.parentCode)).not.toBeNull();
    }
  });

  it("search finds Houston by name", () => {
    expect(searchRegions("houst", "US").map((r) => r.code)).toContain("US-TX-HOUSTON");
  });

  it("launch feeds are US phase-1 and every cron maps to a schedule key", () => {
    const feeds = listFeeds({ enabledOnly: true, phase: 1 });
    expect(feeds.map((f) => f.id)).toEqual(["us-eia-weekly"]);
    expect(getFeed("us-eia-weekly")!.secret).toBe("EIA_API_KEY");
    expect(Object.values(SCHEDULE_FOR_CRON)).toEqual(expect.arrayContaining(["hourly", "daily"]));
  });
});

describe("helpers", () => {
  it("isoWeek handles year boundaries", () => {
    expect(isoWeek(new Date("2027-01-01T12:00:00Z"), "UTC")).toBe("2026-W53");
    expect(isoWeek(new Date("2026-10-05T12:00:00Z"), "America/Chicago")).toBe("2026-W41");
  });

  it("postSlug is stable and readable", () => {
    expect(postSlug(getRegion("US-TX-HOUSTON")!, "gasoline_regular", "2026-W41")).toBe(
      "houston-tx-gas-prices-2026-w41",
    );
    expect(postSlug(getRegion("US")!, "diesel", "2026-W41")).toBe("us-diesel-prices-2026-w41");
  });

  it("step names follow the grammar", () => {
    expect(step("feed", "us-eia-weekly", "persist", 3)).toBe("feed:us-eia-weekly:persist:3");
    expect(() => step("Feed Bad")).toThrow();
  });

  it("kv keys are versioned", () => {
    expect(kv.latestRegion("US", "US-TX")).toBe("latest:v1:country:US:region:US-TX");
  });

  it("unit conversion round-trips", () => {
    expect(convertUnit(convertUnit(3.5, "gal", "L"), "L", "gal")).toBeCloseTo(3.5, 10);
  });

  it("US gate", () => {
    expect(isUsRequest("US")).toBe(true);
    expect(isUsRequest("DE")).toBe(false);
    expect(isUsRequest(undefined)).toBe(false);
  });

  it("delta formatting", () => {
    expect(formatDeltaCents(0.12)).toBe("▲12¢");
    expect(formatDeltaCents(-0.03)).toBe("▼3¢");
    expect(formatDeltaCents(0)).toBe("unchanged");
  });
});
