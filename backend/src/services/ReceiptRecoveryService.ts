/**
 * Receipt Recovery Service
 * 
 * Generates and emails receipts for successful payments that are missing receipts.
 * This is an administrative recovery process separate from customer notifications.
 * All receipts are sent to a designated admin email address.
 */

import { AnudanPayment } from '../models/AnudanPayment';
import { BhogPayment } from '../models/BhogPayment';
import { ReceiptService } from './ReceiptService';
import { EmailService } from './EmailService';
import fs from 'fs';
import path from 'path';

interface RecoveryStats {
  anudanExamined: number;
  bhogExamined: number;
  anudanReceiptsGenerated: number;
  bhogReceiptsGenerated: number;
  anudanReceiptsEmailed: number;
  bhogReceiptsEmailed: number;
  totalReceiptsEmailed: number;
  errors: string[];
  eligibleAnudanPayments?: Array<{ transactionId: string; orderId: string; amount: number }>;
  eligibleBhogPayments?: Array<{ transactionId: string; orderId: string; amount: number }>;
}

interface BatchResult {
  anudanReceipts: Array<{ transactionId: string; path: string }>;
  bhogReceipts: Array<{ transactionId: string; path: string }>;
}

export class ReceiptRecoveryService {
  private receiptService: ReceiptService;
  private emailService: EmailService;
  private readonly ADMIN_EMAIL = 'rushikesh@proplusdata.co';
  private readonly FROM_EMAIL = 'durgesh.s@proplusdata.co';
  private readonly MAX_ATTACHMENTS_PER_EMAIL = 10; // Email provider limit
  private readonly MAX_BATCH_SIZE = 50; // Process in batches to avoid memory issues
  private readonly receiptsDir: string;

  constructor(receiptService?: ReceiptService, emailService?: EmailService) {
    this.receiptService = receiptService || new ReceiptService();
    this.emailService = emailService || new EmailService();
    this.receiptsDir = path.join(process.cwd(), 'receipts');
  }

  /**
   * Operation 1: Dry-run audit - read-only reporting
   * Reports counts and payment IDs without any changes
   */
  async auditMissingReceipts(): Promise<RecoveryStats> {
    const stats: RecoveryStats = {
      anudanExamined: 0,
      bhogExamined: 0,
      anudanReceiptsGenerated: 0,
      bhogReceiptsGenerated: 0,
      anudanReceiptsEmailed: 0,
      bhogReceiptsEmailed: 0,
      totalReceiptsEmailed: 0,
      errors: [],
    };

    console.log('[ReceiptRecovery] =========================================');
    console.log('[ReceiptRecovery] DRY RUN AUDIT: Read-only mode');
    console.log('[ReceiptRecovery] From email:', this.FROM_EMAIL);
    console.log('[ReceiptRecovery] To email:', this.ADMIN_EMAIL);

    try {
      // Find successful Anudan payments without receipts
      const anudanQuery = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      const anudanTotal = await AnudanPayment.countDocuments(anudanQuery);
      console.log(`[ReceiptRecovery] [AUDIT] ${anudanTotal} Anudan payments missing receiptPath`);
      stats.anudanExamined = anudanTotal;

      if (anudanTotal > 0) {
        const anudanPayments = await AnudanPayment.find(anudanQuery)
          .limit(100) // Limit to 100 for audit
          .lean();
        
        stats.eligibleAnudanPayments = anudanPayments.map(p => ({
          transactionId: p.transactionId,
          orderId: p.orderId,
          amount: p.totalAmount,
        }));
      }

      // Find successful Bhog payments without receipts
      const bhogQuery = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      const bhogTotal = await BhogPayment.countDocuments(bhogQuery);
      console.log(`[ReceiptRecovery] [AUDIT] ${bhogTotal} Bhog payments missing receiptPath`);
      stats.bhogExamined = bhogTotal;

      if (bhogTotal > 0) {
        const bhogPayments = await BhogPayment.find(bhogQuery)
          .limit(100) // Limit to 100 for audit
          .lean();
        
        stats.eligibleBhogPayments = bhogPayments.map(p => ({
          transactionId: p.transactionId,
          orderId: p.orderId,
          amount: p.totalAmount,
        }));
      }

      this.logRecoverySummary(stats);
    } catch (error) {
      console.error('[ReceiptRecovery] Audit failed:', error);
      stats.errors.push(error instanceof Error ? error.message : String(error));
    }

    console.log('[ReceiptRecovery] =========================================');
    return stats;
  }

