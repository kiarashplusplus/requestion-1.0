import { applyD1Migrations, env } from "cloudflare:test";

type Migration = Parameters<typeof applyD1Migrations>[1][number];

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: Migration[];
    DEV_TRIGGER_TOKEN: string;
  }
}

await applyD1Migrations(env.DB, (env as unknown as { TEST_MIGRATIONS: Migration[] }).TEST_MIGRATIONS);
