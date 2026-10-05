import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema/index.js";

export { schema };
export type Db = ReturnType<typeof createDb>;

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

/** D1 allows 100 bound parameters per statement; keep headroom. */
export const MAX_BOUND_PARAMS = 90;

export function chunkForBatch<T>(rows: T[], paramsPerRow: number): T[][] {
  const per = Math.max(1, Math.floor(MAX_BOUND_PARAMS / paramsPerRow));
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += per) out.push(rows.slice(i, i + per));
  return out;
}
