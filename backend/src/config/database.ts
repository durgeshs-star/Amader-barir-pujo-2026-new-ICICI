/**
 * Database Configuration
 * 
 * Handles Google Sheets initialization for data storage.
 * Provides initialization and error handling for the database.
 */

import { GoogleSheetsService } from '../services/GoogleSheetsService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Sheets Service instance
 */
let sheetsService: GoogleSheetsService | null = null;

/**
 * Connect to Google Sheets
 * 
 * @returns Promise that resolves when connection is established
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    sheetsService = new GoogleSheetsService();
    await sheetsService.initialize();
    console.log('Google Sheets connected successfully');
  } catch (error) {
    console.error('Google Sheets connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from Google Sheets
 * 
 * @returns Promise that resolves when connection is closed
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    sheetsService = null;
    console.log('Google Sheets disconnected successfully');
  } catch (error) {
    console.error('Google Sheets disconnection error:', error);
    throw error;
  }
};

/**
 * Get database connection status
 * 
 * @returns Connection status (true = connected, false = disconnected)
 */
export const getDatabaseStatus = (): boolean => {
  return sheetsService !== null;
};

/**
 * Get the Google Sheets service instance
 */
export const getSheetsService = (): GoogleSheetsService => {
  if (!sheetsService) {
    throw new Error('Google Sheets service not initialized');
  }
  return sheetsService;
};

/**
 * Handle application termination
 * Close database connection gracefully when process exits
 */
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
