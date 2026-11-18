# ABP Receipt Recovery - Production Deployment Guide

## Overview
This document provides step-by-step instructions for deploying and executing the ABP receipt recovery workflow on the production VPS.

## Prerequisites
- Access to production VPS: GoDaddy Ubuntu 24.04
- Project location: `/var/www/amaderbaripujo`
- Backend location: `/var/www/amaderbaripujo/backend`
- PM2 application: `amaderbaripujo`
- MongoDB and SMTP settings already configured in backend environment

## Step 1: MongoDB Backup (CRITICAL)

Before executing any recovery operation, create a backup of the MongoDB database.

**Important:** Use the actual MongoDB connection string from your environment configuration. Do not hardcode connection strings.

```bash
# SSH into the VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /var/www/amaderbaripujo/backend

# Load environment variables
source .env

# Create MongoDB backup using mongodump
# This uses the MONGODB_URI from your .env file
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d_%H%M%S)

# Verify backup was created
ls -lh ./backups/
```

**Backup Verification:**
```bash
# Check backup size
du -sh ./backups/$(ls -t ./backups/ | head -1)

# Verify backup contains collections
ls ./backups/$(ls -t ./backups/ | head -1)/
```

## Step 2: Deploy Code Changes

Transfer the modified files to the production VPS:

```bash
# From your local machine
cd "C:\PPD sites\Amader-barir-pujo-2026-new-ICICI"

# Copy modified files to VPS (using scp or your preferred method)
# Files to copy:
# - backend/src/models/AnudanPayment.ts
# - backend/src/models/BhogPayment.ts
# - backend/src/services/EmailService.ts
# - backend/src/services/ICICIReconciliationService.ts
# - backend/src/services/ReceiptRecoveryService.ts (NEW)
# - backend/src/services/GoogleSheetsLoggingService.ts (NEW)
# - backend/src/services/ICICIReconciliationService.test.ts
# - backend/src/types/contact.types.ts
# - backend/src/scripts/execute-receipt-recovery.ts (NEW)
# - backend/package.json
# - backend/package-lock.json
# - backend/jest.config.js
# - backend/.gitignore
# - backend/RECEIPT_RECOVERY_DEPLOYMENT.md (NEW)
```

Example using scp:
```bash
scp backend/src/models/AnudanPayment.ts user@vps:/var/www/amaderbaripujo/backend/src/models/
scp backend/src/models/BhogPayment.ts user@vps:/var/www/amaderbaripujo/backend/src/models/
# ... repeat for all files
```

## Step 3: Build Backend on VPS

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to backend
cd /var/www/amaderbaripujo/backend

# Install dependencies (if package.json changed)
npm install

# Build TypeScript
npm run build

# Verify build succeeded and script was compiled
ls -lh dist/scripts/execute-receipt-recovery.js
```

## Step 4: Restart PM2 Application (Only if code changes require it)

```bash
# Restart the application to load new code
pm2 restart amaderbaripujo

# Verify application is running
pm2 status

# Check logs for any errors
pm2 logs amaderbaripujo --lines 50
```

**Note:** If you only added the recovery script and did not modify server.ts or other runtime code, you may not need to restart PM2. The recovery script runs independently of the running application.

## Step 5: Execute Receipt Recovery Workflow

### Option A: Step-by-Step Execution (Recommended)

#### 5.1. Audit (Read-Only) - MUST BE FIRST

```bash
cd /var/www/amaderbaripujo/backend

# Run audit to see what needs recovery
node dist/scripts/execute-receipt-recovery.js audit
```

This will show:
- Total Anudan and Bhog payments examined
- Payments missing receiptPath
- No changes to data

**Review the audit output carefully before proceeding.**

#### 5.2. Backfill Dry-Run (Preview)

```bash
# Preview backfill without changes
node dist/scripts/execute-receipt-recovery.js backfill-dry-run
```

This will show:
- Existing receipts that can be linked
- No MongoDB updates
- No PDF generation
- No emails

#### 5.3. Backfill (Link Existing Receipts)

```bash
# Execute backfill
node dist/scripts/execute-receipt-recovery.js backfill
```

This will:
- Link existing receipt files to MongoDB
- Set receiptPath for matched payments
- No PDF generation
- No emails
- Requires interactive confirmation

#### 5.4. Recovery Dry-Run (Preview)

```bash
# Preview recovery without changes
node dist/scripts/execute-receipt-recovery.js recover-dry-run
```

This will show:
- Receipts that need to be generated
- Email batches that will be sent
- No PDF generation
- No emails
- No MongoDB updates

#### 5.5. Recovery (Generate and Email)

```bash
# Execute full recovery
node dist/scripts/execute-receipt-recovery.js recover
```

This will:
- Execute backfill first (if not already done)
- Generate missing receipts
- Send emails to rushikesh@proplusdata.co
- Requires interactive confirmation
- Shows detailed summary before execution

### Option B: Single Command with Confirmation

```bash
# Execute full recovery in one command
node dist/scripts/execute-receipt-recovery.js recover
```

The script will:
1. Show backfill dry-run summary
2. Show audit summary
3. Show combined pre-send summary with:
   - Anudan and Bhog counts
   - Existing receipts to reuse
   - Missing receipts to generate
   - Ambiguous records excluded
   - Planned email batches
   - Total attachments
4. Ask for interactive confirmation
5. Execute backfill
6. Execute recovery
7. Show final results

## Step 6: Monitor Execution

```bash
# Monitor PM2 logs during execution
pm2 logs amaderbaripujo --lines 100 --watch

