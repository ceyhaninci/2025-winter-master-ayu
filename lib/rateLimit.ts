import { security } from "@/lib/security";

/**
 * Minimal in-memory rate limiter (per process).
 * NOTE: On serverless/multi-instance deployments, use Redis or a shared store.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  if (security.rateLimit === "off") {
    return { ok: true, remaining: limit, resetAt: Date.now() + windowMs, disabled: true as const };
  }

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