  /**
   * Operation 2: Historical receipt backfill
   * Links existing receipt files to MongoDB without generating PDFs or sending emails
   */
  async backfillHistoricalReceipts(dryRun: boolean = false): Promise<RecoveryStats> {
    const stats: RecoveryStats = {
      anudanExamined: 0,
      bhogExamined: 0,
      anudanReceiptsGenerated: 0,
      bhogReceiptsGenerated: 0,
      anudanReceiptsEmailed: 0,
      bhogReceiptsEmailed: 0,
      totalReceiptsEmailed: 0,
      errors: [],
    };

    console.log('[ReceiptRecovery] =========================================');
    console.log('[ReceiptRecovery] HISTORICAL RECEIPT BACKFILL');
    console.log('[ReceiptRecovery] Dry run:', dryRun);
    console.log('[ReceiptRecovery] No PDF generation, no emails');

    try {
      // Process Anudan
      const anudanQuery = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      const anudanTotal = await AnudanPayment.countDocuments(anudanQuery);
      console.log(`[ReceiptRecovery] [BACKFILL] ${anudanTotal} Anudan payments to backfill`);
      stats.anudanExamined = anudanTotal;

      if (anudanTotal > 0) {
        const anudanResult = await this.backfillAnudanReceipts(anudanQuery, stats, dryRun);
        stats.anudanReceiptsGenerated = anudanResult.receiptsGenerated;
      }

      // Process Bhog
      const bhogQuery = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      const bhogTotal = await BhogPayment.countDocuments(bhogQuery);
      console.log(`[ReceiptRecovery] [BACKFILL] ${bhogTotal} Bhog payments to backfill`);
      stats.bhogExamined = bhogTotal;

      if (bhogTotal > 0) {
        const bhogResult = await this.backfillBhogReceipts(bhogQuery, stats, dryRun);
        stats.bhogReceiptsGenerated = bhogResult.receiptsGenerated;
      }

      this.logRecoverySummary(stats);
    } catch (error) {
      console.error('[ReceiptRecovery] Backfill failed:', error);
      stats.errors.push(error instanceof Error ? error.message : String(error));
    }

    console.log('[ReceiptRecovery] =========================================');
    return stats;
  }

  /**
   * Operation 3: Missing receipt recovery
   * Generates receipts only for confirmed successful payments with no existing matching receipt
   */
  async recoverMissingReceipts(dryRun: boolean = false): Promise<RecoveryStats> {
    const stats: RecoveryStats = {
      anudanExamined: 0,
      bhogExamined: 0,
      anudanReceiptsGenerated: 0,
      bhogReceiptsGenerated: 0,
      anudanReceiptsEmailed: 0,
      bhogReceiptsEmailed: 0,
      totalReceiptsEmailed: 0,
      errors: [],
    };

    console.log('[ReceiptRecovery] =========================================');
    console.log('[ReceiptRecovery] MISSING RECEIPT RECOVERY');
    console.log('[ReceiptRecovery] Dry run:', dryRun);
    console.log('[ReceiptRecovery] From email:', this.FROM_EMAIL);
    console.log('[ReceiptRecovery] To email:', this.ADMIN_EMAIL);

    try {
      // Find successful Anudan payments without receipts
      const anudanQuery = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      const anudanTotal = await AnudanPayment.countDocuments(anudanQuery);
      console.log(`[ReceiptRecovery] Found ${anudanTotal} Anudan payments missing receipts`);
      stats.anudanExamined = anudanTotal;

      if (anudanTotal > 0) {
        const anudanResult = await this.recoverAnudanReceipts(anudanQuery, stats, dryRun);
        stats.anudanReceiptsGenerated = anudanResult.receiptsGenerated;
        stats.anudanReceiptsEmailed = anudanResult.receiptsEmailed;
      }

      // Find successful Bhog payments without receipts
      const bhogQuery = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      const bhogTotal = await BhogPayment.countDocuments(bhogQuery);
      console.log(`[ReceiptRecovery] Found ${bhogTotal} Bhog payments missing receipts`);
      stats.bhogExamined = bhogTotal;

      if (bhogTotal > 0) {
        const bhogResult = await this.recoverBhogReceipts(bhogQuery, stats, dryRun);
        stats.bhogReceiptsGenerated = bhogResult.receiptsGenerated;
        stats.bhogReceiptsEmailed = bhogResult.receiptsEmailed;
      }

      stats.totalReceiptsEmailed = stats.anudanReceiptsEmailed + stats.bhogReceiptsEmailed;

      // Log summary
      this.logRecoverySummary(stats);
    } catch (error) {
      console.error('[ReceiptRecovery] Receipt recovery failed:', error);
      stats.errors.push(error instanceof Error ? error.message : String(error));
    }

    console.log('[ReceiptRecovery] =========================================');
    return stats;
  }

