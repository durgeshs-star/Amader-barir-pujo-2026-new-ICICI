/**
 * Payment Status Constants
 * 
 * Defines all possible payment statuses throughout the payment lifecycle.
 * These statuses are used in the database and API responses.
 */

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment Status Descriptions
 * Used for user-facing messages
 */
export const PaymentStatusDescriptions: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Payment is pending initiation',
  [PaymentStatus.PROCESSING]: 'Payment is being processed',
  [PaymentStatus.SUCCESS]: 'Payment completed successfully',
  [PaymentStatus.FAILED]: 'Payment failed',
  [PaymentStatus.CANCELLED]: 'Payment was cancelled by user',
};

/**
 * Payment Mode Constants
 * Represents different payment methods
 */
export enum PaymentMode {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  NET_BANKING = 'NET_BANKING',
  UPI = 'UPI',
  WALLET = 'WALLET',
  EMI = 'EMI',
}

/**
 * Response Codes from Payment Gateway
 * TODO: Update these based on ICICI documentation
 */
export enum GatewayResponseCode {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
}

/**
 * Currency Codes
 */
export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

/**
 * Default Currency
 */
export const DEFAULT_CURRENCY = Currency.INR;

/**
 * Transaction ID Prefix
 * Used to generate unique transaction IDs
 */
export const TRANSACTION_ID_PREFIX = 'TXN';

/**
 * Order ID Prefix
 * Used to generate unique order IDs
 */
export const ORDER_ID_PREFIX = 'ORD';

/**
 * Payment Status Transitions
 * Defines valid status transitions
 * Used to prevent invalid status changes
 */
export const ValidStatusTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.CANCELLED],
  [PaymentStatus.PROCESSING]: [PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
  [PaymentStatus.SUCCESS]: [], // Terminal state
  [PaymentStatus.FAILED]: [], // Terminal state
  [PaymentStatus.CANCELLED]: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export const isValidStatusTransition = (
  from: PaymentStatus,
  to: PaymentStatus
): boolean => {
  return ValidStatusTransitions[from].includes(to);
};

/**
 * Check if status is a terminal state
 */
export const isTerminalStatus = (status: PaymentStatus): boolean => {
  return (
    status === PaymentStatus.SUCCESS ||
    status === PaymentStatus.FAILED ||
    status === PaymentStatus.CANCELLED
  );
};

/**
 * Check if status is a processing state
 */
export const isProcessingStatus = (status: PaymentStatus): boolean => {
  return status === PaymentStatus.PROCESSING;
};
