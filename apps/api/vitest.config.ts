import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";

const migrationsPath = new URL("../../packages/db/migrations", import.meta.url).pathname;

export default defineConfig(async () => {
  const migrations = await readD1Migrations(migrationsPath);
  return {
    plugins: [
      cloudflareTest({
        remoteBindings: false,
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations, DEV_TRIGGER_TOKEN: "dev" },
        },
      }),
    ],
    test: {
      include: ["test/**/*.test.ts"],
      setupFiles: ["./test/setup.ts"],
    },
  };
});
