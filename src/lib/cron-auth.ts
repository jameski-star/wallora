import type { NextRequest } from "next/server";
import { env } from "./env";

/**
 * Authorize a cron request. Vercel Cron sends `Authorization: Bearer <secret>`.
 * Also accepts `?secret=` for manual triggering. When CRON_SECRET is unset
 * (local demo), requests are allowed so the endpoints are testable.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  if (!env.cronSecret) return true;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${env.cronSecret}`) return true;
  if (request.nextUrl.searchParams.get("secret") === env.cronSecret) return true;
  return false;
}
