/**
 * Lightweight in-memory rate limiter (per-process).
 *
 * Note: Vercel serverless instances are short-lived and per-region, so this is
 * a best-effort spam guard, NOT a strict quota. For production-grade limiting,
 * back this with Upstash Redis or Vercel KV (drop-in by replacing the Map).
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Window size in milliseconds (default 60_000 = 1 minute). */
  windowMs?: number;
  /** Max requests allowed per window per key. */
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  { windowMs = 60_000, max }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt };
  }

  if (bucket.count >= max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { ok: true, remaining: max - bucket.count, resetAt: bucket.resetAt };
}

/**
 * Best-effort client IP extraction from common proxy headers (Vercel uses
 * `x-forwarded-for`). Falls back to a static key so we still get global
 * rate-limiting if the IP can't be determined.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}
