import { getSql } from "@/db/postgres";

/** Apply idempotent DDL (safe to run on every startup). */
export async function runMigrations(): Promise<void> {
  const sql = getSql();

  await sql`
    create table if not exists todos (
      id uuid primary key,
      name text not null,
      text text not null,
      due_date text
    )
  `;
}
