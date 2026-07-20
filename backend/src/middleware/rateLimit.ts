/**
 * Rate Limiting Middleware
 * 
 * Provides route-specific rate limiters to protect APIs from abuse while
 * allowing legitimate traffic. All rate limiting is disabled in development
 * mode to facilitate local testing.
 * 
 * Environment:
 * - NODE_ENV=development: All rate limiting disabled
 * - NODE_ENV=production: Route-specific rate limiting enabled
 */

import rateLimit from 'express-rate-limit';

/**
 * Check if rate limiting should be enabled
 * Returns false in development, true in production
 */
const isRateLimitingEnabled = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Create a rate limiter that is only active in production
 * In development, returns a passthrough middleware that does nothing
 */
const createProductionRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  if (!isRateLimitingEnabled()) {
    // Return passthrough middleware for development
    return (_req: any, _res: any, next: any) => next();
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * Contact Form Rate Limiter
 * 
 * Purpose: Prevent spam contact submissions
 * Window: 15 minutes
 * Limit: 5 requests
 * 
 * Applied to: POST /api/contact
 */
export const contactLimiter = createProductionRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many contact form submissions. Please try again later.',
});

/**
 * Volunteer Registration Rate Limiter
 * 
 * Purpose: Prevent spam volunteer registrations
 * Window: 15 minutes
 * Limit: 5 requests
 * 
 * Applied to: POST /api/volunteer
 */
export const volunteerLimiter = createProductionRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many volunteer registration attempts. Please try again later.',
});

/**
 * Payment APIs Rate Limiter
 * 
 * Purpose: Protect payment endpoints while allowing genuine retries
 * Window: 1 minute
 * Limit: 20 requests
 * 
 * Applied to:
 * - POST /api/payment/create-order
 * - POST /api/payment/refund
 * - GET /api/payment/status/:transactionId
 * - GET /api/payment/history
 * 
 * Note: Callback and webhook endpoints are NOT rate limited as they are
 * called by the payment gateway
 */
export const paymentLimiter = createProductionRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many payment requests. Please try again later.',
});

/**
 * Remaining Amount APIs Rate Limiter
 * 
 * Purpose: Allow high-frequency polling for real-time updates
 * Window: 1 minute
 * Limit: 1000 requests
 * 
 * Applied to:
 * - GET /api/anudan/remaining
 * - GET /api/anudan/remaining-single
 * - GET /api/anudan/events (SSE endpoint)
 * 
 * These endpoints only return in-memory values and do not hit MongoDB,
 * so they can handle much higher request rates without performance impact.
 * The high limit ensures they never become unusable during normal usage.
 */
export const remainingLimiter = createProductionRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
  message: 'Too many requests to remaining amount endpoint.',
});

/**
 * No-op rate limiter for endpoints that should never be rate limited
 * 
 * Applied to:
 * - GET /health
 * - POST /api/payment/callback (gateway callback)
 * - POST /api/payment/webhook (gateway webhook)
 * 
 * This is a passthrough middleware that always allows requests.
 */
export const noLimiter = (_req: any, _res: any, next: any) => next();
