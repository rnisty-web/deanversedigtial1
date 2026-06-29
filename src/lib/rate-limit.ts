import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, RateLimitEntry>();

export type RateLimitResult =
  | { success: true; remaining: number; resetAt: number }
  | { success: false; remaining: 0; resetAt: number };

const upstashLimiterCache = new Map<string, Ratelimit>();

function hasUpstashConfig(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${limit}:${windowSec}`;
  let limiter = upstashLimiterCache.get(cacheKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `ratelimit:${cacheKey}`,
      analytics: true,
    });
    upstashLimiterCache.set(cacheKey, limiter);
  }

  return limiter;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function rateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (hasUpstashConfig()) {
    try {
      const limiter = getUpstashLimiter(limit, windowMs);
      const result = await limiter.limit(key);
      if (result.success) {
        return {
          success: true,
          remaining: result.remaining,
          resetAt: result.reset,
        };
      }
      return {
        success: false,
        remaining: 0,
        resetAt: result.reset,
      };
    } catch (error) {
      console.error("[rate-limit] Upstash unavailable, using in-memory fallback:", error);
    }
  }

  return rateLimitInMemory(key, limit, windowMs);
}

/** @deprecated Use checkRateLimit for server routes (Upstash-aware). */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  return rateLimitInMemory(key, limit, windowMs);
}

export function rateLimitResponse(resetAt: number): Response {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));

  return Response.json(
    {
      error:
        "Too many requests. Please wait a moment and try again — we want to keep things secure for everyone.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
