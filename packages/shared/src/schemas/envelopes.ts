import { z } from "zod";
import { ErrorCode } from "./enums.js";
import { IsoDateTime, Source } from "./entities.js";

export const Meta = z.object({
  asOf: IsoDateTime.nullable(),
  sources: z.array(Source),
  license: z.string(),
  generatedAt: IsoDateTime,
  requestId: z.string(),
});
export type Meta = z.infer<typeof Meta>;

export const ok = <T extends z.ZodTypeAny>(data: T) => z.object({ data, meta: Meta });

export const ErrorEnvelope = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelope>;

export const HTTP_STATUS: Record<z.infer<typeof ErrorCode>, number> = {
  not_found: 404,
  validation: 422,
  rate_limited: 429,
  upstream: 502,
  gate_failed: 409,
  turnstile: 400,
  geo_restricted: 451,
  internal: 500,
  not_implemented: 501,
};
