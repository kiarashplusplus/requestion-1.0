import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { step as stepName } from "@request.news/shared";
import type { ScheduleParams } from "./ingest.js";

/** WS-G owns this file. P0 stub. Contract: news:discover:{CC} → news:extract:{nn} → news:dedupe → digest:{postId} → factcheck:{postId}. */
export class NewsWorkflow extends WorkflowEntrypoint<Env, ScheduleParams> {
  async run(event: WorkflowEvent<ScheduleParams>, step: WorkflowStep) {
    await step.do(stepName("news", "plan"), async () => ({ cron: event.payload.cron }));
    return { stub: true };
  }
}
