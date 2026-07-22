/**
 * ICICI Payment Gateway Hash Calculation Service
 * 
 * Implements secureHash calculation for ICICI PG API requests and responses.
 * Supports both V1 (form fields) and V2 (JSON body) hash calculation methods.
 * 
 * Reference: ICICI Bank Payment Gateway Interface Specification Document
 */

import crypto from 'crypto';

const SECRET_KEY = process.env.ICICI_PG_SECRET_KEY as string;

/**
 * Hash Calculation V1
 * Used by: Initiate Sale (form fields), Refund/Void/Status (form-urlencoded), Settlement
 * Advice/Status/Summary, Generate QR
 * 
 * Algorithm:
 * 1. Take every request/response parameter that is not null and not an empty string
 * 2. Sort parameter names alphabetically (ascending)
 * 3. Concatenate the values (not names) in that sorted order into one string
 * 4. Compute HMAC-SHA256(concatenatedString, secretKey)
 * 5. Hex-encode the result
 * 6. Lowercase the hex string → this is secureHash
 * 
 * @param params - Plain object of request/response fields BEFORE adding secureHash itself
 * @returns The computed secureHash (lowercase hex string)
 */
export function computeSecureHashV1(params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'secureHash')
    .filter((k) => k !== 'securehash') // Handle both casing variations
    .filter((k) => params[k] !== null && params[k] !== undefined && params[k] !== '')
    .sort(); // ascending alphabetical by parameter name

  const concatenated = sortedKeys.map((k) => String(params[k])).join('');

  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(concatenated, 'ascii')
    .digest('hex')
    .toLowerCase();
}

/**
 * Hash Calculation V2
 * Used by: Get Card Bin, UserCancel API, Get Service Charges API (and any JSON-body API
 * that explicitly says "Hash Calculation v2")
 * 
 * Algorithm:
 * 1. Convert the JSON request/response body to a string using a minified JSON.stringify
 * 2. Compute HMAC-SHA256(minifiedJsonString, secretKey)
 * 3. Hex-encode, lowercase
 * 4. Send it in the HTTP request header 'securehash' (all lowercase) — NOT in the JSON body
 * 
 * @param jsonBody - The exact object you will POST (without secureHash/securehash key)
 * @returns The computed secureHash (lowercase hex string)
 */
export function computeSecureHashV2(jsonBody: Record<string, unknown>): string {
  const minified = JSON.stringify(jsonBody); // JSON.stringify is already minified by default
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(minified, 'ascii')
    .digest('hex')
    .toLowerCase();
}

/**
 * Verify a hash received from ICICI (constant-time compare to prevent timing attacks)
 * 
 * @param params - The parameters received from ICICI (including the secureHash field)
 * @param receivedHash - The secureHash value received from ICICI
 * @returns true if hash matches, false otherwise
 */
export function verifySecureHashV1(params: Record<string, unknown>, receivedHash: string): boolean {
  const expected = computeSecureHashV1(params);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from((receivedHash || '').toLowerCase())
    );
  } catch (error) {
    // If lengths don't match, timingSafeEqual throws
    return false;
  }
}

/**
 * Verify a V2 hash received from ICICI (constant-time compare)
 * 
 * @param jsonBody - The JSON body received from ICICI
 * @param receivedHash - The securehash header value received from ICICI
 * @returns true if hash matches, false otherwise
 */
export function verifySecureHashV2(jsonBody: Record<string, unknown>, receivedHash: string): boolean {
  const expected = computeSecureHashV2(jsonBody);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from((receivedHash || '').toLowerCase())
    );
  } catch (error) {
    // If lengths don't match, timingSafeEqual throws
    return false;
  }
}

/**
 * Sanitize merchantTxnNo to ensure it meets ICICI requirements
 * - Alphanumeric only (no special characters)
 * - Maximum 20 characters
 * 
 * @param transactionId - The app's transactionId (e.g., "TXN-1721643828212-LN1N73J5L")
 * @returns Sanitized merchantTxnNo suitable for ICICI API
 */
export function sanitizeMerchantTxnNo(transactionId: string): string {
  // Remove all non-alphanumeric characters
  const sanitized = transactionId.replace(/[^a-zA-Z0-9]/g, '');
  
  // Truncate to 20 characters if needed
  return sanitized.substring(0, 20);
}

/**
 * Format amount for ICICI API (nnnnnnnnn.nn format)
 * 
 * @param amount - The amount as a number
 * @returns Formatted amount string
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Format date for ICICI API (YYYYMMDDHHMMSS format)
 * 
 * @param date - The date object (defaults to current time)
 * @returns Formatted date string
 */
export function formatTxnDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
