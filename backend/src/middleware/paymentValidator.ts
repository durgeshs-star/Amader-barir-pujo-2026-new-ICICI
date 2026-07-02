/**
 * Payment Validation Middleware
 * 
 * Provides validation schemas for payment-related requests using express-validator.
 * All requests are validated before reaching the controller layer.
 */

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors';

/**
 * Validation result middleware
 * Checks for validation errors and returns a standardized error response
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
    }));

    throw new ValidationError('Validation failed', formattedErrors);
  }

  next();
};

/**
 * Create Order Validation Schema
 */
export const validateCreateOrder = [
  body('customerId')
    .trim()
    .notEmpty()
    .withMessage('Customer ID is required')
    .isString()
    .withMessage('Customer ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer ID must be between 1 and 100 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0')
    .isFloat({ max: 1000000 })
    .withMessage('Amount cannot exceed 1,000,000'),

  body('currency')
    .optional()
    .trim()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of: INR, USD, EUR, GBP'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),

  handleValidationErrors,
];

/**
 * Payment Callback Validation Schema
 */
export const validatePaymentCallback = [
  body('transactionId')
    .trim()
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isString()
    .withMessage('Transaction ID must be a string'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['SUCCESS', 'FAILED', 'CANCELLED', 'PENDING', 'PROCESSING'])
    .withMessage('Status must be one of: SUCCESS, FAILED, CANCELLED, PENDING, PROCESSING'),

  body('paymentMode')
    .optional()
    .trim()
    .isIn(['CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'WALLET', 'EMI'])
    .withMessage('Payment mode must be one of: CREDIT_CARD, DEBIT_CARD, NET_BANKING, UPI, WALLET, EMI'),

  body('bankReference')
    .optional()
    .trim()
    .isString()
    .withMessage('Bank reference must be a string'),

  handleValidationErrors,
];

/**
 * Transaction Status Validation Schema
 */
export const validateTransactionStatus = [
  param('transactionId')
    .trim()
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isString()
    .withMessage('Transaction ID must be a string'),

  handleValidationErrors,
];

/**
 * Refund Validation Schema
 */
export const validateRefund = [
  body('transactionId')
    .trim()
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isString()
    .withMessage('Transaction ID must be a string'),

  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0'),

  body('reason')
    .optional()
    .trim()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),

  handleValidationErrors,
];

/**
 * Payment History Validation Schema
 */
export const validatePaymentHistory = [
  query('customerId')
    .trim()
    .notEmpty()
    .withMessage('Customer ID is required')
    .isString()
    .withMessage('Customer ID must be a string'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors,
];
