/**
 * Database Configuration
 * 
 * Handles MongoDB and Google Sheets initialization for data storage.
 * Provides initialization and error handling for both databases.
 */

import mongoose from 'mongoose';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Sheets Service instance
 */
let sheetsService: GoogleSheetsService | null = null;

/**
 * Connect to MongoDB
 * 
 * @returns Promise that resolves when connection is established
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_UR;
    if (!mongoUri) {
      throw new Error('MONGODB_UR is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * 
 * @returns Promise that resolves when connection is closed
 */
export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
};

/**
 * Connect to Google Sheets
 * 
 * @returns Promise that resolves when connection is established
 */
export const connectGoogleSheets = async (): Promise<void> => {
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
export const disconnectGoogleSheets = async (): Promise<void> => {
  try {
    sheetsService = null;
    console.log('Google Sheets disconnected successfully');
  } catch (error) {
    console.error('Google Sheets disconnection error:', error);
    throw error;
  }
};

/**
 * Connect to all databases (MongoDB and Google Sheets)
 * 
 * @returns Promise that resolves when all connections are established
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await connectMongoDB();
    await connectGoogleSheets();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from all databases
 * 
 * @returns Promise that resolves when all connections are closed
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await disconnectMongoDB();
    await disconnectGoogleSheets();
  } catch (error) {
    console.error('Database disconnection error:', error);
    throw error;
  }
};

/**
 * Get database connection status
 * 
 * @returns Connection status (true = connected, false = disconnected)
 */
export const getDatabaseStatus = (): { mongo: boolean; sheets: boolean } => {
  return {
    mongo: mongoose.connection.readyState === 1,
    sheets: sheetsService !== null,
  };
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
 * Close database connections gracefully when process exits
 */
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
