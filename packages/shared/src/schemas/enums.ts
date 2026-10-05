import { z } from "zod";

export const Fuel = z.enum([
  "gasoline_regular",
  "gasoline_midgrade",
  "gasoline_premium",
  "diesel",
  "lpg",
  "cng",
  "e85",
]);
export type Fuel = z.infer<typeof Fuel>;

export const Unit = z.enum(["L", "gal"]);
export type Unit = z.infer<typeof Unit>;

export const RegionKind = z.enum(["country", "padd", "state", "metro", "city"]);
export type RegionKind = z.infer<typeof RegionKind>;

export const Granularity = z.enum(["country", "region", "city", "station"]);
export type Granularity = z.infer<typeof Granularity>;

export const Periodicity = z.enum(["instant", "daily", "weekly", "monthly", "quarterly", "annual"]);
export type Periodicity = z.infer<typeof Periodicity>;

export const ScheduleKey = z.enum(["hourly", "daily"]);
export type ScheduleKey = z.infer<typeof ScheduleKey>;

export const MacroIndicator = z.enum([
  "cpi_all_index",
  "cpi_all_yoy",
  "cpi_energy_yoy",
  "cpi_fuel_index",
  "cpi_fuel_yoy",
  "cpi_gasoline_index",
  "cpi_gasoline_yoy",
]);
export type MacroIndicator = z.infer<typeof MacroIndicator>;

export const PostStatus = z.enum(["draft", "published", "noindex", "archived"]);
export type PostStatus = z.infer<typeof PostStatus>;

export const RequestStatus = z.enum(["queued", "published", "rejected", "duplicate"]);
export type RequestStatus = z.infer<typeof RequestStatus>;

export const DigestStatus = z.enum(["accepted", "rejected", "skipped"]);
export type DigestStatus = z.infer<typeof DigestStatus>;

export const SubscriptionKind = z.enum(["transactional", "weekly_digest", "price_alert"]);
export type SubscriptionKind = z.infer<typeof SubscriptionKind>;

export const ErrorCode = z.enum([
  "not_found",
  "validation",
  "rate_limited",
  "upstream",
  "gate_failed",
  "turnstile",
  "geo_restricted",
  "internal",
  "not_implemented",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;
