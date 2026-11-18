#!/usr/bin/env node
/**
 * ABP Receipt Recovery - Production Execution Script
 * 
 * This script executes the receipt recovery workflow on the production VPS.
 * It uses the existing backend configuration (MongoDB, SMTP) without requiring
 * additional credentials to be specified.
 * 
 * Usage:
 *   node dist/scripts/execute-receipt-recovery.ts audit
 *   node dist/scripts/execute-receipt-recovery.ts backfill-dry-run
 *   node dist/scripts/execute-receipt-recovery.ts backfill
 *   node dist/scripts/execute-receipt-recovery.ts recover-dry-run
 *   node dist/scripts/execute-receipt-recovery.ts recover
 */

import mongoose from 'mongoose';
import { ReceiptRecoveryService } from '../services/ReceiptRecoveryService';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables from .env
dotenv.config();

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

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message: string, color: string = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader(title: string) {
  console.log('');
  log('='.repeat(60), colors.cyan);
  log(title, colors.cyan);
  log('='.repeat(60), colors.cyan);
  console.log('');
}

function printSection(title: string) {
  console.log('');
  log(`--- ${title} ---`, colors.yellow);
}

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    log('ERROR: MONGODB_URI environment variable is not set', colors.red);
    process.exit(1);
  }

  log('Connecting to MongoDB...', colors.blue);
  await mongoose.connect(mongoUri);
  log('Connected to MongoDB successfully', colors.green);
}

async function disconnectFromDatabase() {
  await mongoose.disconnect();
  log('Disconnected from MongoDB', colors.green);
}

function printAuditSummary(stats: RecoveryStats) {
  printSection('AUDIT SUMMARY');
  
  log(`Anudan payments examined: ${stats.anudanExamined}`, colors.white);
  log(`Bhog payments examined: ${stats.bhogExamined}`, colors.white);
  log(`Total payments examined: ${stats.anudanExamined + stats.bhogExamined}`, colors.white);
  
  if (stats.eligibleAnudanPayments) {
    log(`Eligible Anudan payments for recovery: ${stats.eligibleAnudanPayments.length}`, colors.yellow);
  }
  
  if (stats.eligibleBhogPayments) {
    log(`Eligible Bhog payments for recovery: ${stats.eligibleBhogPayments.length}`, colors.yellow);
  }
  
  if (stats.errors.length > 0) {
    log(`Errors encountered: ${stats.errors.length}`, colors.red);
    stats.errors.forEach((error, i) => {
      log(`  ${i + 1}. ${error}`, colors.red);
    });
  }
}

function printBackfillSummary(stats: RecoveryStats) {
  printSection('BACKFILL SUMMARY');
  
  log(`Anudan payments examined: ${stats.anudanExamined}`, colors.white);
  log(`Bhog payments examined: ${stats.bhogExamined}`, colors.white);
  log(`Anudan receipts backfilled: ${stats.anudanReceiptsGenerated}`, colors.green);
  log(`Bhog receipts backfilled: ${stats.bhogReceiptsGenerated}`, colors.green);
  log(`Total receipts backfilled: ${stats.anudanReceiptsGenerated + stats.bhogReceiptsGenerated}`, colors.green);
  
  if (stats.errors.length > 0) {
    log(`Errors encountered: ${stats.errors.length}`, colors.red);
    stats.errors.forEach((error, i) => {
      log(`  ${i + 1}. ${error}`, colors.red);
    });
  }
}

function printRecoverySummary(stats: RecoveryStats) {
  printSection('RECOVERY SUMMARY');
  
  log(`Anudan payments examined: ${stats.anudanExamined}`, colors.white);
  log(`Bhog payments examined: ${stats.bhogExamined}`, colors.white);
  log(`Anudan receipts generated: ${stats.anudanReceiptsGenerated}`, colors.green);
  log(`Bhog receipts generated: ${stats.bhogReceiptsGenerated}`, colors.green);
  log(`Anudan receipts emailed: ${stats.anudanReceiptsEmailed}`, colors.green);
  log(`Bhog receipts emailed: ${stats.bhogReceiptsEmailed}`, colors.green);
  log(`Total receipts generated: ${stats.anudanReceiptsGenerated + stats.bhogReceiptsGenerated}`, colors.green);
  log(`Total receipts emailed: ${stats.totalReceiptsEmailed}`, colors.green);
  
  if (stats.errors.length > 0) {
    log(`Errors encountered: ${stats.errors.length}`, colors.red);
    stats.errors.forEach((error, i) => {
      log(`  ${i + 1}. ${error}`, colors.red);
    });
  }
}

