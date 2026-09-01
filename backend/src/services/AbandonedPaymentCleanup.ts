/**
 * Abandoned Payment Cleanup Service
 * 
 * Handles cleanup of abandoned payments that were never completed.
 * When a user initiates payment but never completes it (no ICICI callback received),
 * the reserved amount stays blocked. This service finds those old pending payments
 * and rolls them back.
 * 
 * Runs periodically (every 5 minutes) and checks for payments older than 30 minutes.
 */

import { AnudanPayment } from '../models/AnudanPayment';
import { BhogPayment } from '../models/BhogPayment';
import { anudanStateService } from './anudanState.service';

export class AbandonedPaymentCleanupService {
  private isRunning = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Configuration
  private readonly CLEANUP_CHECK_INTERVAL_MS = 3 * 60 * 1000; // Check every 3 minutes
  private readonly PENDING_PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Start the cleanup job (runs periodically)
   */
  start(): void {
    if (this.isRunning) {
      console.log('[AbandonedPaymentCleanup] Service already running');
      return;
    }

    this.isRunning = true;
    console.log('[AbandonedPaymentCleanup] Starting cleanup service');
    
    // Run cleanup immediately on startup
    this.cleanup();
    
    // Then run periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_CHECK_INTERVAL_MS);

    console.log(`[AbandonedPaymentCleanup] Cleanup scheduled every ${this.CLEANUP_CHECK_INTERVAL_MS / 1000} seconds`);
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('[AbandonedPaymentCleanup] Cleanup service stopped');
  }

  /**
   * Perform cleanup of abandoned Anudan payments
   */
  private async cleanup(): Promise<void> {
    try {
      await this.cleanupAnudanPayments();
      await this.cleanupBhogPayments();
    } catch (error) {
      console.error('[AbandonedPaymentCleanup] Error during cleanup:', error);
    }
  }

  /**
   * Clean up abandoned Anudan payments
   */
  private async cleanupAnudanPayments(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - this.PENDING_PAYMENT_TIMEOUT_MS);
      
      // Find pending payments older than cutoff time
      const abandonedPayments = await AnudanPayment.find({
        paymentStatus: 'pending',
        createdAt: { $lt: cutoffTime },
      });

      if (abandonedPayments.length === 0) {
        return; // No abandoned payments found
      }

      console.log(`[AbandonedPaymentCleanup] Found ${abandonedPayments.length} abandoned Anudan payments to cleanup`);

      for (const payment of abandonedPayments) {
        try {
          // Roll back reserved amounts for each category
          for (const category of payment.categories) {
            const campaignId = category.day;
            const amount = category.amount;
            
            console.log(`[AbandonedPaymentCleanup] Rolling back ₹${amount} for ${campaignId} (Anudan payment ${payment.transactionId})`);
            await anudanStateService.rollback(campaignId, amount);
          }

          // Mark payment as abandoned
          payment.paymentStatus = 'abandoned';
          await payment.save();

          console.log(`[AbandonedPaymentCleanup] Marked Anudan payment ${payment.transactionId} as abandoned`);
        } catch (error) {
          console.error(`[AbandonedPaymentCleanup] Error cleaning up Anudan payment ${payment.transactionId}:`, error);
        }
      }

    } catch (error) {
      console.error('[AbandonedPaymentCleanup] Error in cleanupAnudanPayments:', error);
    }
  }

  /**
   * Clean up abandoned Bhog payments
   */
  private async cleanupBhogPayments(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - this.PENDING_PAYMENT_TIMEOUT_MS);
      
      // Find pending payments older than cutoff time
      const abandonedPayments = await BhogPayment.find({
        paymentStatus: 'pending',
        createdAt: { $lt: cutoffTime },
      });

      if (abandonedPayments.length === 0) {
        return; // No abandoned payments found
      }

      console.log(`[AbandonedPaymentCleanup] Found ${abandonedPayments.length} abandoned Bhog payments to cleanup`);

      for (const payment of abandonedPayments) {
        try {
          // For Bhog, we don't have reserved amounts in in-memory state like Anudan
          // Just mark as abandoned
          payment.paymentStatus = 'abandoned';
          await payment.save();

          console.log(`[AbandonedPaymentCleanup] Marked Bhog payment ${payment.transactionId} as abandoned`);
        } catch (error) {
          console.error(`[AbandonedPaymentCleanup] Error cleaning up Bhog payment ${payment.transactionId}:`, error);
        }
      }

    } catch (error) {
      console.error('[AbandonedPaymentCleanup] Error in cleanupBhogPayments:', error);
    }
  }
}

// Export singleton instance
export const abandonedPaymentCleanupService = new AbandonedPaymentCleanupService();
