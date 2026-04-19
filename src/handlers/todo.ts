import type { Context } from "hono";
import * as todosRepo from "@/db/todosRepo";
import { valid } from "@/lib/validatedRequest";

export async function getTodos(c: Context) {
  const q = valid<{ page?: number; limit?: number }>(c, "query");
  const page = q.page ?? 1;
  const limit = q.limit ?? 10;

  const result = await todosRepo.getTodosPage({ page, limit });

  return c.json(
    {
      data: result.data,
      total: result.total,
      totalPages: result.totalPages,
    },
    200,
  );
}

export async function getTodoById(c: Context) {
  const { id } = valid<{ id: string }>(c, "param");
  const result = await todosRepo.getTodoById(id);
  if (result === undefined) {
    return c.json({ success: false, message: "Not found" }, 404);
  }
  return c.json(result, 200);
}

export async function addTodo(c: Context) {
  const body = valid<{ name: string; text: string; dueDate?: string }>(c, "json");

  const result = await todosRepo.addTodo({
    name: body.name,
    text: body.text,
    dueDate: body.dueDate != null ? String(body.dueDate) : undefined,
  });

  return c.json(
    {
      success: true,
      message: "Item added successfully",
      data: result.data,
    },
    200,
  );
}

export async function updateTodo(c: Context) {
  const { id } = valid<{ id: string }>(c, "param");
  const body = valid<Record<string, unknown>>(c, "json");

  const result = await todosRepo.updateTodo(id, body);

  return c.json(
    {
      success: true,
      message: "Item updated successfully",
      data: result.data,
    },
    200,
  );
}

export async function deleteTodo(c: Context) {
  const { id } = valid<{ id: string }>(c, "param");
  await todosRepo.deleteTodo(id);

  return c.json(
    {
      success: true,
      message: "Item deleted successfully",
    },
    200,
  );
}
