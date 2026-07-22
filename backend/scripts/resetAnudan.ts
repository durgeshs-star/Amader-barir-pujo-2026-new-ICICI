/**
 * Reset Anudan amounts to original values
 * 
 * This script:
 * 1. Deletes all AnudanPayment records from MongoDB
 * 2. After running this, restart the backend server to reinitialize in-memory state
 */

import mongoose from 'mongoose';
import { AnudanPayment } from '../src/models/AnudanPayment';
import dotenv from 'dotenv';

dotenv.config();

async function resetAnudan() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete all AnudanPayment records
    const result = await AnudanPayment.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Anudan payment records`);

    console.log('✅ Anudan amounts reset successfully');
    console.log('⚠️  Please restart the backend server to reinitialize in-memory state');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting Anudan amounts:', error);
    process.exit(1);
  }
}

resetAnudan();
