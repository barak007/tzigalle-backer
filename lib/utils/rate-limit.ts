/**
 * Simple in-memory rate limiter for Next.js server actions
 *
 * Note: For production with multiple instances, consider using Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional identifier (defaults to 'global')
   */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is within rate limit
 *
 * @param identifier - Unique identifier for the rate limit (e.g., user ID, IP)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 *
 * @example
 * const result = await checkRateLimit(userId, {
 *   maxRequests: 10,
 *   windowMs: 3600000, // 1 hour
 * });
 *
 * if (!result.success) {
 *   return { error: "Too many requests" };
 * }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${config.identifier || "global"}_${identifier}`;

  // Get or create entry
  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual overrides
 */
export function resetRateLimit(
  identifier: string,
  configIdentifier?: string
): void {
  const key = `${configIdentifier || "global"}_${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${config.identifier || "global"}_${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }

  return {
    success: entry.count < config.maxRequests,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit configurations for different operations
 */
export const RATE_LIMITS = {
  // Order creation: 10 orders per hour per user
  ORDER_CREATION: {
    maxRequests: 10,
    windowMs: 3600000, // 1 hour
    identifier: "order_creation",
  },

  // Login attempts: 5 attempts per 15 minutes
  LOGIN: {
    maxRequests: 5,
    windowMs: 900000, // 15 minutes
    identifier: "login",
  },

  // General API: 100 requests per minute
  GENERAL_API: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    identifier: "general_api",
  },
} as const;
