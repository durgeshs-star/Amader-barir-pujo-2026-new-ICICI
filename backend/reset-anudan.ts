import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AnudanPayment } from './src/models/AnudanPayment';

dotenv.config();

const resetAnudan = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Count successful payments
    const count = await AnudanPayment.countDocuments({ paymentStatus: 'success' });
    console.log(`Found ${count} successful Anudan payments.`);

    if (count > 0) {
      // Update them to 'cancelled' so they don't count towards collected amounts
      const result = await AnudanPayment.updateMany(
        { paymentStatus: 'success' },
        { $set: { paymentStatus: 'cancelled', remark: 'Reset for testing' } }
      );
      console.log(`Successfully reset ${result.modifiedCount} payments.`);
    } else {
      console.log('No successful payments to reset.');
    }

  } catch (error) {
    console.error('Error resetting Anudan values:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

resetAnudan();
