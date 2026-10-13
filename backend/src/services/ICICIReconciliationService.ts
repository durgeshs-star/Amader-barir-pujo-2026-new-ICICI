/**
 * ICICI Payment Reconciliation Service
 *
 * Hourly reconciliation of abandoned and pending payments against ICICI status API.
 * Recovers successful payments and sends missing WhatsApp/email confirmations.
 *
 * Key principles:
 * - Never double-reserve Anudan amounts
 * - Use atomic database updates to prevent race conditions
 * - Track WhatsApp and email independently
 * - Retry failed notifications on subsequent runs
 * - Log without exposing sensitive data
 * - Notification retry has no age limit - successful payments of any age receive missing notifications
 * - Backlog processing ensures older payments remain eligible for recovery
 * - Exact integer comparison in paise for amount validation (no tolerance)
 *
 * State Deduction Idempotency:
 * - Uses anudanStateDeducted flag to prevent double-deduction of the same payment
 * - If deduction fails, the flag remains false for retry on next reconciliation run
 * - State drift recovery via anudanStateService.initialize() rebuilds from MongoDB
 *
 * Notification Claim Expiry:
 * - Uses claimedAt timestamps to detect abandoned notifications (5 minute lease)
 * - Claims past expiry are automatically reclaimed for retry
 * - Atomic conditional updates prevent concurrent workers from claiming the same notification
 *
 * IMPORTANT LIMITATIONS:
 * - State drift risk: MongoDB payment status update and in-memory Anudan state deduction are not atomic.
 *   If the process crashes between these operations, the payment is marked success in MongoDB but
 *   the in-memory state is not deducted. This causes live totals to be incorrect until the next
 *   server restart re-initializes state from MongoDB. Recovery path: call anudanStateService.initialize()
 *   (server restart or programmatic reinit via reinitializeAnudanState()).
 *
 * - Notification delivery guarantee: At-most-once delivery (not at-least-once). If the external
 *   provider accepts a message but the process crashes before the MongoDB rollback can execute,
 *   the notification is permanently lost. The flag is set before sending to prevent duplicates,
 *   but this creates a window where a crash causes lost notifications. This is unavoidable without
 *   an outbox pattern or provider idempotency. Claim expiry mitigates but does not eliminate this risk.
 */

import { AnudanPayment } from '../models/AnudanPayment';
import { BhogPayment } from '../models/BhogPayment';
import { iciciPGService, TransactionStatusResponse } from './iciciPG.service';
import { EmailService } from './EmailService';
import { whatsAppService } from './WhatsAppService';
import { ReceiptService } from './ReceiptService';
import { formatBhogBookingDetails } from '../utils/bhogWhatsAppFormatter';
import { anudanStateService } from './anudanState.service';

/**
 * Get Bhog date based on day title
 */
function getBhogDate(dayTitle: string): string {
  const titleLower = dayTitle.toLowerCase();

  if (titleLower.includes('sandhi puja') || titleLower.includes('sandhi pujo') || titleLower.includes('sandhi')) return '19 October 2026';
  if (titleLower.includes('panchami')) return '15 October 2026';
  if (titleLower.includes('saptami')) return '16 October 2026';
  if (titleLower.includes('ashtami')) return '17 October 2026';
  if (titleLower.includes('navami')) return '19 October 2026';
  if (titleLower.includes('durga puja')) return '20 October 2026';
  if (titleLower.includes('lakshmi puja')) return 'TBD';
  if (titleLower.includes('saraswati puja')) return 'TBD';

  return '15-21 October 2026';
}

/**
 * Get Bhog timing based on day title
 */
function getBhogTiming(dayTitle: string): string {
  const titleLower = dayTitle.toLowerCase();

  if (titleLower.includes('sandhi puja') || titleLower.includes('sandhi pujo') || titleLower.includes('sandhi')) return '11:30 AM - 1:30 PM';
  if (titleLower.includes('panchami')) return '12:30 PM - 2:30 PM';
  if (titleLower.includes('saptami')) return '12:30 PM - 2:30 PM';
  if (titleLower.includes('ashtami')) return '12:30 PM - 2:30 PM';
  if (titleLower.includes('navami')) return '12:30 PM - 2:30 PM';
  if (titleLower.includes('durga puja')) return '12:30 PM - 2:30 PM';
  if (titleLower.includes('lakshmi puja')) return 'TBD';
  if (titleLower.includes('saraswati puja')) return 'TBD';

  return '12:30 PM - 2:30 PM';
}

interface ReconciliationStats {
  startTime: Date;
  anudanExamined: number;
  bhogExamined: number;
  anudanRecovered: number;
  bhogRecovered: number;
  anudanAlreadySuccess: number;
  bhogAlreadySuccess: number;
  anudanBacklogExamined: number;
  bhogBacklogExamined: number;
  anudanBacklogRecovered: number;
  bhogBacklogRecovered: number;
  iciciFailed: number;
  iciciPending: number;
  iciciUnverified: number;
  whatsappSent: number;
  whatsappFailed: number;
  emailSent: number;
  emailFailed: number;
  errors: string[];
}

export class ICICIReconciliationService {
  private isRunning = false;
  private reconciliationInterval: NodeJS.Timeout | null = null;
  private emailService: EmailService;
  private receiptService: ReceiptService;

