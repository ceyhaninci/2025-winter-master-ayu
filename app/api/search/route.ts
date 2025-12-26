import { searchSchema } from "@/lib/validation";
import { getSessionFromCookies } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
import { jsonError, jsonOk } from "@/lib/http";
import { security } from "@/lib/security";
import { createSearchLog, listSearchLogs } from "@/lib/data";

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) return jsonError("Unauthorized.", 401);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`search:${session.userId}:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests.", 429, undefined, { meta: { remaining: rl.remaining, resetAt: rl.resetAt } });
  }

  const body = await req.json().catch(() => null);
  let query: string | undefined;
  if (security.validation === "on") {
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      log("warn", "search_validation_failed", { ip, userId: session.userId });
      return jsonError("Invalid input.", 400, undefined, { meta: { remaining: rl.remaining, resetAt: rl.resetAt } });
    }
    query = parsed.data.query;
  } else {
    query = typeof body?.query === "string" ? body.query : undefined;
    if (!query) return jsonError("Invalid input.", 400);
  }

  try {
    // Store query safely:
    // - Prisma mode: ORM parameterizes queries
    // - Raw mode: mysql2 uses placeholders (prevents SQL injection)
    await createSearchLog(session.userId, query);
    const items = await listSearchLogs(session.userId, 10);

    log("info", "search_logged", { userId: session.userId, ip, qLen: query.length, dataAccess: security.dataAccess });
    return jsonOk({ ok: true, items, meta: { remaining: rl.remaining, resetAt: rl.resetAt }, dataAccess: security.dataAccess });
  } catch (e) {
    log("error", "search_error", { userId: session.userId, ip, dataAccess: security.dataAccess });
    return jsonError("Server error.", 500, e, { meta: { remaining: rl.remaining, resetAt: rl.resetAt } });
  }
}