# Or check application logs
tail -f /var/www/amaderbaripujo/backend/logs/*.log
```

Look for:
- `[ReceiptRecovery]` log entries
- Receipt generation messages
- Email sending confirmations
- Any error messages

## Step 7: Verify Results

After execution, verify:

```bash
# Check receipt files
ls -lh /var/www/amaderbaripujo/backend/receipts/

# Count new receipts
ls /var/www/amaderbaripujo/backend/receipts/ | wc -l

# Check PM2 logs for email delivery
pm2 logs amaderbaripujo --lines 200 | grep -i email
```

## Step 8: Troubleshooting

### Issue: MongoDB Connection Error
```bash
# Check MongoDB connection string
cat /var/www/amaderbaripujo/backend/.env | grep MONGODB_URI

# If using MongoDB Atlas, verify network access from VPS
# If using local MongoDB, check service status
sudo systemctl status mongod
```

### Issue: SMTP Authentication Error
```bash
# Check SMTP environment variables
cat /var/www/amaderbaripujo/backend/.env | grep SMTP

# Verify sender authorization with email provider
# The SMTP account must be authorized to send from durgesh.s@proplusdata.co
```

### Issue: Receipt Generation Errors
```bash
# Check receipts directory permissions
ls -ld /var/www/amaderbaripujo/backend/receipts/

# Ensure directory exists and is writable
mkdir -p /var/www/amaderbaripujo/backend/receipts
chmod 755 /var/www/amaderbaripujo/backend/receipts
```

### Issue: PM2 Application Not Starting
```bash
# Check PM2 status
pm2 status

# Check for build errors
npm run build

# Check Node.js version
node --version
```

## Step 9: Rollback (If Needed)

If issues occur, you can rollback:

```bash
# Stop PM2
pm2 stop amaderbaripujo

# Restore MongoDB from backup (DO NOT use --drop for routine rollback)
# This will restore on top of existing data without dropping
mongorestore --uri="$MONGODB_URI" ./backups/TIMESTAMP

# Restore previous code (from git or backup)
cd /var/www/amaderbaripujo
git checkout <previous-commit-hash>

# Rebuild
cd backend
npm install
npm run build

# Restart PM2
pm2 restart amaderbaripujo
```

**Important:** Never use `mongorestore --drop` as a routine rollback. It permanently deletes all data before restoring. Only use it in extreme cases when you're certain you want to completely replace the database.

## Important Notes

### SMTP Sender Authorization
The script attempts to send emails from `durgesh.s@proplusdata.co`. This requires:
- The SMTP account (configured via SMTP_USER) to be authorized to send from this address
- Verification with the email provider (cPanel/SMTP service) before production execution
- If not authorized, emails will fail with authentication errors

### Email Exactly-Once Delivery
SMTP cannot guarantee exactly-once delivery. If the process crashes after SMTP accepts the email but before recording success:
- The email may have been sent
- The success may not be recorded
- A reconciliation would be needed to avoid duplicate sends
- The script tracks `adminReceiptEmailed` to minimize this risk

**Manual Reconciliation Procedure:**
If SMTP success followed by MongoDB tracking failure is suspected:
1. Check `adminReceiptEmailed` field for the payment
2. If false but email was confirmed sent, manually set it to true
3. Verify with recipient whether duplicate was received
4. If duplicate received, manually flag for administrative review

### Duplicate Prevention
- Receipt generation checks `receiptPath` before generating
- Backfill checks filesystem for existing receipts
- Recovery skips if receipt already exists
- Email delivery tracked separately with `adminReceiptEmailed` flag
- Exact orderId matching prevents false matches (e.g., ORD-1 vs ORD-10)

### No Side Effects
- Does not change payment statuses
- Does not deduct Anudan balances
- Does not modify Google Sheets
- Does not alter customer notification behavior
- Does not change payment callback logic
- Ordinary ICICI reconciliation does NOT generate receipts or send administrative emails

## Support

For issues or questions:
1. Check PM2 logs: `pm2 logs amaderbaripujo --lines 100`
2. Check application logs: `/var/www/amaderbaripujo/backend/logs/`
3. Verify MongoDB backup exists before rollback
4. Contact development team if rollback is needed
