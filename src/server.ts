import { createApp } from "@/app";
import { runMigrations } from "@/db/migrate";
import { closePostgres, isPostgresConfigured, pingPostgres } from "@/db/postgres";

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  if (!isPostgresConfigured()) {
    console.error("DATABASE_URL is required (PostgreSQL).");
    process.exit(1);
  }

  try {
    await pingPostgres();
    console.log("Postgres: connection ok");
    await runMigrations();
    console.log("Postgres: migrations applied");
  } catch (e) {
    console.error("Postgres: startup failed", e);
    process.exit(1);
  }

  const app = createApp();

  const server = Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });

  const shutdown = async () => {
    await closePostgres();
    server.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());

  console.log(`Todo API running on http://localhost:${server.port} (/api/todo, docs at /docs)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
