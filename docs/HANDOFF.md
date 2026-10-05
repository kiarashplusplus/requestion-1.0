# Handoff (written 2026-10-05, session near quota)

This repository is the ground-up rebuild of "Requestion" as **request.news**: US gas prices as the local news, on Cloudflare. Everything needed to continue is in this repo; nothing lives only in the old chat session.

## Where things are
| What | Where |
|---|---|
| Product + architecture brief (read first) | `docs/REBUILD_BRIEF.md` |
| Approved plan with every owner decision (14 decisions, research summaries) | `docs/PLAN.md` |
| Swarm plan: workstreams A–P, phases, gates, merge order, DoD | `docs/SWARM_PLAN.md` |
| Contracts every workstream codes against | `docs/contracts.md` (code: `packages/shared/src`) |
| Research: distribution, growth, social, paid, feeds, macro, news, notifications | `docs/*.md` |
| Phase 0 decisions | `docs/decisions/ADR-A-001-phase0.md` |
| Path ownership for parallel agents | `OWNERSHIP.json`, `scripts/check-ownership.ts` |

## Status
- **Phase 0 (contracts + scaffold) is complete and verified**: `pnpm install && pnpm turbo codegen typecheck lint test` green (16 shared tests, 10 API tests in workerd with D1 migrations), `wrangler deploy --dry-run` passes for `apps/api` and `apps/web`.
- **Phase 1 swarm was launched** from the Phase 0 commit as eleven agents in isolated git worktrees on branches `ws/b-feeds`, `ws/c-macro`, `ws/d-ingest`, `ws/e-api`, `ws/f-posts`, `ws/g-news`, `ws/h-cards`, `ws/i-agent`, `ws/n-notify`, `ws/p-paid`, `ws/k-cicd`. Whatever they committed before this handoff is pushed as those branches; anything else must be re-done from the workstream rows in `docs/SWARM_PLAN.md` (each row is the agent's spec; the exact prompts followed that spec plus: "only touch owned paths, run the full check, commit on the ws/ branch, write ADRs for anything needing a frozen-file change").
- **Phase 2 (deferred by owner):** Expo SDK 57 mobile app (WS-J), non-US feed adapters, station-level US data.

## How to resume
1. `pnpm install && pnpm check` (Node ≥ 22, pnpm 10).
2. For each `ws/*` branch: rebase onto `claude/gas-prices-app-rebuild-4ww0r7`, run `pnpm tsx scripts/check-ownership.ts <WS> <base>`, run `pnpm check`, merge in the order **B→C→D→E→H→G→F→N→I→P→K**. Apply the ADR requests (new catalog deps, vars/secrets, route mounts in `apps/api/src/index.ts`) as single orchestrator commits.
3. Missing workstreams: re-launch from the `SWARM_PLAN.md` row (one agent per row, worktree per agent, same ownership rules).
4. Owner prerequisites before any deploy: register `request.news` (unregistered as of 2026-10-05; `requestion.app` has lapsed), Cloudflare zone, `wrangler secret put` for every key in `apps/api/.dev.vars.example`, PO Box/CMRA postal address into `packages/shared/src/brand.ts`, EIA + BLS API keys, Meta app (Facebook App ID, Instagram professional account), TikTok Business account, Google Ads advertiser verification (start day 1), Turnstile widget, AI Gateway `request-news`.
5. Repo home: the owner wants a private repo named `request.news`. This code was pushed to `kiarashplusplus/requestion-1.0` because the session's GitHub integration could not create repositories; rename that repo to `request.news` (Settings → General → Repository name) and set it private, or create `request.news` and push this branch there.

## Owner decisions (summary; details in `docs/PLAN.md`)
Request a place → auto-generated post · US-only (EIA + BLS at launch) · web-first, app phase 2 · fuel + inflation only year one · fully automated verified data + fact-checked AI news re-digest · brand/domain `request.news` · operator "Kiarash Adl, an individual in Texas doing business as request.news" (Terms/Privacy ported from keepsake.ing) · email under CAN-SPAM, WhatsApp via Channels · TikTok + Instagram (Snapchat dropped) · Google Ads + TikTok Ads from launch · no monetization year one · agent swarm execution.

## Old repos
`kiarashplusplus/requestion` (Firebase backend, 2019) and `kiarashplusplus/requestion-react-native` (Expo SDK 33) are frozen; nothing is imported from them except brand tokens, fonts, icon/splash and a few patterns (see brief §7). Their open PRs (#34, #2 and Dependabot) can be closed with a pointer here.
