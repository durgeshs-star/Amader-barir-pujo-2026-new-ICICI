/**
 * Anudan Repository
 * 
 * Handles all MongoDB operations for Anudan payments.
 * Provides methods to create, read, and aggregate payment data.
 */

import { AnudanPayment, IAnudanPayment } from '../models/AnudanPayment';

export class AnudanRepository {
  /**
   * Create a new Anudan payment record
   */
  async createPayment(paymentData: {
    orderId: string;
    transactionId: string;
    timestamp: string;
    userInfo: {
      name: string;
      phone: string;
      email: string;
    };
    categories: Array<{
      day: string;
      amount: number;
      items: Array<{ name: string; cost: string }>;
      remark: string;
    }>;
    totalAmount: number;
    paymentStatus?: 'pending' | 'success' | 'failed' | 'cancelled';
    iciciTxnId?: string;
    iciciPaymentId?: string;
    iciciPaymentMode?: string;
    iciciPaymentDateTime?: string;
    iciciResponseCode?: string;
  }): Promise<IAnudanPayment> {
    try {
      const payment = new AnudanPayment(paymentData);
      await payment.save();
      return payment;
    } catch (error) {
      console.error('Error creating Anudan payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<IAnudanPayment | null> {
    try {
      return await AnudanPayment.findOne({ orderId });
    } catch (error) {
      console.error('Error fetching Anudan payment by order ID:', error);
      throw error;
    }
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<IAnudanPayment | null> {
    try {
      const payment = await AnudanPayment.findOne({ transactionId });
      if (payment) return payment;

      // ICICI callbacks contain the alphanumeric, 20-character merchantTxnNo.
      // Older records stored the frontend value (TXN-<timestamp>-<random>) instead.
      const legacyParts = transactionId.match(/^([A-Za-z]+)(\d{13})([A-Za-z0-9]{4})$/);
      if (!legacyParts) return null;

      const legacyPrefix = `${legacyParts[1]}-${legacyParts[2]}-${legacyParts[3]}`;
      return await AnudanPayment.findOne({
        transactionId: { $regex: `^${legacyPrefix}` },
      });
    } catch (error) {
      console.error('Error fetching Anudan payment by transaction ID:', error);
      throw error;
    }
  }

  /**
   * Get collected amount for each Anudan category
   * Optimized with index hint and lean projection for faster cold starts
   * Only counts successful payments to avoid including failed/cancelled transactions
   */
  async getCollectedAmountsByCategory(): Promise<Record<string, number>> {
    try {
      const startTime = Date.now();
      const result = await AnudanPayment.aggregate([
        {
          $match: {
            paymentStatus: 'success', // Only count successful payments
          },
        },
        {
          $unwind: '$categories',
        },
        {
          $group: {
            _id: '$categories.day',
            totalAmount: { $sum: '$categories.amount' },
          },
        },
      ]).allowDiskUse(true); // Allow disk use for large datasets

      const duration = Date.now() - startTime;
      console.log(`[AnudanRepository] getCollectedAmountsByCategory completed in ${duration}ms`);

      const collectedAmounts: Record<string, number> = {};
      result.forEach((item: any) => {
        collectedAmounts[item._id] = item.totalAmount;
      });

      return collectedAmounts;
    } catch (error) {
      console.error('Error fetching collected amounts by category:', error);
      throw error;
    }
  }

  /**
   * Get all payments for a specific category
   */
  async getPaymentsByCategory(category: string): Promise<IAnudanPayment[]> {
    try {
      return await AnudanPayment.find({ 'categories.day': category });
    } catch (error) {
      console.error('Error fetching payments by category:', error);
      throw error;
    }
  }

  /**
   * Get total collected amount across all categories
   */
  async getTotalCollectedAmount(): Promise<number> {
    try {
      const result = await AnudanPayment.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]);

      return result[0]?.totalAmount || 0;
    } catch (error) {
      console.error('Error fetching total collected amount:', error);
      throw error;
    }
  }
}