  /**
   * Check for existing receipt file for a payment
   * Returns the file path if exactly one match is found, null otherwise
   * Uses exact orderId matching to avoid false matches (e.g., ORD-1 vs ORD-10)
   */
  private findExistingReceipt(orderId: string, type: 'Anudan' | 'Bhog'): string | null {
    try {
      if (!fs.existsSync(this.receiptsDir)) {
        return null;
      }

      const prefix = type === 'Anudan' ? 'anudan-receipt-' : 'bhog-receipt-';
      const files = fs.readdirSync(this.receiptsDir);
      
      // Find files matching the pattern: {type}-receipt-{orderId}-{timestamp}.pdf
      // Use exact orderId matching with boundary detection to avoid false matches
      const matchingFiles = files.filter(f => {
        if (!f.startsWith(prefix) || !f.endsWith('.pdf')) {
          return false;
        }
        
        // Remove prefix and .pdf suffix
        const nameWithoutPrefix = f.substring(prefix.length, f.length - 4);
        
        // Split by hyphen to extract orderId and timestamp
        const parts = nameWithoutPrefix.split('-');
        
        // Pattern should be: {orderId}-{timestamp}
        // If there are more parts, the orderId contains hyphens, so we need to rejoin
        // For now, assume orderId is a single token (no hyphens)
        if (parts.length < 2) {
          return false;
        }
        
        // The last part is the timestamp, everything before is the orderId
        const timestamp = parts[parts.length - 1];
        const extractedOrderId = parts.slice(0, parts.length - 1).join('-');
        
        // Verify timestamp is numeric
        if (!/^\d+$/.test(timestamp)) {
          return false;
        }
        
        // Exact orderId match
        return extractedOrderId === orderId;
      });

      if (matchingFiles.length === 0) {
        return null; // No existing receipt
      } else if (matchingFiles.length === 1) {
        // Exactly one match - reuse it
        return path.join(this.receiptsDir, matchingFiles[0]);
      } else {
        // Multiple matches - ambiguous, return null to flag for manual review
        console.warn(`[ReceiptRecovery] Multiple receipts found for ${type} orderId ${orderId}:`, matchingFiles);
        return null;
      }
    } catch (error) {
      console.error(`[ReceiptRecovery] Error checking for existing receipt for ${type} orderId ${orderId}:`, error);
      return null;
    }
  }

  /**
   * Get count of matching receipt files for a payment
   */
  private getMatchingReceiptCount(orderId: string, type: 'Anudan' | 'Bhog'): number {
    try {
      if (!fs.existsSync(this.receiptsDir)) {
        return 0;
      }

      const prefix = type === 'Anudan' ? 'anudan-receipt-' : 'bhog-receipt-';
      const files = fs.readdirSync(this.receiptsDir);
      
      // Use the same exact matching logic as findExistingReceipt
      const matchingFiles = files.filter(f => {
        if (!f.startsWith(prefix) || !f.endsWith('.pdf')) {
          return false;
        }
        
        const nameWithoutPrefix = f.substring(prefix.length, f.length - 4);
        const parts = nameWithoutPrefix.split('-');
        
        if (parts.length < 2) {
          return false;
        }
        
        const timestamp = parts[parts.length - 1];
        const extractedOrderId = parts.slice(0, parts.length - 1).join('-');
        
        if (!/^\d+$/.test(timestamp)) {
          return false;
        }
        
        return extractedOrderId === orderId;
      });

      return matchingFiles.length;
    } catch (error) {
      console.error(`[ReceiptRecovery] Error counting matching receipts for ${type} orderId ${orderId}:`, error);
      return 0;
    }
  }

