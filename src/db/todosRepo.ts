import { getSupabase } from "@/db/supabase";

export type Todo = {
  id: string;
  name: string;
  text: string;
  dueDate?: string;
};

type TodoRow = {
  id: string;
  name: string;
  text: string;
  due_date: string | null;
};

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    name: row.name,
    text: row.text,
    ...(row.due_date != null && row.due_date !== "" ? { dueDate: row.due_date } : {}),
  };
}

function sbError(e: { message: string }) {
  return new Error(e.message);
}

export async function getTodosPage(query: { page?: number; limit?: number }) {
  const supabase = getSupabase();
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;
  const rangeEnd = offset + limit - 1;

  const { count, error: countError } = await supabase
    .from("todos")
    .select("*", { count: "exact", head: true });

  if (countError) throw sbError(countError);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit) || 0;

  const { data: rows, error } = await supabase
    .from("todos")
    .select("id, name, text, due_date")
    .order("id", { ascending: true })
    .range(offset, rangeEnd);

  if (error) throw sbError(error);

  return {
    data: (rows ?? []).map((r) => rowToTodo(r as TodoRow)),
    total,
    totalPages,
  };
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("todos")
    .select("id, name, text, due_date")
    .eq("id", id)
    .maybeSingle();

  if (error) throw sbError(error);
  if (!data) return undefined;
  return rowToTodo(data as TodoRow);
}

export async function addTodo(todoData: { name: string; text: string; dueDate?: string }) {
  const supabase = getSupabase();
  const id = crypto.randomUUID();
  const { error } = await supabase.from("todos").insert({
    id,
    name: todoData.name,
    text: todoData.text,
    due_date: todoData.dueDate ?? null,
  });

  if (error) throw sbError(error);
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

  const supabase = getSupabase();
  const { error } = await supabase
    .from("todos")
    .update({
      name,
      text,
      due_date: dueDate,
    })
    .eq("id", id);

  if (error) throw sbError(error);

  const data = await getTodoById(id);
  if (!data) {
    throw new Error(`Todo with id ${id} disappeared after update`);
  }
  return { success: true as const, data };
}

export async function deleteTodo(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw sbError(error);
  return { success: true as const };
}