function printPreSendSummary(stats: RecoveryStats) {
  printSection('PRE-SEND SUMMARY');
  
  log(`Anudan payments examined: ${stats.anudanExamined}`, colors.white);
  log(`Bhog payments examined: ${stats.bhogExamined}`, colors.white);
  log(`Total payments examined: ${stats.anudanExamined + stats.bhogExamined}`, colors.white);
  
  if (stats.eligibleAnudanPayments) {
    log(`Anudan receipts to generate: ${stats.eligibleAnudanPayments.length}`, colors.yellow);
  }
  
  if (stats.eligibleBhogPayments) {
    log(`Bhog receipts to generate: ${stats.eligibleBhogPayments.length}`, colors.yellow);
  }
  
  const totalToGenerate = (stats.eligibleAnudanPayments?.length || 0) + (stats.eligibleBhogPayments?.length || 0);
  log(`Total receipts to generate: ${totalToGenerate}`, colors.yellow);
  
  const emailBatches = Math.ceil(totalToGenerate / 10); // 10 attachments per email
  log(`Planned email batches: ${emailBatches}`, colors.yellow);
  log(`Total attachments: ${totalToGenerate}`, colors.yellow);
  
  log('', colors.white);
  log('NOTE: This summary only shows receipts to generate.', colors.cyan);
  log('Existing receipts should be linked first using "backfill" command.', colors.cyan);
  log('Ambiguous records will be excluded during recovery.', colors.cyan);
  
  if (stats.errors.length > 0) {
    log(`Ambiguous records excluded: ${stats.errors.length}`, colors.red);
    stats.errors.forEach((error, i) => {
      log(`  ${i + 1}. ${error}`, colors.red);
    });
  }
}

