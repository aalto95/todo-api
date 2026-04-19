import { getSql } from "@/db/postgres";

export type Todo = {
  id: string;
  name: string;
  text: string;
  dueDate?: string;
};

function rowToTodo(row: { id: string; name: string; text: string; due_date: string | null }): Todo {
  return {
    id: row.id,
    name: row.name,
    text: row.text,
    ...(row.due_date != null && row.due_date !== "" ? { dueDate: row.due_date } : {}),
  };
}

export async function getTodosPage(query: { page?: number; limit?: number }) {
  const sql = getSql();
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;

  const countRows = await sql<{ c: number }[]>`select count(*)::int as c from todos`;
  const total = countRows[0]?.c ?? 0;
  const totalPages = Math.ceil(total / limit) || 0;

  const rows = await sql<{ id: string; name: string; text: string; due_date: string | null }[]>`
    select id::text, name, text, due_date
    from todos
    order by id
    limit ${limit}
    offset ${offset}
  `;

  return {
    data: rows.map(rowToTodo),
    total,
    totalPages,
  };
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
  const sql = getSql();
  const rows = await sql<{ id: string; name: string; text: string; due_date: string | null }[]>`
    select id::text, name, text, due_date from todos where id = ${id}::uuid
  `;
  const row = rows[0];
  return row ? rowToTodo(row) : undefined;
}

export async function addTodo(todoData: { name: string; text: string; dueDate?: string }) {
  const sql = getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into todos (id, name, text, due_date)
    values (${id}::uuid, ${todoData.name}, ${todoData.text}, ${todoData.dueDate ?? null})
  `;
  return { success: true as const, data: todoData };
}

export async function updateTodo(id: string, todoData: Record<string, unknown>) {
  const current = await getTodoById(id);
  if (!current) {
    throw new Error(`Todo with id ${id} not found`);
  }
  const merged = { ...current, ...todoData } as Record<string, unknown>;
  const name = String(merged.name ?? current.name);
  const text = String(merged.text ?? current.text);
  const dueRaw = merged.dueDate;
  const dueDate =
    dueRaw === undefined ? (current.dueDate ?? null) : dueRaw === null ? null : String(dueRaw);

  const sql = getSql();
  await sql`
    update todos
    set name = ${name}, text = ${text}, due_date = ${dueDate}
    where id = ${id}::uuid
  `;
  const data = await getTodoById(id);
  if (!data) {
    throw new Error(`Todo with id ${id} disappeared after update`);
  }
  return { success: true as const, data };
}

export async function deleteTodo(id: string) {
  const sql = getSql();
  await sql`delete from todos where id = ${id}::uuid`;
  return { success: true as const };
}
