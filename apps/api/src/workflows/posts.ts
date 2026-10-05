import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { step as stepName } from "@request.news/shared";

export type PostsParams =
  | { reason: "data-changed"; regions: string[] }
  | { reason: "request"; requestId: string; regionCode: string; fuel: string };

/** WS-F owns this file. P0 stub. Contract: post:gate:{slug} → post:build:{slug} → post:render-check:{slug} → kv:posts-index → indexnow. */
export class PostsWorkflow extends WorkflowEntrypoint<Env, PostsParams> {
  async run(event: WorkflowEvent<PostsParams>, step: WorkflowStep) {
    await step.do(stepName("post", "plan"), async () => ({ reason: event.payload.reason }));
    return { stub: true };
  }
}
