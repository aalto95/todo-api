# Todo API

A small PostgreSQL-backed Todo CRUD API built with **Bun**, **Hono** and
**Supabase**, with typed OpenAPI schemas and interactive Swagger docs.

## Features

- Full CRUD under `/api/todo` (paginated list, create, read, partial update, delete)
- Request/response validation with Zod via `@hono/zod-openapi`
- OpenAPI 3.0 document at `/openapi.json`, Swagger UI at `/docs`
- Health check at `/health` that pings Supabase
- Environment-driven CORS allow-list and centralized error handling
- Graceful shutdown on `SIGINT` / `SIGTERM`

## Requirements

- [Bun](https://bun.sh) >= 1.1.0
- A Supabase project (URL + anon key) with a `todos` table

## Setup

```bash
cp .env.example .env.development   # or .env
bun install
```

Fill in either the plain or the `NEXT_PUBLIC_` variants (both are supported):

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
# PORT=3001
```

Start the server:

```bash
bun run dev     # watch mode
bun run start   # plain start
```

The API then listens on `http://localhost:3001` by default. Startup fails fast if Supabase
is not configured or unreachable.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness + Supabase status |
| `GET` | `/api/todo?page=1&limit=10` | Paginated todos |
| `POST` | `/api/todo` | Create a todo (`name`, `text`, optional `dueDate`) |
| `GET` | `/api/todo/{id}` | Fetch one todo |
| `PUT` | `/api/todo/{id}` | Merge partial fields into a todo |
| `DELETE` | `/api/todo/{id}` | Delete a todo |

Example:

```bash
curl -X POST http://localhost:3001/api/todo \
  -H 'Content-Type: application/json' \
  -d '{"name":"Buy milk","text":"Two litres","dueDate":"2026-01-01"}'
```

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start with file watching |
| `bun run start` | Start the server |
| `bun run lint` | Biome checks |
| `bun run format` | Format with Biome |

## Project layout

```
src/
  server.ts           Bun entry point, startup checks, shutdown
  app.ts              Hono app, middleware, routes, OpenAPI + Swagger
  routes/todo.ts      Route definitions and schemas
  handlers/todo.ts    Request handlers
  db/supabase.ts      Supabase client and health ping
  db/todosRepo.ts     Data access
  openapi/schemas.ts  Zod schemas
  config/             CORS and origin helpers
```

## Environment

`.env.development` and `.env.example` are provided; secrets are not committed. The API uses
the Supabase anon key and expects the `todos` table to exist with the columns referenced by
`src/db/todosRepo.ts` (`id`, `name`, `text`, `dueDate`).
