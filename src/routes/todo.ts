import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import * as todoHandlers from "@/handlers/todo";
import {
  AddTodoRequest,
  AddTodoResponse,
  DeleteTodoResponse,
  ErrorResponse,
  Todo,
  TodoListResponse,
  TodoMutationSuccess,
} from "@/openapi/schemas";

const listTodosRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Todos"],
  summary: "List todos (paginated)",
  operationId: "listTodos",
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional().openapi({ example: 1 }),
      limit: z.coerce.number().int().min(1).optional().openapi({ example: 10 }),
    }),
  },
  responses: {
    200: {
      description: "Paginated todos",
      content: { "application/json": { schema: TodoListResponse } },
    },
  },
});

const createTodoRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Todos"],
  summary: "Create todo",
  operationId: "createTodo",
  request: {
    body: {
      content: { "application/json": { schema: AddTodoRequest } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: AddTodoResponse } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const getTodoRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Todos"],
  summary: "Get todo by id",
  operationId: "getTodoById",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: "id", in: "path" },
        example: "00000000-0000-4000-8000-000000000001",
      }),
    }),
  },
  responses: {
    200: {
      description: "Todo",
      content: { "application/json": { schema: Todo } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const updateTodoRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Todos"],
  summary: "Update todo (partial merge)",
  operationId: "updateTodo",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.record(z.string(), z.unknown()).openapi({
            description: "Fields to merge into the todo",
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: TodoMutationSuccess } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const deleteTodoRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Todos"],
  summary: "Delete todo",
  operationId: "deleteTodo",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      description: "Deleted",
      content: { "application/json": { schema: DeleteTodoResponse } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const todoRoutes = new OpenAPIHono();

todoRoutes.openapi(listTodosRoute, todoHandlers.getTodos);
todoRoutes.openapi(createTodoRoute, todoHandlers.addTodo);
todoRoutes.openapi(getTodoRoute, todoHandlers.getTodoById);
todoRoutes.openapi(updateTodoRoute, todoHandlers.updateTodo);
todoRoutes.openapi(deleteTodoRoute, todoHandlers.deleteTodo);

export { todoRoutes };