  // Configuration
  private readonly RECONCILIATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private readonly CUTOFF_HOURS = parseInt(process.env.RECONCILIATION_CUTOFF_HOURS || '168'); // 7 days default, configurable
  private readonly BATCH_SIZE = 20; // Process in batches to avoid overwhelming ICICI API
  private readonly BACKLOG_BATCH_SIZE = 10; // Smaller batch for backlog to be conservative with rate limits
  private readonly BACKLOG_DELAY_MS = 1000; // Delay between backlog batches to respect rate limits
  private readonly NOTIFICATION_LEASE_MS = 5 * 60 * 1000; // 5 minutes for notification claim expiry

  constructor() {
    this.emailService = new EmailService();
    this.receiptService = new ReceiptService();
  }

  /**
   * Start the hourly reconciliation service
   */
  start(): void {
    if (this.isRunning) {
      console.log('[ICICIReconciliation] Service already running');
      return;
    }

    this.isRunning = true;
    console.log('[ICICIReconciliation] Starting reconciliation service');

    // Run immediately on startup
    this.reconcile().catch((error) => {
      console.error('[ICICIReconciliation] Initial reconciliation failed:', error);
    });

    // Then run hourly
    this.reconciliationInterval = setInterval(() => {
      this.reconcile().catch((error) => {
        console.error('[ICICIReconciliation] Scheduled reconciliation failed:', error);
      });
    }, this.RECONCILIATION_INTERVAL_MS);

    console.log(`[ICICIReconciliation] Reconciliation scheduled every ${this.RECONCILIATION_INTERVAL_MS / 1000 / 60} minutes`);
  }

  /**
   * Stop the reconciliation service
   */
  stop(): void {
    if (this.reconciliationInterval) {
      clearInterval(this.reconciliationInterval);
      this.reconciliationInterval = null;
    }
    this.isRunning = false;
    console.log('[ICICIReconciliation] Reconciliation service stopped');
  }

  /**
   * Trigger Anudan state reinitialization from MongoDB
   * Use this if state drift is detected between MongoDB and in-memory state
   * This rebuilds totals from authoritative MongoDB records
   */
  async reinitializeAnudanState(): Promise<void> {
    console.log('[ICICIReconciliation] Reinitializing Anudan state from MongoDB...');
    try {
      await anudanStateService.initialize();
      console.log('[ICICIReconciliation] Anudan state reinitialized successfully');
    } catch (error) {
      console.error('[ICICIReconciliation] Failed to reinitialize Anudan state:', error);
      throw error;
    }
  }

  /**
   * Main reconciliation logic
   */
  private async reconcile(): Promise<void> {
    const stats: ReconciliationStats = {
      startTime: new Date(),
      anudanExamined: 0,
      bhogExamined: 0,
      anudanRecovered: 0,
      bhogRecovered: 0,
      anudanAlreadySuccess: 0,
      bhogAlreadySuccess: 0,
      anudanBacklogExamined: 0,
      bhogBacklogExamined: 0,
      anudanBacklogRecovered: 0,
      bhogBacklogRecovered: 0,
      iciciFailed: 0,
      iciciPending: 0,
      iciciUnverified: 0,
      whatsappSent: 0,
      whatsappFailed: 0,
      emailSent: 0,
      emailFailed: 0,
      errors: [],
    };

    const cutoffTime = new Date(Date.now() - this.CUTOFF_HOURS * 60 * 60 * 1000);

    console.log('[ICICIReconciliation] =========================================');
    console.log('[ICICIReconciliation] Starting reconciliation run');
    console.log('[ICICIReconciliation] Cutoff time:', cutoffTime.toISOString());

    try {
      // Process Anudan payments within cutoff time
      await this.reconcileAnudanPayments(cutoffTime, stats);

      // Process Bhog payments within cutoff time
      await this.reconcileBhogPayments(cutoffTime, stats);

      // Process backlog of older payments (outside cutoff time)
      await this.reconcileAnudanBacklog(cutoffTime, stats);
      await this.reconcileBhogBacklog(cutoffTime, stats);

      // Retry missing notifications for successful payments (without querying ICICI)
      await this.retryNotificationsForSuccessPayments(cutoffTime, stats);

      // Log summary
      this.logReconciliationSummary(stats);
    } catch (error) {
      console.error('[ICICIReconciliation] Reconciliation run failed:', error);
      stats.errors.push(error instanceof Error ? error.message : String(error));
    }

    console.log('[ICICIReconciliation] =========================================');
  }

