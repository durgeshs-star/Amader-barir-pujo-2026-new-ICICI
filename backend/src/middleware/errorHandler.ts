import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  PaymentError,
  GatewayError,
  DatabaseError,
  ConflictError,
  RateLimitError,
  ConfigurationError,
} from '../types/errors';

/**
 * Centralized Error Handler Middleware
 * 
 * Handles all errors in a consistent manner and returns appropriate HTTP responses.
 * Custom error classes are handled with their specific status codes and error codes.
 * Unexpected errors are logged and returned as 500 errors.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging (in production, use a proper logging service)
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle custom application errors
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    };

    // Include details if available (for validation errors)
    if (err.details) {
      response.error.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
