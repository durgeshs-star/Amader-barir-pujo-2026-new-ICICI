/**
 * Anudan Payment Service
 * 
 * Business logic for Anudan payments: validate, save, deduct, broadcast.
 * Implements the mutex-protected payment flow with rollback on DB failure.
 */

import { AnudanRepository } from '../repositories/AnudanRepository';
import { anudanStateService } from './anudanState.service';
import { successResponse, insufficientAmountError, duplicateTransactionError } from '../utils/response.util';

interface PaymentPayload {
  categories: Array<{
    day: string;
    amount: number;
    items: any; // Can be string[] or { name: string; cost: string; }[]
    remark: string;
  }>;
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  orderId: string;
  transactionId: string;
  timestamp: string;
  totalAmount: number;
}

export class AnudanPaymentService {
  private anudanRepository: AnudanRepository;

  constructor() {
    this.anudanRepository = new AnudanRepository();
  }

  /**
   * Confirm payment with mutex-protected flow
   * 
   * Flow:
   * 1. Verify signature (existing ICICI logic - to be called from controller)
   * 2. Check for duplicate transaction (idempotency)
   * 3. Try to reserve amount from in-memory state (mutex-protected)
   * 4. If reservation fails, return insufficient amount error
   * 5. If reservation succeeds, save to MongoDB
   * 6. If DB save fails, rollback reservation
   * 7. If DB save succeeds, broadcast update via SSE
   * 8. Return success with new remaining amount
   */
  async confirmPayment(paymentPayload: PaymentPayload): Promise<any> {
    const { categories, userInfo, orderId, transactionId, timestamp, totalAmount } = paymentPayload;

    // Step 2: Check for duplicate transaction (idempotency)
    const existingPayment = await this.anudanRepository.getPaymentByTransactionId(transactionId);
    if (existingPayment) {
      console.log(`Duplicate transaction detected: ${transactionId}`);
      return duplicateTransactionError(transactionId);
    }

    // Process each category separately
    const results = [];
    for (const category of categories) {
      const campaignId = category.day;
      const amount = category.amount;

      // Step 3: Try to reserve amount from in-memory state (mutex-protected)
      const reserveResult = await anudanStateService.tryReserve(campaignId, amount);

      if (!reserveResult.ok) {
        // Step 4: Reservation failed - insufficient remaining amount
        console.log(`Insufficient remaining amount for ${campaignId}: requested ₹${amount}, remaining ₹${reserveResult.remaining}`);
        return insufficientAmountError(reserveResult.remaining, amount);
      }

      try {
        // Step 5: Save to MongoDB
        await this.anudanRepository.createPayment({
          orderId,
          transactionId,
          timestamp: timestamp || new Date().toISOString(),
          userInfo,
          categories: [category],
          totalAmount: amount,
        });

        // Step 7: Broadcast update via SSE (before mutex release)
        anudanStateService.broadcast(campaignId, reserveResult.remaining);

        results.push({
          campaignId,
          amount,
          remaining: reserveResult.remaining,
          status: 'success',
        });

        console.log(`Payment confirmed for ${campaignId}: ₹${amount}, remaining: ₹${reserveResult.remaining}`);
      } catch (dbError) {
        // Step 6: DB save failed - rollback reservation
        console.error(`DB save failed for ${campaignId}, rolling back reservation:`, dbError);
        await anudanStateService.rollback(campaignId, amount);
        throw dbError;
      }
    }

    return successResponse({
      categories: results,
      totalAmount,
      timestamp,
      userInfo,
      orderId,
      transactionId,
    });
  }

  /**
   * Get remaining amount for a campaign (from in-memory state only)
   * This is the only way to read the in-memory value - no DB read
   */
  getRemaining(campaignId: string): any {
    const remaining = anudanStateService.getRemaining(campaignId);
    return successResponse({ remainingAmount: remaining });
  }

  /**
   * Get all remaining amounts for all campaigns
   */
  getAllRemaining(): any {
    const remainingAmounts: Record<string, number> = {};
    Object.keys(require('../config/anudan.config').ANUDAN_CONFIG.TOTAL_COSTS).forEach((campaignId) => {
      remainingAmounts[campaignId] = anudanStateService.getRemaining(campaignId);
    });
    return successResponse({ remainingAmounts });
  }
}

export const anudanPaymentService = new AnudanPaymentService();
