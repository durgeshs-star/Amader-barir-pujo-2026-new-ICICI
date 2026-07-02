/**
 * Custom Error Classes
 * 
 * Provides a hierarchy of custom error classes for centralized error handling.
 * Each error class has a specific HTTP status code and error code.
 */

/**
 * Base Application Error
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational:	boolean = true,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 * Used when request validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

/**
 * Authentication Error (401)
 * Used when authentication fails
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error (403)
 * Used when user lacks permission
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error (404)
 * Used when resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Payment Error (400)
 * Used for payment-related errors
 */
export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed', details?: any) {
    super(message, 400, 'PAYMENT_ERROR', true, details);
  }
}

/**
 * Gateway Error (502)
 * Used when payment gateway fails
 */
export class GatewayError extends AppError {
  constructor(message: string = 'Payment gateway error', details?: any) {
    super(message, 502, 'GATEWAY_ERROR', true, details);
  }
}

/**
 * Database Error (500)
 * Used for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', true, details);
  }
}

/**
 * Conflict Error (409)
 * Used for duplicate resources or conflicts
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT_ERROR', true, details);
  }
}

/**
 * Rate Limit Error (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Configuration Error (500)
 * Used when configuration is invalid
 */
export class ConfigurationError extends AppError {
  constructor(message: string = 'Configuration error') {
    super(message, 500, 'CONFIGURATION_ERROR', false);
  }
}