  /**
   * Backfill Anudan receipts - links existing files to MongoDB without generating PDFs
   */
  private async backfillAnudanReceipts(
    query: any,
    stats: RecoveryStats,
    dryRun: boolean
  ): Promise<{ receiptsGenerated: number }> {
    let receiptsGenerated = 0;
    let skip = 0;

    while (true) {
      const payments = await AnudanPayment.find(query)
        .skip(skip)
        .limit(this.MAX_BATCH_SIZE)
        .lean();

      if (payments.length === 0) break;

      for (const payment of payments) {
        try {
          // Skip if already has receipt path (concurrent safety)
          const freshPayment = await AnudanPayment.findById(payment._id);
          if (!freshPayment || freshPayment.receiptPath) {
            console.log(`[ReceiptRecovery] [BACKFILL] Anudan ${payment.transactionId} already has receipt, skipping`);
            continue;
          }

          // Check for existing receipt file in filesystem
          const existingReceiptPath = this.findExistingReceipt(freshPayment.orderId, 'Anudan');
          
          if (existingReceiptPath) {
            // Reuse existing receipt
            console.log(`[ReceiptRecovery] [BACKFILL] Backfilling Anudan ${payment.transactionId}: ${existingReceiptPath}`);
            
            if (!dryRun) {
              await AnudanPayment.updateOne(
                { _id: freshPayment._id },
                { $set: { receiptPath: existingReceiptPath } }
              );
            } else {
              console.log(`[ReceiptRecovery] [BACKFILL] [DRY RUN] Would backfill Anudan ${payment.transactionId}: ${existingReceiptPath}`);
            }
            
            receiptsGenerated++;
          } else {
            // No existing receipt found OR ambiguous multiple receipts
            // In both cases, flag for manual review
            const matchingFiles = this.getMatchingReceiptCount(freshPayment.orderId, 'Anudan');
            if (matchingFiles > 1) {
              console.warn(`[ReceiptRecovery] [BACKFILL] Multiple receipts found for Anudan ${payment.transactionId}, flagging for manual review`);
              stats.errors.push(`Anudan ${payment.transactionId}: Multiple existing receipts found - requires manual review`);
            } else {
              // No existing receipt - not backfilled, will be handled by recovery
              console.log(`[ReceiptRecovery] [BACKFILL] No existing receipt for Anudan ${payment.transactionId}, will be handled by recovery`);
            }
          }
        } catch (error) {
          console.error(`[ReceiptRecovery] [BACKFILL] Failed to backfill Anudan ${payment.transactionId}:`, error);
          stats.errors.push(`Anudan ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.MAX_BATCH_SIZE;
    }

    return { receiptsGenerated };
  }

  /**
   * Backfill Bhog receipts - links existing files to MongoDB without generating PDFs
   */
  private async backfillBhogReceipts(
    query: any,
    stats: RecoveryStats,
    dryRun: boolean
  ): Promise<{ receiptsGenerated: number }> {
    let receiptsGenerated = 0;
    let skip = 0;

    while (true) {
      const payments = await BhogPayment.find(query)
        .skip(skip)
        .limit(this.MAX_BATCH_SIZE)
        .lean();

      if (payments.length === 0) break;

      for (const payment of payments) {
        try {
          // Skip if already has receipt path (concurrent safety)
          const freshPayment = await BhogPayment.findById(payment._id);
          if (!freshPayment || freshPayment.receiptPath) {
            console.log(`[ReceiptRecovery] [BACKFILL] Bhog ${payment.transactionId} already has receipt, skipping`);
            continue;
          }

          // Check for existing receipt file in filesystem
          const existingReceiptPath = this.findExistingReceipt(freshPayment.orderId, 'Bhog');
          
          if (existingReceiptPath) {
            // Reuse existing receipt
            console.log(`[ReceiptRecovery] [BACKFILL] Backfilling Bhog ${payment.transactionId}: ${existingReceiptPath}`);
            
            if (!dryRun) {
              await BhogPayment.updateOne(
                { _id: freshPayment._id },
                { $set: { receiptPath: existingReceiptPath } }
              );
            } else {
              console.log(`[ReceiptRecovery] [BACKFILL] [DRY RUN] Would backfill Bhog ${payment.transactionId}: ${existingReceiptPath}`);
            }
            
            receiptsGenerated++;
          } else {
            // No existing receipt found OR ambiguous multiple receipts
            // In both cases, flag for manual review
            const matchingFiles = this.getMatchingReceiptCount(freshPayment.orderId, 'Bhog');
            if (matchingFiles > 1) {
              console.warn(`[ReceiptRecovery] [BACKFILL] Multiple receipts found for Bhog ${payment.transactionId}, flagging for manual review`);
              stats.errors.push(`Bhog ${payment.transactionId}: Multiple existing receipts found - requires manual review`);
            } else {
              // No existing receipt - not backfilled, will be handled by recovery
              console.log(`[ReceiptRecovery] [BACKFILL] No existing receipt for Bhog ${payment.transactionId}, will be handled by recovery`);
            }
          }
        } catch (error) {
          console.error(`[ReceiptRecovery] [BACKFILL] Failed to backfill Bhog ${payment.transactionId}:`, error);
          stats.errors.push(`Bhog ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.MAX_BATCH_SIZE;
    }

    return { receiptsGenerated };
  }

  /**
   * Recover Anudan receipts - generates receipts for genuinely missing receipts
   */
  private async recoverAnudanReceipts(
    query: any,
    stats: RecoveryStats,
    dryRun: boolean
  ): Promise<{ receiptsGenerated: number; receiptsEmailed: number }> {
    let receiptsGenerated = 0;
    let receiptsEmailed = 0;
    let skip = 0;
    const anudanReceipts: Array<{ transactionId: string; path: string }> = [];

    while (true) {
      const payments = await AnudanPayment.find(query)
        .skip(skip)
        .limit(this.MAX_BATCH_SIZE)
        .lean();

      if (payments.length === 0) break;

      for (const payment of payments) {
        try {
          // Skip if already has receipt path (concurrent safety)
          const freshPayment = await AnudanPayment.findById(payment._id);
          if (!freshPayment || freshPayment.receiptPath) {
            console.log(`[ReceiptRecovery] Anudan ${payment.transactionId} already has receipt, skipping`);
            continue;
          }

          // Check for existing receipt file in filesystem (idempotency)
          const existingReceiptPath = this.findExistingReceipt(freshPayment.orderId, 'Anudan');
          
          if (existingReceiptPath) {
            // Reuse existing receipt - don't generate
            console.log(`[ReceiptRecovery] Anudan ${payment.transactionId} has existing receipt, reusing`);
            
            if (!dryRun) {
              await AnudanPayment.updateOne(
                { _id: freshPayment._id },
                { $set: { receiptPath: existingReceiptPath } }
              );
            }
            
            receiptsGenerated++;
            anudanReceipts.push({ transactionId: payment.transactionId, path: existingReceiptPath });
          } else {
            // Generate new receipt
            console.log(`[ReceiptRecovery] Generating receipt for Anudan ${payment.transactionId}`);
            
            if (!dryRun) {
              const receiptPath = await this.receiptService.generateAnudanReceipt(freshPayment);
              console.log(`[ReceiptRecovery] Generated receipt: ${receiptPath}`);
              
              await AnudanPayment.updateOne(
                { _id: freshPayment._id },
                { $set: { receiptPath } }
              );
              
              receiptsGenerated++;
              anudanReceipts.push({ transactionId: payment.transactionId, path: receiptPath });
            } else {
              console.log(`[ReceiptRecovery] [DRY RUN] Would generate receipt for Anudan ${payment.transactionId}`);
              receiptsGenerated++;
            }
          }
        } catch (error) {
          console.error(`[ReceiptRecovery] Failed to recover Anudan ${payment.transactionId}:`, error);
          stats.errors.push(`Anudan ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.MAX_BATCH_SIZE;
    }

    // Email generated receipts in batches
    if (!dryRun && anudanReceipts.length > 0) {
      receiptsEmailed = await this.emailReceiptsInBatches(anudanReceipts, 'Anudan', stats);
    }

    return { receiptsGenerated, receiptsEmailed };
  }

  /**
   * Recover Bhog receipts - generates receipts for genuinely missing receipts
   */
  private async recoverBhogReceipts(
    query: any,
    stats: RecoveryStats,
    dryRun: boolean
  ): Promise<{ receiptsGenerated: number; receiptsEmailed: number }> {
    let receiptsGenerated = 0;
    let receiptsEmailed = 0;
    let skip = 0;
    const bhogReceipts: Array<{ transactionId: string; path: string }> = [];

    while (true) {
      const payments = await BhogPayment.find(query)
        .skip(skip)
        .limit(this.MAX_BATCH_SIZE)
        .lean();

      if (payments.length === 0) break;

      for (const payment of payments) {
        try {
          // Skip if already has receipt path (concurrent safety)
          const freshPayment = await BhogPayment.findById(payment._id);
          if (!freshPayment || freshPayment.receiptPath) {
            console.log(`[ReceiptRecovery] Bhog ${payment.transactionId} already has receipt, skipping`);
            continue;
          }

          // Check for existing receipt file in filesystem (idempotency)
          const existingReceiptPath = this.findExistingReceipt(freshPayment.orderId, 'Bhog');
          
          if (existingReceiptPath) {
            // Reuse existing receipt - don't generate
            console.log(`[ReceiptRecovery] Bhog ${payment.transactionId} has existing receipt, reusing`);
            
            if (!dryRun) {
              await BhogPayment.updateOne(
                { _id: freshPayment._id },
                { $set: { receiptPath: existingReceiptPath } }
              );
            }
            
            receiptsGenerated++;
            bhogReceipts.push({ transactionId: payment.transactionId, path: existingReceiptPath });
          } else {
            // Generate new receipt
            console.log(`[ReceiptRecovery] Generating receipt for Bhog ${payment.transactionId}`);
            
            if (!dryRun) {
              const receiptPath = await this.receiptService.generateBhogReceipt(freshPayment);
              console.log(`[ReceiptRecovery] Generated receipt: ${receiptPath}`);
              
              await BhogPayment.updateOne(
                { _id: freshPayment._id },
                { $set: { receiptPath } }
              );
              
              receiptsGenerated++;
              bhogReceipts.push({ transactionId: payment.transactionId, path: receiptPath });
            } else {
              console.log(`[ReceiptRecovery] [DRY RUN] Would generate receipt for Bhog ${payment.transactionId}`);
              receiptsGenerated++;
            }
          }
        } catch (error) {
          console.error(`[ReceiptRecovery] Failed to recover Bhog ${payment.transactionId}:`, error);
          stats.errors.push(`Bhog ${payment.transactionId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      skip += this.MAX_BATCH_SIZE;
    }

    // Email generated receipts in batches
    if (!dryRun && bhogReceipts.length > 0) {
      receiptsEmailed = await this.emailReceiptsInBatches(bhogReceipts, 'Bhog', stats);
    }

    return { receiptsGenerated, receiptsEmailed };
  }

  /**
   * Email receipts in batches
   */
  private async emailReceiptsInBatches(
    receipts: Array<{ transactionId: string; path: string }>,
    type: 'Anudan' | 'Bhog',
    stats: RecoveryStats
  ): Promise<number> {
    let receiptsEmailed = 0;

    for (let i = 0; i < receipts.length; i += this.MAX_ATTACHMENTS_PER_EMAIL) {
      const batch = receipts.slice(i, i + this.MAX_ATTACHMENTS_PER_EMAIL);
      
      const attachments = batch.map(r => ({
        filename: `${type.toLowerCase()}-receipt-${r.transactionId}.pdf`,
        path: r.path,
      }));

      try {
        console.log(`[ReceiptRecovery] Sending batch ${Math.floor(i / this.MAX_ATTACHMENTS_PER_EMAIL) + 1} with ${batch.length} ${type} receipts`);
        
        await this.emailService.sendEmail({
          from: this.FROM_EMAIL,
          to: this.ADMIN_EMAIL,
          subject: `ABP – Recovered ${type} Payment Receipts (Batch ${Math.floor(i / this.MAX_ATTACHMENTS_PER_EMAIL) + 1})`,
          text: `Attached are ${batch.length} recovered ${type} payment receipts.\n\nTransaction IDs:\n${batch.map(r => r.transactionId).join('\n')}`,
          attachments,
        });

        console.log(`[ReceiptRecovery] Successfully sent batch ${Math.floor(i / this.MAX_ATTACHMENTS_PER_EMAIL) + 1}`);
        receiptsEmailed += batch.length;

        // Update email tracking for each payment
        for (const receipt of batch) {
          if (type === 'Anudan') {
            await AnudanPayment.updateOne(
              { transactionId: receipt.transactionId },
              { $set: { adminReceiptEmailed: true, adminReceiptEmailedAt: new Date(), adminReceiptEmailError: undefined } }
            );
          } else {
            await BhogPayment.updateOne(
              { transactionId: receipt.transactionId },
              { $set: { adminReceiptEmailed: true, adminReceiptEmailedAt: new Date(), adminReceiptEmailError: undefined } }
            );
          }
        }
      } catch (error) {
        console.error(`[ReceiptRecovery] Failed to send batch ${Math.floor(i / this.MAX_ATTACHMENTS_PER_EMAIL) + 1}:`, error);
        stats.errors.push(`Email batch ${Math.floor(i / this.MAX_ATTACHMENTS_PER_EMAIL) + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
        
        // Record email errors for each payment
        for (const receipt of batch) {
          if (type === 'Anudan') {
            await AnudanPayment.updateOne(
              { transactionId: receipt.transactionId },
              { $set: { adminReceiptEmailError: error instanceof Error ? error.message : String(error) } }
            );
          } else {
            await BhogPayment.updateOne(
              { transactionId: receipt.transactionId },
              { $set: { adminReceiptEmailError: error instanceof Error ? error.message : String(error) } }
            );
          }
        }
      }
    }

    return receiptsEmailed;
  }

  /**
   * Log recovery summary
   */
  private logRecoverySummary(stats: RecoveryStats): void {
    console.log('[ReceiptRecovery] =========================================');
    console.log('[ReceiptRecovery] SUMMARY');
    console.log(`[ReceiptRecovery] Anudan examined: ${stats.anudanExamined}`);
    console.log(`[ReceiptRecovery] Bhog examined: ${stats.bhogExamined}`);
    console.log(`[ReceiptRecovery] Anudan receipts generated: ${stats.anudanReceiptsGenerated}`);
    console.log(`[ReceiptRecovery] Bhog receipts generated: ${stats.bhogReceiptsGenerated}`);
    console.log(`[ReceiptRecovery] Anudan receipts emailed: ${stats.anudanReceiptsEmailed}`);
    console.log(`[ReceiptRecovery] Bhog receipts emailed: ${stats.bhogReceiptsEmailed}`);
    console.log(`[ReceiptRecovery] Total receipts generated: ${stats.anudanReceiptsGenerated + stats.bhogReceiptsGenerated}`);
    console.log(`[ReceiptRecovery] Total receipts emailed: ${stats.totalReceiptsEmailed}`);
    
    if (stats.errors.length > 0) {
      console.log(`[ReceiptRecovery] Errors: ${stats.errors.length}`);
      stats.errors.forEach((error, i) => {
        console.log(`[ReceiptRecovery]   ${i + 1}. ${error}`);
      });
    }
    
    console.log('[ReceiptRecovery] =========================================');
  }
}
