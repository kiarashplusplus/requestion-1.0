#!/usr/bin/env tsx
/**
 * Usage: tsx scripts/check-ownership.ts <WS> [baseRef]
 * Fails when the diff against baseRef touches files outside the workstream's owned paths
 * (shared append-only paths and ADR files are allowed for everyone; orchestrator paths for nobody but "orchestrator").
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

type Ownership = { orchestrator: string[]; "shared-append-only": string[]; workstreams: Record<string, string[]> };

const [, , ws, baseRef = "origin/claude/gas-prices-app-rebuild-4ww0r7"] = process.argv;
if (!ws) {
  console.error("usage: check-ownership <WS|orchestrator> [baseRef]");
  process.exit(2);
}
const ownership = JSON.parse(readFileSync(new URL("../OWNERSHIP.json", import.meta.url), "utf8")) as Ownership;

function globToRegex(glob: string): RegExp {
  const esc = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\//g, "(?:.*/)?")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*");
  return new RegExp(`^${esc}$`);
}

const allowed = ws === "orchestrator"
  ? [...ownership.orchestrator, ...ownership["shared-append-only"], ...Object.values(ownership.workstreams).flat()]
  : [...(ownership.workstreams[ws] ?? []), ...ownership["shared-append-only"]];
if (ws !== "orchestrator" && !ownership.workstreams[ws]) {
  console.error(`unknown workstream ${ws}`);
  process.exit(2);
}
const allowedRe = allowed.map(globToRegex);
const orchestratorRe = ownership.orchestrator.map(globToRegex);

const changed = execSync(`git diff --name-only ${baseRef}...HEAD`, { encoding: "utf8" }).split("\n").filter(Boolean);
const violations = changed.filter((f) => {
  if (ws !== "orchestrator" && orchestratorRe.some((re) => re.test(f))) return true;
  return !allowedRe.some((re) => re.test(f));
});

if (violations.length) {
  console.error(`WS-${ws} touched files outside its ownership:\n  ${violations.join("\n  ")}`);
  process.exit(1);
}
console.log(`ownership ok for WS-${ws} (${changed.length} files)`);