  /**
   * Reconcile Anudan payments
   */
  private async reconcileAnudanPayments(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    console.log('[ICICIReconciliation] Processing Anudan payments...');

    // Find abandoned or pending payments within cutoff time
    const query = {
      paymentStatus: { $in: ['abandoned', 'pending'] },
      createdAt: { $gte: cutoffTime },
    };

    const total = await AnudanPayment.countDocuments(query);
    console.log(`[ICICIReconciliation] Found ${total} Anudan payments to examine`);

    if (total === 0) {
      return;
    }

    // Process in batches
    let skip = 0;
    while (skip < total) {
      const payments = await AnudanPayment.find(query)
        .skip(skip)
        .limit(this.BATCH_SIZE)
        .lean();

      stats.anudanExamined += payments.length;

      for (const payment of payments) {
        try {
          await this.processAnudanPayment(payment, stats);
        } catch (error) {
          console.error(`[ICICIReconciliation] Error processing Anudan payment ${payment.transactionId}:`, error);
          stats.errors.push(`Anudan ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.BATCH_SIZE;
    }
  }

  /**
   * Reconcile Bhog payments
   */
  private async reconcileBhogPayments(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    console.log('[ICICIReconciliation] Processing Bhog payments...');

    // Find abandoned or pending payments within cutoff time
    const query = {
      paymentStatus: { $in: ['abandoned', 'pending'] },
      createdAt: { $gte: cutoffTime },
    };

    const total = await BhogPayment.countDocuments(query);
    console.log(`[ICICIReconciliation] Found ${total} Bhog payments to examine`);

    if (total === 0) {
      return;
    }

    // Process in batches
    let skip = 0;
    while (skip < total) {
      const payments = await BhogPayment.find(query)
        .skip(skip)
        .limit(this.BATCH_SIZE)
        .lean();

      stats.bhogExamined += payments.length;

      for (const payment of payments) {
        try {
          await this.processBhogPayment(payment, stats);
        } catch (error) {
          console.error(`[ICICIReconciliation] Error processing Bhog payment ${payment.transactionId}:`, error);
          stats.errors.push(`Bhog ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.BATCH_SIZE;
    }
  }

  /**
   * Reconcile Anudan backlog (payments older than cutoff time)
   * Processes a small batch of older payments to ensure no successful payments are permanently stranded
   */
  private async reconcileAnudanBacklog(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    console.log('[ICICIReconciliation] Processing Anudan backlog...');

    // Find abandoned or pending payments older than cutoff time
    const query = {
      paymentStatus: { $in: ['abandoned', 'pending'] },
      createdAt: { $lt: cutoffTime },
    };

    const total = await AnudanPayment.countDocuments(query);
    console.log(`[ICICIReconciliation] Found ${total} Anudan payments in backlog`);

    if (total === 0) {
      return;
    }

    // Process in smaller batches with delays to respect rate limits
    let skip = 0;
    while (skip < total) {
      const payments = await AnudanPayment.find(query)
        .sort({ createdAt: 1, _id: 1 })  // Stable sort to prevent result set shifts
        .skip(skip)
        .limit(this.BACKLOG_BATCH_SIZE)
        .lean();

      stats.anudanBacklogExamined += payments.length;

      for (const payment of payments) {
        try {
          await this.processAnudanPayment(payment, stats, true);
        } catch (error) {
          console.error(`[ICICIReconciliation] Error processing Anudan backlog payment ${payment.transactionId}:`, error);
          stats.errors.push(`Anudan backlog ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.BACKLOG_BATCH_SIZE;

      // Add delay between batches to respect ICICI rate limits
      if (skip < total) {
        await new Promise(resolve => setTimeout(resolve, this.BACKLOG_DELAY_MS));
      }
    }
  }

  /**
   * Reconcile Bhog backlog (payments older than cutoff time)
   * Processes a small batch of older payments to ensure no successful payments are permanently stranded
   */
  private async reconcileBhogBacklog(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    console.log('[ICICIReconciliation] Processing Bhog backlog...');

    // Find abandoned or pending payments older than cutoff time
    const query = {
      paymentStatus: { $in: ['abandoned', 'pending'] },
      createdAt: { $lt: cutoffTime },
    };

    const total = await BhogPayment.countDocuments(query);
    console.log(`[ICICIReconciliation] Found ${total} Bhog payments in backlog`);

    if (total === 0) {
      return;
    }

    // Process in smaller batches with delays to respect rate limits
    let skip = 0;
    while (skip < total) {
      const payments = await BhogPayment.find(query)
        .sort({ createdAt: 1, _id: 1 })  // Stable sort to prevent result set shifts
        .skip(skip)
        .limit(this.BACKLOG_BATCH_SIZE)
        .lean();

      stats.bhogBacklogExamined += payments.length;

      for (const payment of payments) {
        try {
          await this.processBhogPayment(payment, stats, true);
        } catch (error) {
          console.error(`[ICICIReconciliation] Error processing Bhog backlog payment ${payment.transactionId}:`, error);
          stats.errors.push(`Bhog backlog ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.BACKLOG_BATCH_SIZE;

      // Add delay between batches to respect ICICI rate limits
      if (skip < total) {
        await new Promise(resolve => setTimeout(resolve, this.BACKLOG_DELAY_MS));
      }
    }
  }

  /**
   * Retry missing notifications for successful payments
   * This handles cases where payment was marked success but notifications failed
   */
  private async retryNotificationsForSuccessPayments(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    console.log('[ICICIReconciliation] Retrying notifications for successful payments...');

    // Process Anudan success payments with missing notifications
    await this.retryAnudanNotifications(cutoffTime, stats);

    // Process Bhog success payments with missing notifications
    await this.retryBhogNotifications(cutoffTime, stats);
  }

  /**
   * Retry notifications for successful Anudan payments
   * Note: No cutoffTime filter - successful payments of any age should receive missing notifications
   */
  private async retryAnudanNotifications(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    const query = {
      paymentStatus: 'success',
      $or: [
        { whatsappNotificationSent: { $ne: true } },
        { emailNotificationSent: { $ne: true } }
      ]
    };

    const total = await AnudanPayment.countDocuments(query);
    console.log(`[ICICIReconciliation] Found ${total} Anudan success payments with missing notifications`);

    if (total === 0) {
      return;
    }

    // Process in batches
    let skip = 0;
    while (skip < total) {
      const payments = await AnudanPayment.find(query)
        .skip(skip)
        .limit(this.BATCH_SIZE);

      for (const payment of payments) {
        try {
          await this.retryAnudanPaymentNotifications(payment, stats);
        } catch (error) {
          console.error(`[ICICIReconciliation] Error retrying notifications for Anudan payment ${payment.transactionId}:`, error);
          stats.errors.push(`Anudan notification retry ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.BATCH_SIZE;
    }
  }

  /**
   * Retry notifications for successful Bhog payments
   * Note: No cutoffTime filter - successful payments of any age should receive missing notifications
   */
  private async retryBhogNotifications(cutoffTime: Date, stats: ReconciliationStats): Promise<void> {
    const query = {
      paymentStatus: 'success',
      $or: [
        { whatsappNotificationSent: { $ne: true } },
        { emailNotificationSent: { $ne: true } }
      ]
    };

    const total = await BhogPayment.countDocuments(query);
    console.log(`[ICICIReconciliation] Found ${total} Bhog success payments with missing notifications`);

    if (total === 0) {
      return;
    }

    // Process in batches
    let skip = 0;
    while (skip < total) {
      const payments = await BhogPayment.find(query)
        .skip(skip)
        .limit(this.BATCH_SIZE);

      for (const payment of payments) {
        try {
          await this.retryBhogPaymentNotifications(payment, stats);
        } catch (error) {
          console.error(`[ICICIReconciliation] Error retrying notifications for Bhog payment ${payment.transactionId}:`, error);
          stats.errors.push(`Bhog notification retry ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.BATCH_SIZE;
    }
  }

  /**
   * Retry notifications for a single Anudan payment
   * Note: Does not generate or attach receipts - only sends confirmation details
   */
  private async retryAnudanPaymentNotifications(payment: any, stats: ReconciliationStats): Promise<void> {
    console.log(`[ICICIReconciliation] Retrying notifications for Anudan payment: ${payment.transactionId}`);

    const leaseExpiry = new Date(Date.now() - this.NOTIFICATION_LEASE_MS);

    // Email: Claim with expiry handling
    // Only claim if not sent, but also reclaim expired claims
    const emailUpdate = await AnudanPayment.updateOne(
      { 
        _id: payment._id, 
        emailNotificationSent: false,
        $or: [
          { emailNotificationClaimedAt: { $lt: leaseExpiry } },
          { emailNotificationClaimedAt: { $exists: false } }
        ]
      },
      { $set: { emailNotificationClaimedAt: new Date() } }
    );

    if (emailUpdate.matchedCount > 0 && payment.userInfo?.email) {
      try {
        console.log(`[ICICIReconciliation] Retrying email for ${payment.transactionId}`);
        const categories = payment.categories.map((cat: any) => ({
          day: cat.day,
          amount: cat.amount,
        }));
        await this.emailService.sendAnudanConfirmationEmail({
          to: payment.userInfo.email,
          customerName: payment.userInfo.name,
          customerPhone: payment.userInfo.phone,
          categories,
          totalAmount: payment.actualAmountCharged || payment.totalAmount,
          orderId: payment.orderId,
          transactionId: payment.transactionId,
          paymentStatus: payment.paymentStatus,
          paymentDateTime: payment.iciciPaymentDateTime || payment.timestamp,
        });
        
        // Mark as successfully sent
        await AnudanPayment.updateOne(
          { _id: payment._id },
          { $set: { emailNotificationSent: true, emailNotificationSentAt: new Date(), emailNotificationError: undefined } }
        );
        stats.emailSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to retry email for ${payment.transactionId}:`, error);
        // Rollback the claim on failure
        await AnudanPayment.updateOne(
          { _id: payment._id },
          { $set: { emailNotificationClaimedAt: undefined, emailNotificationError: error instanceof Error ? error.message : String(error) } }
        );
        stats.emailFailed++;
      }
    }

    // WhatsApp: Claim with expiry handling
    const whatsappUpdate = await AnudanPayment.updateOne(
      { 
        _id: payment._id, 
        whatsappNotificationSent: false,
        $or: [
          { whatsappNotificationClaimedAt: { $lt: leaseExpiry } },
          { whatsappNotificationClaimedAt: { $exists: false } }
        ]
      },
      { $set: { whatsappNotificationClaimedAt: new Date() } }
    );

    if (whatsappUpdate.matchedCount > 0 && payment.userInfo?.phone) {
      try {
        console.log(`[ICICIReconciliation] Retrying WhatsApp for ${payment.transactionId}`);
        const categories = payment.categories.map((cat: any) => ({
          day: cat.day,
          amount: cat.amount,
        }));
        await whatsAppService.sendAnudanConfirmation({
          customerName: payment.userInfo.name,
          categories,
          totalAmount: (payment.actualAmountCharged || payment.totalAmount).toFixed(2),
          whatsappNumber: payment.userInfo.phone,
        });
        
        // Mark as successfully sent
        await AnudanPayment.updateOne(
          { _id: payment._id },
          { $set: { whatsappNotificationSent: true, whatsappNotificationSentAt: new Date(), whatsappNotificationError: undefined } }
        );
        stats.whatsappSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to retry WhatsApp for ${payment.transactionId}:`, error);
        // Rollback the claim on failure
        await AnudanPayment.updateOne(
          { _id: payment._id },
          { $set: { whatsappNotificationClaimedAt: undefined, whatsappNotificationError: error instanceof Error ? error.message : String(error) } }
        );
        stats.whatsappFailed++;
      }
    }
  }

  /**
   * Retry notifications for a single Bhog payment
   * Note: Does not generate or attach receipts - only sends confirmation details
   */
  private async retryBhogPaymentNotifications(payment: any, stats: ReconciliationStats): Promise<void> {
    console.log(`[ICICIReconciliation] Retrying notifications for Bhog payment: ${payment.transactionId}`);

    // Use atomic update to prevent concurrent workers from sending duplicate notifications
    const emailUpdate = await BhogPayment.updateOne(
      { _id: payment._id, emailNotificationSent: { $ne: true } },
      { $set: { emailNotificationSent: true, emailNotificationSentAt: new Date() } }
    );

    // Send email if we won the race to mark it as sent
    if (emailUpdate.matchedCount > 0 && payment.userInfo?.email) {
      try {
        console.log(`[ICICIReconciliation] Retrying email for ${payment.transactionId}`);
        const bookings = (payment.bookings && payment.bookings.length > 0)
          ? payment.bookings.map((b: any) => ({
              day: b.day,
              date: getBhogDate(b.day),
              bhogTiming: getBhogTiming(b.day),
              quantity: b.quantity,
              categories: (b.categories && b.categories.length > 0 ? b.categories : []).map((c: any) => ({
                title: c.title || c.id || 'Bhog',
                quantity: Number(c.quantity),
              })),
            }))
          : [{
              day: payment.categories?.[0]?.title || 'Bhog',
              date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
              bhogTiming: '12:30 PM - 2:30 PM',
              categories: (payment.categories || []).map((c: any) => ({
                title: c.title || c.id || 'Bhog',
                quantity: Number(c.quantity),
              })),
            }];

        await this.emailService.sendBhogConfirmationEmail({
          to: payment.userInfo.email,
          customerName: payment.userInfo.name,
          customerPhone: payment.userInfo.phone,
          isFree: false,
          totalAmount: payment.actualAmountCharged || payment.totalAmount,
          bookings,
          orderId: payment.orderId,
          transactionId: payment.transactionId,
          paymentStatus: payment.paymentStatus,
        });
        stats.emailSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to retry email for ${payment.transactionId}:`, error);
        // Rollback the notification flag on failure
        await BhogPayment.updateOne(
          { _id: payment._id },
          { $set: { emailNotificationSent: false, emailNotificationError: error instanceof Error ? error.message : String(error) } }
        );
        stats.emailFailed++;
      }
    }

    // Use atomic update to prevent concurrent workers from sending duplicate notifications
    const whatsappUpdate = await BhogPayment.updateOne(
      { _id: payment._id, whatsappNotificationSent: { $ne: true } },
      { $set: { whatsappNotificationSent: true, whatsappNotificationSentAt: new Date() } }
    );

    // Send WhatsApp if we won the race to mark it as sent
    if (whatsappUpdate.matchedCount > 0 && payment.userInfo?.phone) {
      try {
        console.log(`[ICICIReconciliation] Retrying WhatsApp for ${payment.transactionId}`);
        await whatsAppService.sendBhogBookingConfirmation({
          customerName: payment.userInfo.name,
          bookingDetails: formatBhogBookingDetails(payment.bookings || []),
          whatsappNumber: payment.userInfo.phone,
        });
        stats.whatsappSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to retry WhatsApp for ${payment.transactionId}:`, error);
        // Rollback the notification flag on failure
        await BhogPayment.updateOne(
          { _id: payment._id },
          { $set: { whatsappNotificationSent: false, whatsappNotificationError: error instanceof Error ? error.message : String(error) } }
        );
        stats.whatsappFailed++;
      }
    }
  }

  /**
   * Process a single Anudan payment
   */
  private async processAnudanPayment(payment: any, stats: ReconciliationStats, isBacklog: boolean = false): Promise<void> {
    console.log(`[ICICIReconciliation] Checking Anudan payment: ${payment.transactionId}${isBacklog ? ' (backlog)' : ''}`);

    // Query ICICI status
    let iciciStatus: TransactionStatusResponse;
    try {
      iciciStatus = await iciciPGService.checkStatus(payment.transactionId);
    } catch (error) {
      console.error(`[ICICIReconciliation] ICICI API error for ${payment.transactionId}:`, error);
      stats.iciciUnverified++;
      return;
    }

    // Verify secure hash is already done by iciciPGService.checkStatus

    // Check if ICICI confirms success
    if (iciciStatus.txnStatus === 'SUC' && (iciciStatus.txnResponseCode === '000' || iciciStatus.txnResponseCode === '0000')) {
      console.log(`[ICICIReconciliation] ICICI confirms success for ${payment.transactionId}`);

      // Verify amount matches exactly using integer comparison in paise
      // ICICI returns amount as string with 2 decimal places (e.g., "100.00")
      // Convert both to paise (integer) to avoid floating-point precision errors
      const expectedAmount = payment.totalAmount || payment.actualAmountCharged;
      const actualAmount = parseFloat(iciciStatus.amount);

      const expectedPaise = Math.round(expectedAmount * 100);
      const actualPaise = Math.round(actualAmount * 100);

      if (expectedPaise !== actualPaise) {
        console.warn(`[ICICIReconciliation] Amount mismatch for ${payment.transactionId}: expected ₹${expectedAmount.toFixed(2)}, got ₹${actualAmount.toFixed(2)}`);
        stats.iciciUnverified++;
        return;
      }

      // Recover payment
      await this.recoverAnudanPayment(payment, iciciStatus, stats, isBacklog);
    } else if (iciciStatus.txnStatus === 'REJ' || iciciStatus.txnStatus === 'ERR') {
      console.log(`[ICICIReconciliation] ICICI confirms failure for ${payment.transactionId}: ${iciciStatus.txnStatus}`);
      stats.iciciFailed++;
      // Leave as abandoned/pending - don't change status
    } else {
      console.log(`[ICICIReconciliation] ICICI reports pending for ${payment.transactionId}: ${iciciStatus.txnStatus}`);
      stats.iciciPending++;
      // Leave as pending - will retry next hour
    }
  }

  /**
   * Process a single Bhog payment
   */
  private async processBhogPayment(payment: any, stats: ReconciliationStats, isBacklog: boolean = false): Promise<void> {
    console.log(`[ICICIReconciliation] Checking Bhog payment: ${payment.transactionId}${isBacklog ? ' (backlog)' : ''}`);

    // Query ICICI status
    let iciciStatus: TransactionStatusResponse;
    try {
      iciciStatus = await iciciPGService.checkStatus(payment.transactionId);
    } catch (error) {
      console.error(`[ICICIReconciliation] ICICI API error for ${payment.transactionId}:`, error);
      stats.iciciUnverified++;
      return;
    }

    // Check if ICICI confirms success
    if (iciciStatus.txnStatus === 'SUC' && (iciciStatus.txnResponseCode === '000' || iciciStatus.txnResponseCode === '0000')) {
      console.log(`[ICICIReconciliation] ICICI confirms success for ${payment.transactionId}`);

      // Verify amount matches exactly using integer comparison in paise
      // ICICI returns amount as string with 2 decimal places (e.g., "100.00")
      // Convert both to paise (integer) to avoid floating-point precision errors
      const expectedAmount = payment.totalAmount || payment.actualAmountCharged;
      const actualAmount = parseFloat(iciciStatus.amount);

      const expectedPaise = Math.round(expectedAmount * 100);
      const actualPaise = Math.round(actualAmount * 100);

      if (expectedPaise !== actualPaise) {
        console.warn(`[ICICIReconciliation] Amount mismatch for ${payment.transactionId}: expected ₹${expectedAmount.toFixed(2)}, got ₹${actualAmount.toFixed(2)}`);
        stats.iciciUnverified++;
        return;
      }

      // Recover payment
      await this.recoverBhogPayment(payment, iciciStatus, stats, isBacklog);
    } else if (iciciStatus.txnStatus === 'REJ' || iciciStatus.txnStatus === 'ERR') {
      console.log(`[ICICIReconciliation] ICICI confirms failure for ${payment.transactionId}: ${iciciStatus.txnStatus}`);
      stats.iciciFailed++;
    } else {
      console.log(`[ICICIReconciliation] ICICI reports pending for ${payment.transactionId}: ${iciciStatus.txnStatus}`);
      stats.iciciPending++;
    }
  }

  /**
   * Recover an Anudan payment (mark as success and send notifications)
   */
  private async recoverAnudanPayment(payment: any, iciciStatus: TransactionStatusResponse, stats: ReconciliationStats, isBacklog: boolean = false): Promise<void> {
    // Atomic update: only if still abandoned or pending
    const result = await AnudanPayment.updateOne(
      { _id: payment._id, paymentStatus: { $in: ['abandoned', 'pending'] } },
      {
        $set: {
          paymentStatus: 'success',
          iciciTxnId: iciciStatus.txnID,
          iciciPaymentDateTime: iciciStatus.paymentDateTime,
          iciciResponseCode: iciciStatus.txnResponseCode,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log(`[ICICIReconciliation] Anudan payment ${payment.transactionId} already processed by another process`);
      stats.anudanAlreadySuccess++;
      return;
    }

    console.log(`[ICICIReconciliation] Recovered Anudan payment ${payment.transactionId}${isBacklog ? ' (backlog)' : ''}`);
    if (isBacklog) {
      stats.anudanBacklogRecovered++;
    } else {
      stats.anudanRecovered++;
    }

    // Deduct from in-memory Anudan state (payment was created as pending without deduction)
    // This ensures live remaining amounts are updated immediately without server restart
    // Use anudanStateDeducted flag for idempotency - prevent double-deduction
    for (const category of payment.categories || []) {
      const campaignId = category.day;
      const amount = category.amount;

      try {
        // Check if already deducted to prevent double-deduction
        const stateDeducted = await AnudanPayment.updateOne(
          { _id: payment._id, anudanStateDeducted: false },
          { $set: { anudanStateDeducted: true, anudanStateDeductedAt: new Date() } }
        );

        if (stateDeducted.matchedCount === 0) {
          console.log(`[ICICIReconciliation] State already deducted for ${payment.transactionId} ${campaignId}, skipping`);
          continue;
        }

        const reserveResult = await anudanStateService.tryReserve(campaignId, amount);
        if (!reserveResult.ok) {
          console.error(`[ICICIReconciliation] Failed to deduct ₹${amount} from ${campaignId} state - insufficient remaining`);
          // Rollback the deducted flag so it can be retried on next reconciliation
          await AnudanPayment.updateOne(
            { _id: payment._id },
            { $set: { anudanStateDeducted: false, anudanStateDeductedAt: undefined } }
          );
          stats.errors.push(`State deduction failed for ${payment.transactionId} ${campaignId}: insufficient remaining`);
        } else {
          console.log(`[ICICIReconciliation] Deducted ₹${amount} from ${campaignId} state, remaining: ₹${reserveResult.remaining}`);
          // Broadcast update to SSE subscribers
          anudanStateService.broadcast(campaignId, reserveResult.remaining);
        }
      } catch (error) {
        console.error(`[ICICIReconciliation] Error deducting from ${campaignId} state:`, error);
        // Rollback the deducted flag so it can be retried on next reconciliation
        await AnudanPayment.updateOne(
          { _id: payment._id },
          { $set: { anudanStateDeducted: false, anudanStateDeductedAt: undefined } }
        );
        stats.errors.push(`State deduction error for ${payment.transactionId} ${campaignId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fetch fresh document with all fields
    const freshPayment = await AnudanPayment.findById(payment._id);
    if (!freshPayment) {
      console.error(`[ICICIReconciliation] Failed to fetch fresh payment ${payment._id}`);
      return;
    }

    // Generate receipt if missing (Anudan doesn't store receiptPath, always regenerate if needed)
    try {
      console.log(`[ICICIReconciliation] Generating receipt for ${freshPayment.transactionId}`);
      await this.receiptService.generateAnudanReceipt(freshPayment);
    } catch (error) {
      console.error(`[ICICIReconciliation] Failed to generate receipt for ${freshPayment.transactionId}:`, error);
      // Don't fail the recovery
    }

    // Send email if not sent
    if (!freshPayment.emailNotificationSent && freshPayment.userInfo?.email) {
      try {
        console.log(`[ICICIReconciliation] Sending email for ${freshPayment.transactionId}`);
        const categories = freshPayment.categories.map((cat: any) => ({
          day: cat.day,
          amount: cat.amount,
        }));
        await this.emailService.sendAnudanConfirmationEmail({
          to: freshPayment.userInfo.email,
          customerName: freshPayment.userInfo.name,
          customerPhone: freshPayment.userInfo.phone,
          categories,
          totalAmount: freshPayment.actualAmountCharged || freshPayment.totalAmount,
          orderId: freshPayment.orderId,
          transactionId: freshPayment.transactionId,
          paymentStatus: freshPayment.paymentStatus,
          paymentDateTime: freshPayment.iciciPaymentDateTime || freshPayment.timestamp,
        });

        freshPayment.emailNotificationSent = true;
        freshPayment.emailNotificationSentAt = new Date();
        await freshPayment.save();
        stats.emailSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to send email for ${freshPayment.transactionId}:`, error);
        freshPayment.emailNotificationError = error instanceof Error ? error.message : String(error);
        await freshPayment.save();
        stats.emailFailed++;
      }
    }

    // Send WhatsApp if not sent
    if (!freshPayment.whatsappNotificationSent && freshPayment.userInfo?.phone) {
      try {
        console.log(`[ICICIReconciliation] Sending WhatsApp for ${freshPayment.transactionId}`);
        const categories = freshPayment.categories.map((cat: any) => ({
          day: cat.day,
          amount: cat.amount,
        }));
        await whatsAppService.sendAnudanConfirmation({
          customerName: freshPayment.userInfo.name,
          categories,
          totalAmount: (freshPayment.actualAmountCharged || freshPayment.totalAmount).toFixed(2),
          whatsappNumber: freshPayment.userInfo.phone,
        });

        freshPayment.whatsappNotificationSent = true;
        freshPayment.whatsappNotificationSentAt = new Date();
        await freshPayment.save();
        stats.whatsappSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to send WhatsApp for ${freshPayment.transactionId}:`, error);
        freshPayment.whatsappNotificationError = error instanceof Error ? error.message : String(error);
        await freshPayment.save();
        stats.whatsappFailed++;
      }
    }
  }

  /**
   * Recover a Bhog payment (mark as success and send notifications)
   */
  private async recoverBhogPayment(payment: any, iciciStatus: TransactionStatusResponse, stats: ReconciliationStats, isBacklog: boolean = false): Promise<void> {
    // Atomic update: only if still abandoned or pending
    const result = await BhogPayment.updateOne(
      { _id: payment._id, paymentStatus: { $in: ['abandoned', 'pending'] } },
      {
        $set: {
          paymentStatus: 'success',
          iciciTxnId: iciciStatus.txnID,
          iciciPaymentDateTime: iciciStatus.paymentDateTime,
          iciciResponseCode: iciciStatus.txnResponseCode,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log(`[ICICIReconciliation] Bhog payment ${payment.transactionId} already processed by another process`);
      stats.bhogAlreadySuccess++;
      return;
    }

    console.log(`[ICICIReconciliation] Recovered Bhog payment ${payment.transactionId}${isBacklog ? ' (backlog)' : ''}`);
    if (isBacklog) {
      stats.bhogBacklogRecovered++;
    } else {
      stats.bhogRecovered++;
    }

    // Fetch fresh document with all fields
    const freshPayment = await BhogPayment.findById(payment._id);
    if (!freshPayment) {
      console.error(`[ICICIReconciliation] Failed to fetch fresh payment ${payment._id}`);
      return;
    }

    // Generate receipt if missing
    if (!freshPayment.receiptPath) {
      try {
        console.log(`[ICICIReconciliation] Generating receipt for ${freshPayment.transactionId}`);
        await this.receiptService.generateBhogReceipt(freshPayment);
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to generate receipt for ${freshPayment.transactionId}:`, error);
        // Don't fail the recovery
      }
    }

    // Send email if not sent
    if (!freshPayment.emailNotificationSent && freshPayment.userInfo?.email) {
      try {
        console.log(`[ICICIReconciliation] Sending email for ${freshPayment.transactionId}`);
        const bookings = (freshPayment.bookings && freshPayment.bookings.length > 0)
          ? freshPayment.bookings.map((b: any) => ({
              day: b.day,
              date: getBhogDate(b.day),
              bhogTiming: getBhogTiming(b.day),
              quantity: b.quantity,
              categories: (b.categories && b.categories.length > 0 ? b.categories : []).map((c: any) => ({
                title: c.title || c.id || 'Bhog',
                quantity: Number(c.quantity),
              })),
            }))
          : [{
              day: freshPayment.categories?.[0]?.title || 'Bhog',
              date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
              bhogTiming: '12:30 PM - 2:30 PM',
              categories: (freshPayment.categories || []).map((c: any) => ({
                title: c.title || c.id || 'Bhog',
                quantity: Number(c.quantity),
              })),
            }];

        await this.emailService.sendBhogConfirmationEmail({
          to: freshPayment.userInfo.email,
          customerName: freshPayment.userInfo.name,
          customerPhone: freshPayment.userInfo.phone,
          isFree: false,
          totalAmount: freshPayment.actualAmountCharged || freshPayment.totalAmount,
          bookings,
          orderId: freshPayment.orderId,
          transactionId: freshPayment.transactionId,
          paymentStatus: freshPayment.paymentStatus,
        });

        freshPayment.emailNotificationSent = true;
        freshPayment.emailNotificationSentAt = new Date();
        await freshPayment.save();
        stats.emailSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to send email for ${freshPayment.transactionId}:`, error);
        freshPayment.emailNotificationError = error instanceof Error ? error.message : String(error);
        await freshPayment.save();
        stats.emailFailed++;
      }
    }

    // Send WhatsApp if not sent
    if (!freshPayment.whatsappNotificationSent && freshPayment.userInfo?.phone) {
      try {
        console.log(`[ICICIReconciliation] Sending WhatsApp for ${freshPayment.transactionId}`);
        await whatsAppService.sendBhogBookingConfirmation({
          customerName: freshPayment.userInfo.name,
          bookingDetails: formatBhogBookingDetails(freshPayment.bookings || []),
          whatsappNumber: freshPayment.userInfo.phone,
        });

        freshPayment.whatsappNotificationSent = true;
        freshPayment.whatsappNotificationSentAt = new Date();
        await freshPayment.save();
        stats.whatsappSent++;
      } catch (error) {
        console.error(`[ICICIReconciliation] Failed to send WhatsApp for ${freshPayment.transactionId}:`, error);
        freshPayment.whatsappNotificationError = error instanceof Error ? error.message : String(error);
        await freshPayment.save();
        stats.whatsappFailed++;
      }
    }
  }

  /**
   * Log reconciliation summary
   */
  private logReconciliationSummary(stats: ReconciliationStats): void {
    const duration = Date.now() - stats.startTime.getTime();
    console.log('[ICICIReconciliation] Reconciliation Summary:');
    console.log(`[ICICIReconciliation] Duration: ${duration}ms`);
    console.log(`[ICICIReconciliation] Anudan examined: ${stats.anudanExamined}`);
    console.log(`[ICICIReconciliation] Bhog examined: ${stats.bhogExamined}`);
    console.log(`[ICICIReconciliation] Anudan recovered: ${stats.anudanRecovered}`);
    console.log(`[ICICIReconciliation] Bhog recovered: ${stats.bhogRecovered}`);
    console.log(`[ICICIReconciliation] Anudan already success: ${stats.anudanAlreadySuccess}`);
    console.log(`[ICICIReconciliation] Bhog already success: ${stats.bhogAlreadySuccess}`);
    console.log(`[ICICIReconciliation] Anudan backlog examined: ${stats.anudanBacklogExamined}`);
    console.log(`[ICICIReconciliation] Bhog backlog examined: ${stats.bhogBacklogExamined}`);
    console.log(`[ICICIReconciliation] Anudan backlog recovered: ${stats.anudanBacklogRecovered}`);
    console.log(`[ICICIReconciliation] Bhog backlog recovered: ${stats.bhogBacklogRecovered}`);
    console.log(`[ICICIReconciliation] ICICI failed: ${stats.iciciFailed}`);
    console.log(`[ICICIReconciliation] ICICI pending: ${stats.iciciPending}`);
    console.log(`[ICICIReconciliation] ICICI unverified: ${stats.iciciUnverified}`);
    console.log(`[ICICIReconciliation] WhatsApp sent: ${stats.whatsappSent}`);
    console.log(`[ICICIReconciliation] WhatsApp failed: ${stats.whatsappFailed}`);
    console.log(`[ICICIReconciliation] Email sent: ${stats.emailSent}`);
    console.log(`[ICICIReconciliation] Email failed: ${stats.emailFailed}`);
    if (stats.errors.length > 0) {
      console.log(`[ICICIReconciliation] Errors: ${stats.errors.length}`);
      stats.errors.forEach((error, i) => {
        console.log(`[ICICIReconciliation] Error ${i + 1}: ${error}`);
      });
    }
  }
}

// Export singleton instance
export const iciciReconciliationService = new ICICIReconciliationService();
