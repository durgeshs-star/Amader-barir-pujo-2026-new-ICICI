/**
 * Reset Anudan amounts to original values
 * 
 * This script:
 * 1. Deletes all AnudanPayment records from MongoDB
 * 2. After running this, restart the backend server to reinitialize in-memory state
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amader-barir-pujo';

console.log('MongoDB URI:', mongoURI ? 'Found in .env' : 'Using default localhost');

async function resetAnudan() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Define the AnudanPayment schema inline
    const anudanPaymentSchema = new mongoose.Schema({
      orderId: { type: String, required: true, unique: true },
      transactionId: { type: String, required: true },
      timestamp: { type: String, required: true },
      userInfo: {
        name: String,
        phone: String,
        email: String
      },
      categories: [{
        day: String,
        amount: Number,
        items: Array,
        remark: String
      }],
      totalAmount: Number
    });

    const AnudanPayment = mongoose.model('AnudanPayment', anudanPaymentSchema);

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
