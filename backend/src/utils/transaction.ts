/**
 * Transaction Utility Functions
 * 
 * Provides utilities for generating and validating transaction IDs,
 * order IDs, and other payment-related identifiers.
 */

import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_ID_PREFIX, ORDER_ID_PREFIX } from '../constants/paymentStatus';

/**
 * Generate a unique transaction ID
 * Format: TXN-{UUID}
 * 
 * @returns Unique transaction ID
 */
export const generateTransactionId = (): string => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
  return `${TRANSACTION_ID_PREFIX}-${uuid}`;
};

/**
 * Generate a unique order ID
 * Format: ORD-{UUID}
 * 
 * @returns Unique order ID
 */
export const generateOrderId = (): string => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
  return `${ORDER_ID_PREFIX}-${uuid}`;
};

/**
 * Validate transaction ID format
 * 
 * @param transactionId - Transaction ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidTransactionId = (transactionId: string): boolean => {
  const regex = new RegExp(`^${TRANSACTION_ID_PREFIX}-[A-Z0-9]{16}$`);
  return regex.test(transactionId);
};

/**
 * Validate order ID format
 * 
 * @param orderId - Order ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidOrderId = (orderId: string): boolean => {
  const regex = new RegExp(`^${ORDER_ID_PREFIX}-[A-Z0-9]{16}$`);
  return regex.test(orderId);
};

/**
 * Generate a reference ID for bank/gateway
 * This can be used to track payments with external systems
 * 
 * @returns Unique reference ID
 */
export const generateReferenceId = (): string => {
  return uuidv4().replace(/-/g, '').toUpperCase();
};

/**
 * Sanitize transaction ID
 * Removes any whitespace or special characters that might be injected
 * 
 * @param transactionId - Transaction ID to sanitize
 * @returns Sanitized transaction ID
 */
export const sanitizeTransactionId = (transactionId: string): string => {
  return transactionId.trim().toUpperCase();
};

/**
 * Sanitize order ID
 * Removes any whitespace or special characters that might be injected
 * 
 * @param orderId - Order ID to sanitize
 * @returns Sanitized order ID
 */
export const sanitizeOrderId = (orderId: string): string => {
  return orderId.trim().toUpperCase();
};

/**
 * Extract transaction ID from a string
 * Useful when transaction ID is embedded in a larger string
 * 
 * @param input - Input string containing transaction ID
 * @returns Extracted transaction ID or null if not found
 */
export const extractTransactionId = (input: string): string | null => {
  const regex = new RegExp(`(${TRANSACTION_ID_PREFIX}-[A-Z0-9]{16})`);
  const match = input.match(regex);
  return match ? match[1] : null;
};

/**
 * Mask transaction ID for logging
 * Shows only first 4 and last 4 characters
 * 
 * @param transactionId - Transaction ID to mask
 * @returns Masked transaction ID
 */
export const maskTransactionId = (transactionId: string): string => {
  if (!isValidTransactionId(transactionId)) {
    return 'INVALID_ID';
  }
  const prefix = transactionId.substring(0, 8);
  const suffix = transactionId.substring(transactionId.length - 4);
  return `${prefix}****${suffix}`;
};
