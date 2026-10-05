import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { listFeeds, SCHEDULE_FOR_CRON, step as stepName } from "@request.news/shared";

export type ScheduleParams = { cron: string; scheduledTime: string };

/**
 * WS-D owns this file. P0 stub: selects due feeds and records the plan; no fetching yet.
 * Contract: fetch → R2 raw → normalize → D1 persist (numbered sub-steps) → rollups → KV latest → feed_run → metrics → purge → POSTS.create.
 */
export class IngestWorkflow extends WorkflowEntrypoint<Env, ScheduleParams> {
  async run(event: WorkflowEvent<ScheduleParams>, step: WorkflowStep) {
    const due = await step.do(stepName("select-feeds"), async () => {
      const key = SCHEDULE_FOR_CRON[event.payload.cron];
      const feeds = listFeeds({ enabledOnly: true, phase: 1, ...(key ? { scheduleKey: key } : {}) });
      return feeds.map((f) => f.id);
    });
    return { due, cron: event.payload.cron, stub: true };
  }
}
