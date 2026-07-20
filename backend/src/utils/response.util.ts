/**
 * Response Utility
 * 
 * Centralized API response formatter for consistent response shapes across all endpoints.
 * Format: { success, data?, error? } with appropriate HTTP status codes.
 */

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  errorCode?: string;
  message: string;
  details?: any;
  [key: string]: any; // Allow additional properties for specific error types
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Format a successful response
 */
export const successResponse = <T>(data: T): SuccessResponse<T> => {
  return {
    success: true,
    data,
  };
};

/**
 * Format an error response
 */
export const errorResponse = (
  message: string,
  errorCode?: string,
  details?: any,
  status: number = 500
): ErrorResponse => {
  return {
    success: false,
    errorCode,
    message,
    details,
  };
};

/**
 * Specific error for insufficient remaining amount
 */
export const insufficientAmountError = (
  remainingAmount: number,
  requestedAmount: number
): ErrorResponse => {
  return {
    success: false,
    errorCode: 'INSUFFICIENT_REMAINING_AMOUNT',
    message: 'Another devotee has already completed an Anudan.',
    remainingAmount,
    requestedAmount,
  };
};

/**
 * Validation error response
 */
export const validationError = (message: string, details?: any): ErrorResponse => {
  return {
    success: false,
    errorCode: 'VALIDATION_ERROR',
    message,
    details,
  };
};

/**
 * Authentication error response
 */
export const authenticationError = (message: string = 'Authentication required'): ErrorResponse => {
  return {
    success: false,
    errorCode: 'AUTHENTICATION_ERROR',
    message,
  };
};

/**
 * Authorization error response
 */
export const authorizationError = (message: string = 'Insufficient permissions'): ErrorResponse => {
  return {
    success: false,
    errorCode: 'AUTHORIZATION_ERROR',
    message,
  };
};

/**
 * Not found error response
 */
export const notFoundError = (resource: string): ErrorResponse => {
  return {
    success: false,
    errorCode: 'NOT_FOUND',
    message: `${resource} not found`,
  };
};

/**
 * Duplicate transaction error response
 */
export const duplicateTransactionError = (transactionId: string): ErrorResponse => {
  return {
    success: false,
    errorCode: 'DUPLICATE_TRANSACTION',
    message: `Transaction ${transactionId} has already been processed`,
  };
};
