// Basic in-memory, per-process rate limiter. Good enough to blunt casual
// abuse of the free-tier Gemini quota on a single-instance deployment.
// It does NOT share state across serverless instances or survive restarts —
// if this app ever needs to scale horizontally, replace this with a shared
// store (e.g. Upstash Redis) behind the same checkRateLimit interface.

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

let callsSinceSweep = 0;

/** Opportunistically drop expired buckets so the map doesn't grow forever. */
function sweepExpired(now: number) {
  callsSinceSweep += 1;
  if (callsSinceSweep < 100) return;
  callsSinceSweep = 0;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  key: string,
  {
    windowMs = WINDOW_MS,
    maxRequests = MAX_REQUESTS_PER_WINDOW,
  }: { windowMs?: number; maxRequests?: number } = {},
): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Best-effort client IP extraction behind a proxy (e.g. Vercel). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
