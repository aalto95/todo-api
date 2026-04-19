import { z } from "@hono/zod-openapi";

export const HealthResponse = z
  .object({
    ok: z.boolean(),
    service: z.string(),
    postgres: z.enum(["connected", "unconfigured", "error"]),
  })
  .openapi("HealthResponse");

export const Todo = z
  .object({
    id: z.uuid(),
    name: z.string(),
    text: z.string(),
    dueDate: z.string().optional(),
  })
  .openapi("Todo");

export const TodoListResponse = z
  .object({
    data: z.array(Todo),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })
  .openapi("TodoListResponse");

export const AddTodoRequest = z
  .object({
    name: z.string(),
    text: z.string(),
    dueDate: z.string().optional(),
  })
  .openapi("AddTodoRequest");

export const TodoMutationSuccess = z
  .object({
    success: z.boolean(),
    message: z.string(),
    data: Todo,
  })
  .openapi("TodoMutationSuccess");

export const AddTodoResponse = z
  .object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      name: z.string(),
      text: z.string(),
      dueDate: z.string().optional(),
    }),
  })
  .openapi("AddTodoResponse");

export const DeleteTodoResponse = z
  .object({
    success: z.boolean(),
    message: z.string(),
  })
  .openapi("DeleteTodoResponse");

export const ErrorResponse = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    errors: z.array(z.unknown()).optional(),
  })
  .openapi("ErrorResponse");
