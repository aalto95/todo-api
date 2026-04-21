import { normalizeOrigin, vercelRendererOrigin } from "@/config/originUtils";

/** Origins allowed for CORS (aligned with sdui-orchestrator static list). */
export function corsAllowedOrigins(): string[] {
  return [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://sdui-example.vercel.app",
    "https://todo-api-eight-ochre.vercel.app",
    vercelRendererOrigin(),
  ];
}

/**
 * Requests without `Origin` (curl, server-to-server) are allowed.
 * Otherwise the origin must be in the static allowlist.
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  const n = normalizeOrigin(origin);
  for (const o of corsAllowedOrigins()) {
    if (normalizeOrigin(o) === n) return true;
  }
  return false;
}
