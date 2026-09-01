/**
 * Utility functions for booking cutoff logic
 * All time comparisons use IST (Asia/Kolkata timezone)
 */

import { PUJA_BOOKING_CUTOFFS } from "../config/pujaConfig";

/**
 * Check if booking is closed for a specific puja
 * @param pujaKey - The key from PUJA_BOOKING_CUTOFFS (e.g., 'saptami', 'ashtami')
 * @returns true if booking is closed, false if still open
 */
export const isBookingClosed = (pujaKey: string): boolean => {
  const cutoffConfig = PUJA_BOOKING_CUTOFFS[pujaKey];

  if (!cutoffConfig) {
    console.warn(`[BookingUtils] No cutoff config found for puja key: ${pujaKey}`);
    return false;
  }

  // cutoffISO already contains IST offset, so direct comparison is timezone-independent
  const now = new Date();
  const cutoffDate = new Date(cutoffConfig.cutoffISO);

  const isClosed = now >= cutoffDate;

  if (isClosed) {
    console.log(`[BookingUtils] Booking closed for ${cutoffConfig.pujaName}. Cutoff: ${cutoffConfig.cutoffISO}, Current: ${now.toISOString()}`);
  }

  return isClosed;
};

/**
 * Get the cutoff timestamp for a specific puja
 * @param pujaKey - The key from PUJA_BOOKING_CUTOFFS
 * @returns ISO string of the cutoff timestamp
 */
export const getCutoffTimestamp = (pujaKey: string): string | null => {
  const cutoffConfig = PUJA_BOOKING_CUTOFFS[pujaKey];
  return cutoffConfig?.cutoffISO || null;
};

/**
 * Get the puja name for display
 * @param pujaKey - The key from PUJA_BOOKING_CUTOFFS
 * @returns The puja name
 */
export const getPujaName = (pujaKey: string): string => {
  const cutoffConfig = PUJA_BOOKING_CUTOFFS[pujaKey];
  return cutoffConfig?.pujaName || pujaKey;
};

/**
 * Get the remaining time until cutoff (in milliseconds)
 * @param pujaKey - The key from PUJA_BOOKING_CUTOFFS
 * @returns Remaining time in milliseconds, or 0 if closed
 */
export const getTimeUntilCutoff = (pujaKey: string): number => {
  const cutoffConfig = PUJA_BOOKING_CUTOFFS[pujaKey];

  if (!cutoffConfig) {
    return 0;
  }

  // cutoffISO already contains IST offset, so direct comparison is timezone-independent
  const now = new Date();
  const cutoffDate = new Date(cutoffConfig.cutoffISO);
  const remaining = cutoffDate.getTime() - now.getTime();

  return Math.max(0, remaining);
};
