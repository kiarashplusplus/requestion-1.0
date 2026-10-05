# ADR-A-001: Phase 0 scaffold decisions

- TypeScript 5.9 (not 7.0) until tooling parity is confirmed.
- `turbo` task is `codegen`, not `gen` (`turbo gen` is turbo's built-in generator command).
- `@cloudflare/workers-types` root entry (dated subpaths are gone in 5.2026xxxx).
- API tsconfig types: generated `worker-configuration.d.ts` (with runtime types) + `@cloudflare/vitest-plugin/types` for `cloudflare:test`.
- vitest runs with `remoteBindings: false` so the Workers AI binding does not require a Cloudflare API token in CI.
- Cron `triggers` dispatch to Workflows from `scheduled()`; Workflow `schedules` to be adopted by WS-D after verifying the local dev loop.
- Chicago metro hangs off `US-PADD2` because EIA has no Illinois weekly state series.
