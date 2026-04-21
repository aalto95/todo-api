import { createApp } from "@/app";
import { closeSupabase, isSupabaseConfigured, pingSupabase } from "@/db/supabase";

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  if (!isSupabaseConfigured()) {
    console.error(
      "SUPABASE_URL and SUPABASE_ANON_KEY are required (or NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
    process.exit(1);
  }

  try {
    await pingSupabase();
    console.log("Supabase: connection ok");
  } catch (e) {
    console.error("Supabase: startup failed", e);
    process.exit(1);
  }

  const app = createApp();

  const server = Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });

  const shutdown = async () => {
    await closeSupabase();
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
