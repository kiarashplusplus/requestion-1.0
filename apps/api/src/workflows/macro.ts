import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { step as stepName } from "@request.news/shared";
import type { ScheduleParams } from "./ingest.js";

/** WS-C owns this file. P0 stub. Contract: macro:{seriesId}:fetch → macro:{seriesId}:persist → kv:macro:{CC}. */
export class MacroWorkflow extends WorkflowEntrypoint<Env, ScheduleParams> {
  async run(event: WorkflowEvent<ScheduleParams>, step: WorkflowStep) {
    await step.do(stepName("macro", "plan"), async () => ({ cron: event.payload.cron }));
    return { stub: true };
  }
}
