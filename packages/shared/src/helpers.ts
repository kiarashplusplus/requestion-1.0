import type { Fuel, Region, Unit } from "./schemas/index.js";
import { BRAND } from "./brand.js";

const LITERS_PER_GAL = 3.785411784;

export function convertUnit(price: number, from: Unit, to: Unit): number {
  if (from === to) return price;
  return from === "gal" ? price / LITERS_PER_GAL : price * LITERS_PER_GAL;
}

/** ISO-8601 week label (`2026-W41`) for a date in a given IANA time zone. */
export function isoWeek(date: Date, tz = "America/Chicago"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const local = new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
  const day = local.getUTCDay() || 7;
  local.setUTCDate(local.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(local.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((local.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${local.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const FUEL_SLUG: Record<Fuel, string> = {
  gasoline_regular: "gas-prices",
  gasoline_midgrade: "midgrade-gas-prices",
  gasoline_premium: "premium-gas-prices",
  diesel: "diesel-prices",
  lpg: "lpg-prices",
  cng: "cng-prices",
  e85: "e85-prices",
};

/** `houston-tx-gas-prices-2026-w41` */
export function postSlug(region: Pick<Region, "slug">, fuel: Fuel, week: string): string {
  const place = region.slug.split("/").slice(1).reverse().join("-") || region.slug;
  return `${place}-${FUEL_SLUG[fuel]}-${week.toLowerCase()}`;
}

export function canonicalPostUrl(slug: string): string {
  return `${BRAND.siteOrigin}/p/${slug}`;
}

export function hubUrl(region: Pick<Region, "slug">): string {
  return `${BRAND.siteOrigin}/${region.slug}`;
}

export function cardUrl(kind: "country" | "region" | "post", id: string, variant: "og" | "square" | "story" | "sticker", v: string): string {
  return `${BRAND.siteOrigin}/card/${kind}/${encodeURIComponent(id)}/${variant}.png?v=${encodeURIComponent(v)}`;
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isUsRequest(cfCountry: string | undefined | null): boolean {
  return (BRAND.servedCountries as readonly string[]).includes(cfCountry ?? "");
}

export function formatUsd(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatDeltaCents(delta: number | null | undefined): string {
  if (delta == null) return "—";
  const cents = Math.round(delta * 100);
  if (cents === 0) return "unchanged";
  return `${cents > 0 ? "▲" : "▼"}${Math.abs(cents)}¢`;
}
