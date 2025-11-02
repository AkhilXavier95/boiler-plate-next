// lib/rateLimit.ts
// Flexible, production-ready rate limiting utility for Next.js API routes

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory storage for rate limiting (dev / single instance)
const tokenMap = new Map<string, number[]>();

// Normalize IPv6 / localhost for consistency
function normalizeIp(ip: string): string {
  if (ip === "::1") return "127.0.0.1";
  return ip;
}

// Extract client identifier (IP-based)
function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = normalizeIp(
    forwardedFor?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown"
  );

  return ip;
}

// Optional helper: add route-level scope to differentiate endpoints
function getScopedKey(request: Request, scope: string): string {
  const identifier = getClientIdentifier(request);
  return `${scope}:${identifier}`;
}

// Cleanup old entries periodically (every 5 minutes)
if (
  typeof globalThis !== "undefined" &&
  !(globalThis as any).__rateLimitCleanup
) {
  (globalThis as any).__rateLimitCleanup = setInterval(
    () => {
      const now = Date.now();
      for (const [key, timestamps] of tokenMap.entries()) {
        const filtered = timestamps.filter((ts) => now - ts < 3600000); // Keep last hour
        if (filtered.length === 0) {
          tokenMap.delete(key);
        } else {
          tokenMap.set(key, filtered);
        }
      }
    },
    process.env.RATE_LIMIT_CLEANUP_MS
      ? Number(process.env.RATE_LIMIT_CLEANUP_MS)
      : 5 * 60 * 1000
  );
}

/**
 * Rate limiter generator (in-memory version)
 */
export function rateLimit(config: RateLimitConfig, scope = "global") {
  return async (request: Request): Promise<RateLimitResult> => {
    const key = getScopedKey(request, scope);
    const now = Date.now();

    let timestamps = tokenMap.get(key) || [];

    // Filter out old requests
    const windowStart = now - config.interval;
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // If exceeded limit
    if (timestamps.length >= config.uniqueTokenPerInterval) {
      const reset = timestamps[0] + config.interval;
      return {
        success: false,
        limit: config.uniqueTokenPerInterval,
        remaining: 0,
        reset
      };
    }

    // Add new request timestamp
    timestamps.push(now);
    tokenMap.set(key, timestamps);

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - timestamps.length,
      reset: now + config.interval
    };
  };
}

/**
 * Predefined rate limiters for different endpoints
 * These can be customized as needed.
 */
export const rateLimiters = {
  auth: rateLimit(
    { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 5 },
    "auth"
  ),
  login: rateLimit(
    { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 5 },
    "login"
  ),
  register: rateLimit(
    { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 3 },
    "register"
  ),
  passwordReset: rateLimit(
    { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 3 },
    "passwordReset"
  ),
  verify: rateLimit(
    { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 10 },
    "verify"
  )
};

/**
 * 🔮 Future-ready Redis-based rate limiter placeholder
 * For distributed apps, replace tokenMap logic above with a Redis implementation.
 *
 * Example with Upstash Redis:
 *
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 *
 * const redis = Redis.fromEnv();
 * const limiter = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(5, "10 m"),
 * });
 *
 * export async function rateLimitRedis(request: Request) {
 *   const key = getClientIdentifier(request);
 *   const { success, limit, remaining, reset } = await limiter.limit(key);
 *   return { success, limit, remaining, reset: reset * 1000 };
 * }
 */
