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
   * 3. Try to reserve amount for all categories from in-memory state (mutex-protected)
   * 4. If any reservation fails, rollback all and return insufficient amount error
   * 5. If all reservations succeed, save to MongoDB as single payment record
   * 6. If DB save fails, rollback all reservations
   * 7. If DB save succeeds, broadcast updates via SSE for each category
   * 8. Return success with new remaining amounts
   */
  async confirmPayment(paymentPayload: PaymentPayload): Promise<any> {
    const { categories, userInfo, orderId, transactionId, timestamp, totalAmount } = paymentPayload;

    // Step 2: Check for duplicate transaction (idempotency)
    const existingPayment = await this.anudanRepository.getPaymentByTransactionId(transactionId);
    if (existingPayment) {
      console.log(`Duplicate transaction detected: ${transactionId}`);
      return duplicateTransactionError(transactionId);
    }

    // Step 3: Reserve amounts for all categories
    const reservations = [];
    for (const category of categories) {
      const campaignId = category.day;
      const amount = category.amount;

      const reserveResult = await anudanStateService.tryReserve(campaignId, amount);

      if (!reserveResult.ok) {
        // Step 4: Reservation failed - rollback all previous reservations
        console.log(`Insufficient remaining amount for ${campaignId}: requested ₹${amount}, remaining ₹${reserveResult.remaining}`);
        
        // Rollback all previous successful reservations
        for (const prevReservation of reservations) {
          await anudanStateService.rollback(prevReservation.campaignId, prevReservation.amount);
        }
        
        return insufficientAmountError(reserveResult.remaining, amount);
      }

      reservations.push({
        campaignId,
        amount,
        remaining: reserveResult.remaining
      });
    }

    try {
      // Step 5: Save to MongoDB as single payment record with all categories
      await this.anudanRepository.createPayment({
        orderId,
        transactionId,
        timestamp: timestamp || new Date().toISOString(),
        userInfo,
        categories,
        totalAmount,
      });

      // Step 7: Broadcast updates via SSE for each category
      for (const reservation of reservations) {
        anudanStateService.broadcast(reservation.campaignId, reservation.remaining);
        console.log(`Payment confirmed for ${reservation.campaignId}: ₹${reservation.amount}, remaining: ₹${reservation.remaining}`);
      }

      return successResponse({
        categories: reservations.map(r => ({
          campaignId: r.campaignId,
          amount: r.amount,
          remaining: r.remaining,
          status: 'success',
        })),
        totalAmount,
        timestamp,
        userInfo,
        orderId,
        transactionId,
      });
    } catch (dbError) {
      // Step 6: DB save failed - rollback all reservations
      console.error('DB save failed, rolling back all reservations:', dbError);
      for (const reservation of reservations) {
        await anudanStateService.rollback(reservation.campaignId, reservation.amount);
      }
      throw dbError;
    }
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
   * Get all remaining amounts AND successful payment amounts for all campaigns
   * Frontend needs to know:
   * - remainingAmounts: how much is still needed
   * - successfulPayments: how much was actually paid successfully (not reserved/pending)
   */
  getAllRemaining(): any {
    const remainingAmounts: Record<string, number> = {};
    Object.keys(require('../config/anudan.config').ANUDAN_CONFIG.TOTAL_COSTS).forEach((campaignId) => {
      remainingAmounts[campaignId] = anudanStateService.getRemaining(campaignId);
    });
    return successResponse({ remainingAmounts });
  }

  /**
   * Get successfully collected amounts (actual paid, not reserved/pending)
   * This is used by frontend to show what's truly fulfilled
   */
  async getSuccessfulPaymentAmounts(): Promise<Record<string, number>> {
    const amounts: Record<string, number> = {};
    Object.keys(require('../config/anudan.config').ANUDAN_CONFIG.TOTAL_COSTS).forEach((campaignId) => {
      amounts[campaignId] = 0;
    });
    
    // Query MongoDB for successful payments only
    const collectedAmounts = await this.anudanRepository.getCollectedAmountsByCategory();
    return { ...amounts, ...collectedAmounts };
  }
}

export const anudanPaymentService = new AnudanPaymentService();
