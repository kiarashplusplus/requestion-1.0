# request.news

**Gas prices are the local news.** Request a place; get a verified, auto-refreshing post about gas prices there, with inflation context and a fact-checked digest of the week's local fuel news. US-only. Built entirely on Cloudflare.

- Product + architecture brief: [`docs/REBUILD_BRIEF.md`](docs/REBUILD_BRIEF.md)
- Swarm execution plan (parallel workstreams, gates, ownership): [`docs/SWARM_PLAN.md`](docs/SWARM_PLAN.md)
- Contracts every workstream codes against: [`docs/contracts.md`](docs/contracts.md)
- Paid acquisition + US privacy: [`docs/paid.md`](docs/paid.md)

## Layout

```
apps/api        Cloudflare Worker: Hono API, SSR posts/hubs, share cards, MCP, 4 Workflows (ingest, macro, news, posts)
apps/web        Assets-only Worker serving the static web shell (Expo web export in phase 2)
packages/shared zod contracts, registries (regions, feeds), brand/legal config, KV keys, helpers
packages/db     Drizzle schema + D1 migrations + dev seed
docs/           brief, plans, per-workstream docs, ADRs
```

## Develop

```bash
pnpm install
pnpm check                                  # turbo: gen → typecheck → lint → test (vitest in workerd with D1 migrations)
pnpm --filter @request.news/api dry-run     # wrangler deploy --dry-run
pnpm --filter @request.news/api migrate:local && pnpm --filter @request.news/api seed:local
cp apps/api/.dev.vars.example apps/api/.dev.vars   # fill keys
pnpm dev                                    # http://localhost:8787/health
```

Workstream branches are `ws/<letter>-<name>`; PRs target `claude/gas-prices-app-rebuild-4ww0r7` and must pass `pnpm tsx scripts/check-ownership.ts <WS>`.
