/**
 * Structured logging utility for booking events
 * Provides consistent logging format across the application
 */

export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  pujaKey?: string;
  details?: Record<string, unknown>;
}

/**
 * Log a booking-related event with structured format
 */
export const logBookingEvent = (
  event: string,
  level: LogLevel = LogLevel.INFO,
  pujaKey?: string,
  details?: Record<string, unknown>
): void => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    pujaKey,
    details: details ? { ...details } : undefined,
  };

  // Format log message
  const message = `[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.event}]${pujaKey ? ` [${pujaKey}]` : ''}${details ? ` ${JSON.stringify(details)}` : ''}`;

  // Output to console based on level
  switch (level) {
    case LogLevel.ERROR:
      console.error(message);
      break;
    case LogLevel.WARN:
      console.warn(message);
      break;
    case LogLevel.INFO:
    default:
      console.log(message);
      break;
  }
};

/**
 * Log booking attempt
 */
export const logBookingAttempt = (pujaKey: string, category: string, quantity: number): void => {
  logBookingEvent('BOOKING_ATTEMPT', LogLevel.INFO, pujaKey, {
    category,
    quantity,
  });
};

/**
 * Log booking success
 */
export const logBookingSuccess = (pujaKey: string, bookingId: string, amount: number): void => {
  logBookingEvent('BOOKING_SUCCESS', LogLevel.INFO, pujaKey, {
    bookingId,
    amount,
  });
};

/**
 * Log booking failure
 */
export const logBookingFailure = (pujaKey: string, error: string): void => {
  logBookingEvent('BOOKING_FAILURE', LogLevel.ERROR, pujaKey, {
    error,
  });
};

/**
 * Log booking blocked due to cutoff
 */
export const logBookingBlocked = (pujaKey: string, cutoffTime: string): void => {
  logBookingEvent('BOOKING_BLOCKED', LogLevel.WARN, pujaKey, {
    cutoffTime,
  });
};

/**
 * Log payment initiation
 */
export const logPaymentInitiated = (pujaKey: string, amount: number, paymentMode: string): void => {
  logBookingEvent('PAYMENT_INITIATED', LogLevel.INFO, pujaKey, {
    amount,
    paymentMode,
  });
};

/**
 * Log payment success
 */
export const logPaymentSuccess = (pujaKey: string, transactionId: string): void => {
  logBookingEvent('PAYMENT_SUCCESS', LogLevel.INFO, pujaKey, {
    transactionId,
  });
};

/**
 * Log payment failure
 */
export const logPaymentFailure = (pujaKey: string, error: string): void => {
  logBookingEvent('PAYMENT_FAILURE', LogLevel.ERROR, pujaKey, {
    error,
  });
};
