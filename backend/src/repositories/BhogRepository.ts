/**
 * Bhog Repository
 * 
 * Handles all MongoDB operations for Bhog payments.
 * Provides methods to create, read, and aggregate payment data.
 */

import { BhogPayment, IBhogPayment } from '../models/BhogPayment';

export class BhogRepository {
  /**
   * Create a new Bhog payment record
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
    bookings: Array<{
      day: string;
      amount: number;
      quantity: number;
      remark: string;
    }>;
    categories?: Array<{
      id: string;
      title: string;
      description?: string;
      price: number;
      quantity: number;
    }>;
    totalAmount: number;
    paymentStatus?: 'pending' | 'success' | 'failed' | 'cancelled';
    iciciTxnId?: string;
    iciciPaymentId?: string;
    iciciPaymentMode?: string;
    iciciPaymentDateTime?: string;
    iciciResponseCode?: string;
  }): Promise<IBhogPayment> {
    try {
      const payment = new BhogPayment(paymentData);
      await payment.save();
      return payment;
    } catch (error) {
      console.error('Error creating Bhog payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<IBhogPayment | null> {
    try {
      return await BhogPayment.findOne({ orderId });
    } catch (error) {
      console.error('Error fetching Bhog payment by order ID:', error);
      throw error;
    }
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<IBhogPayment | null> {
    try {
      const payment = await BhogPayment.findOne({ transactionId });
      if (payment) return payment;

      // ICICI callbacks contain the alphanumeric, 20-character merchantTxnNo.
      // Older records stored the frontend value (TXN-<timestamp>-<random>) instead.
      const legacyParts = transactionId.match(/^([A-Za-z]+)(\d{13})([A-Za-z0-9]{4})$/);
      if (!legacyParts) return null;

      const legacyPrefix = `${legacyParts[1]}-${legacyParts[2]}-${legacyParts[3]}`;
      return await BhogPayment.findOne({
        transactionId: { $regex: `^${legacyPrefix}` },
      });
    } catch (error) {
      console.error('Error fetching Bhog payment by transaction ID:', error);
      throw error;
    }
  }

  /**
   * Get collected amount for each Bhog day
   */
  async getCollectedAmountsByDay(): Promise<Record<string, number>> {
    try {
      const result = await BhogPayment.aggregate([
        {
          $unwind: '$bookings',
        },
        {
          $group: {
            _id: '$bookings.day',
            totalAmount: { $sum: '$bookings.amount' },
          },
        },
      ]);

      const collectedAmounts: Record<string, number> = {};
      result.forEach((item: any) => {
        collectedAmounts[item._id] = item.totalAmount;
      });

      return collectedAmounts;
    } catch (error) {
      console.error('Error fetching collected amounts by day:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a specific day
   */
  async getBookingsByDay(day: string): Promise<IBhogPayment[]> {
    try {
      return await BhogPayment.find({ 'bookings.day': day });
    } catch (error) {
      console.error('Error fetching bookings by day:', error);
      throw error;
    }
  }

  /**
   * Get total collected amount across all days
   */
  async getTotalCollectedAmount(): Promise<number> {
    try {
      const result = await BhogPayment.aggregate([
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