async function waitForConfirmation(message: string): Promise<boolean> {
  printSection('CONFIRMATION REQUIRED');
  log(message, colors.yellow);
  log('Type "yes" to continue, or any other key to cancel:', colors.cyan);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const command = process.argv[2];
  
  if (!command) {
    log('Usage: node dist/scripts/execute-receipt-recovery.ts <command>', colors.cyan);
    log('', colors.white);
    log('Commands:', colors.cyan);
    log('  audit              - Read-only audit of missing receipts', colors.white);
    log('  backfill-dry-run   - Preview backfill without changes', colors.white);
    log('  backfill           - Link existing receipts to MongoDB', colors.white);
    log('  recover-dry-run    - Preview recovery without changes', colors.white);
    log('  recover            - Generate receipts and send emails', colors.white);
    process.exit(1);
  }

  printHeader('ABP Receipt Recovery - Production Execution');
  
  try {
    await connectToDatabase();
    
    const service = new ReceiptRecoveryService();
    
    switch (command) {
      case 'audit':
        printSection('MODE: AUDIT (Read-Only)');
        log('Scanning for payments missing receipts...', colors.blue);
        const auditStats = await service.auditMissingReceipts();
        printAuditSummary(auditStats);
        break;
        
      case 'backfill-dry-run':
        printSection('MODE: BACKFILL DRY-RUN (Preview Only)');
        log('Previewing proposed receiptPath updates...', colors.blue);
        const backfillDryRunStats = await service.backfillHistoricalReceipts(true);
        printBackfillSummary(backfillDryRunStats);
        break;
        
      case 'backfill':
        printSection('MODE: BACKFILL (Production)');
        log('Linking existing receipts to MongoDB...', colors.blue);
        log('This will update MongoDB with receiptPath for matched existing receipts.', colors.yellow);
        log('No PDFs will be generated. No emails will be sent.', colors.yellow);
        
        const backfillConfirmed = await waitForConfirmation('Do you want to proceed with backfill?');
        
        if (!backfillConfirmed) {
          log('Backfill cancelled by user', colors.red);
          process.exit(0);
        }
        
        const backfillProdStats = await service.backfillHistoricalReceipts(false);
        printBackfillSummary(backfillProdStats);
        break;
        
      case 'recover-dry-run':
        printSection('MODE: RECOVERY DRY-RUN (Preview Only)');
        log('Previewing receipt generation and email delivery...', colors.blue);
        const recoverDryRunStats = await service.recoverMissingReceipts(true);
        printRecoverySummary(recoverDryRunStats);
        break;
        
      case 'recover':
        printSection('MODE: RECOVERY (Production)');
        log('Step 1: Backfill existing receipts (if not already done)', colors.blue);
        log('Step 2: Generate missing receipts', colors.blue);
        log('Step 3: Send emails to rushikesh@proplusdata.co', colors.blue);
        
        // First, run backfill dry-run to show what would be backfilled
        log('', colors.white);
        log('Checking for existing receipts to backfill...', colors.blue);
        const backfillRecoveryDryStats = await service.backfillHistoricalReceipts(true);
        printBackfillSummary(backfillRecoveryDryStats);
        
        // Then run audit to show what needs to be generated
        log('', colors.white);
        log('Checking for genuinely missing receipts...', colors.blue);
        const auditForRecovery = await service.auditMissingReceipts();
        printAuditSummary(auditForRecovery);
        
        // Combine into pre-send summary
        printSection('PRE-SEND SUMMARY');
        log(`Anudan payments examined: ${auditForRecovery.anudanExamined}`, colors.white);
        log(`Bhog payments examined: ${auditForRecovery.bhogExamined}`, colors.white);
        log(`Total payments examined: ${auditForRecovery.anudanExamined + auditForRecovery.bhogExamined}`, colors.white);
        log(`Existing receipts to backfill: ${backfillRecoveryDryStats.anudanReceiptsGenerated + backfillRecoveryDryStats.bhogReceiptsGenerated}`, colors.green);
        
        if (auditForRecovery.eligibleAnudanPayments) {
          log(`Anudan receipts to generate: ${auditForRecovery.eligibleAnudanPayments.length}`, colors.yellow);
        }
        
        if (auditForRecovery.eligibleBhogPayments) {
          log(`Bhog receipts to generate: ${auditForRecovery.eligibleBhogPayments.length}`, colors.yellow);
        }
        
        const totalToGenerate = (auditForRecovery.eligibleAnudanPayments?.length || 0) + (auditForRecovery.eligibleBhogPayments?.length || 0);
        log(`Total receipts to generate: ${totalToGenerate}`, colors.yellow);
        
        const emailBatches = Math.ceil(totalToGenerate / 10); // 10 attachments per email
        log(`Planned email batches: ${emailBatches}`, colors.yellow);
        log(`Total attachments: ${totalToGenerate}`, colors.yellow);
        
        const totalErrors = backfillRecoveryDryStats.errors.length + auditForRecovery.errors.length;
        if (totalErrors > 0) {
          log(`Ambiguous records excluded: ${totalErrors}`, colors.red);
          log('These records will be skipped during recovery.', colors.cyan);
        }
        
        const recoverConfirmed = await waitForConfirmation('Do you want to proceed with full recovery (backfill + generate + email)?');
        
        if (!recoverConfirmed) {
          log('Recovery cancelled by user', colors.red);
          process.exit(0);
        }
        
        // Execute backfill first
        log('', colors.white);
        log('Executing backfill...', colors.blue);
        const backfillExecStats = await service.backfillHistoricalReceipts(false);
        printBackfillSummary(backfillExecStats);
        
        // Then execute recovery
        log('', colors.white);
        log('Executing receipt generation and email delivery...', colors.blue);
        const recoverStats = await service.recoverMissingReceipts(false);
        printRecoverySummary(recoverStats);
        break;
        
      default:
        log(`Unknown command: ${command}`, colors.red);
        log('Run without arguments to see usage.', colors.cyan);
        process.exit(1);
    }
    
    await disconnectFromDatabase();
    
    printHeader('OPERATION COMPLETED SUCCESSFULLY');
    log('Please review the summary above.', colors.green);
    
  } catch (error) {
    log('ERROR:', colors.red);
    log(error instanceof Error ? error.message : String(error), colors.red);
    if (error instanceof Error && error.stack) {
      log(error.stack, colors.red);
    }
    process.exit(1);
  }
}

main();
