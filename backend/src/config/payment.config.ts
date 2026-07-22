/**
 * Payment Gateway Configuration
 * 
 * This file centralizes all payment-related configuration.
 * Environment variables are validated during application startup.
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Payment Provider Types
 * - mock: Uses mock payment service for testing
 * - icici: Uses new ICICI PG (Standard/Redirection mode)
 * - sandbox: Uses old ICICI sandbox environment (deprecated)
 * - production: Uses old ICICI production environment (deprecated)
 */
export type PaymentProvider = 'mock' | 'icici' | 'sandbox' | 'production';

/**
 * Payment Configuration Interface
 */
interface PaymentConfig {
  // ICICI Credentials
  merchantId: string;
  terminalId: string;
  accessKey: string;
  secretKey: string;
  workingKey: string;

  // ICICI URLs
  sandboxUrl: string;
  productionUrl: string;

  // Payment URLs
  callbackUrl: string;
  redirectUrl: string;

  // Provider
  provider: PaymentProvider;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Validate required environment variables
 * Throws error if critical configuration is missing
 */
const validateConfig = (): void => {
  const requiredVars: string[] = [];

  const provider = process.env.PAYMENT_PROVIDER as PaymentProvider;

  // Validate based on provider type
  if (provider === 'icici') {
    // New ICICI PG (Standard/Redirection mode)
    if (!process.env.ICICI_PG_MERCHANT_ID) requiredVars.push('ICICI_PG_MERCHANT_ID');
    if (!process.env.ICICI_PG_AGGREGATOR_ID) requiredVars.push('ICICI_PG_AGGREGATOR_ID');
    if (!process.env.ICICI_PG_SECRET_KEY) requiredVars.push('ICICI_PG_SECRET_KEY');
    if (!process.env.ICICI_PG_RETURN_URL) requiredVars.push('ICICI_PG_RETURN_URL');
  } else if (provider === 'sandbox' || provider === 'production') {
    // Old ICICI credentials (deprecated)
    if (!process.env.ICICI_MERCHANT_ID) requiredVars.push('ICICI_MERCHANT_ID');
    if (!process.env.ICICI_TERMINAL_ID) requiredVars.push('ICICI_TERMINAL_ID');
    if (!process.env.ICICI_ACCESS_KEY) requiredVars.push('ICICI_ACCESS_KEY');
    if (!process.env.ICICI_SECRET_KEY) requiredVars.push('ICICI_SECRET_KEY');
    if (!process.env.ICICI_WORKING_KEY) requiredVars.push('ICICI_WORKING_KEY');
    if (!process.env.PAYMENT_CALLBACK_URL) requiredVars.push('PAYMENT_CALLBACK_URL');
  }

  // Always validate these
  if (!process.env.PAYMENT_REDIRECT_URL) requiredVars.push('PAYMENT_REDIRECT_URL');
  if (!provider) requiredVars.push('PAYMENT_PROVIDER');

  if (requiredVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${requiredVars.join(', ')}`
    );
  }

  // Validate PAYMENT_PROVIDER value
  const validProviders: PaymentProvider[] = ['mock', 'icici', 'sandbox', 'production'];
  if (!validProviders.includes(provider)) {
    throw new Error(
      `Invalid PAYMENT_PROVIDER: ${provider}. Must be one of: ${validProviders.join(', ')}`
    );
  }
};

/**
 * Get the appropriate API URL based on provider
 */
const getApiUrl = (): string => {
  const provider = process.env.PAYMENT_PROVIDER as PaymentProvider;
  
  if (provider === 'mock' || provider === 'icici') {
    return 'mock://internal'; // icici uses its own service
  }
  
  if (provider === 'sandbox') {
    return process.env.ICICI_SANDBOX_URL || 'https://api.icicibank.com/sandbox';
  }
  
  return process.env.ICICI_PRODUCTION_URL || 'https://api.icicibank.com/production';
};

/**
 * Payment Configuration Object
 * 
 * This object is used throughout the application to access payment configuration.
 * It is validated during application startup.
 */
export const paymentConfig: PaymentConfig = {
  merchantId: process.env.ICICI_MERCHANT_ID || '',
  terminalId: process.env.ICICI_TERMINAL_ID || '',
  accessKey: process.env.ICICI_ACCESS_KEY || '',
  secretKey: process.env.ICICI_SECRET_KEY || '',
  workingKey: process.env.ICICI_WORKING_KEY || '',
  sandboxUrl: process.env.ICICI_SANDBOX_URL || 'https://api.icicibank.com/sandbox',
  productionUrl: process.env.ICICI_PRODUCTION_URL || 'https://api.icicibank.com/production',
  callbackUrl: process.env.PAYMENT_CALLBACK_URL || '',
  redirectUrl: process.env.PAYMENT_REDIRECT_URL || '',
  provider: (process.env.PAYMENT_PROVIDER as PaymentProvider) || 'mock',
  rateLimitWindowMs: parseInt(process.env.PAYMENT_RATE_LIMIT_WINDOW_MS || '300000'),
  rateLimitMaxRequests: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX_REQUESTS || '3'),
};

/**
 * Initialize and validate payment configuration
 * Call this during application startup
 */
export const initializePaymentConfig = (): void => {
  try {
    validateConfig();
    console.log(`Payment configuration initialized successfully with provider: ${paymentConfig.provider}`);
  } catch (error) {
    console.error('Payment configuration validation failed:', error);
    throw error;
  }
};

/**
 * Get current API URL based on provider
 */
export const getCurrentApiUrl = (): string => {
  return getApiUrl();
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return paymentConfig.provider === 'production';
};

/**
 * Check if running in sandbox mode
 */
export const isSandbox = (): boolean => {
  return paymentConfig.provider === 'sandbox';
};

/**
 * Check if running in mock mode
 */
export const isMock = (): boolean => {
  return paymentConfig.provider === 'mock';
};
