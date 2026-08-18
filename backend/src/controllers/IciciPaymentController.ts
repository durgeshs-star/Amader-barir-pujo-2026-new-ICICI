/**
 * ICICI Payment Gateway Callback Controller
 * 
 * Handles the payment callback from ICICI PG after user completes payment on hosted page.
 * Verifies secureHash, updates MongoDB/Google Sheets, and redirects to frontend result pages.
 * 
 * Reference: ICICI Bank Payment Gateway Interface Specification Document
 */

import { Request, Response } from 'express';
import { AnudanRepository } from '../repositories/AnudanRepository';
import { BhogRepository } from '../repositories/BhogRepository';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { anudanStateService } from '../services/anudanState.service';
import { iciciPGService, PaymentCallbackPayload } from '../services/iciciPG.service';

/**
 * Calculates ICICI PG gateway charges (2.75% surcharge + 18% GST on surcharge)
 * matching the exact ICICI / PayPhi payment simulator charges.
 */
export function calculateIciciGatewayCharges(baseAmount: number): {
  baseAmount: number;
  gatewayCharges: number;
  totalAmount: number;
} {
  const base = Math.round((Number(baseAmount) + Number.EPSILON) * 100) / 100;
  if (base <= 0) {
    return { baseAmount: 0, gatewayCharges: 0, totalAmount: 0 };
  }

  // Surcharge: 2.75%
  const surcharge = base * 0.0275;
  // GST: 18% of surcharge
  const gst = surcharge * 0.18;
  const gatewayCharges = Math.round((surcharge + gst + Number.EPSILON) * 100) / 100;
  const totalAmount = Math.round((base + gatewayCharges + Number.EPSILON) * 100) / 100;

  return {
    baseAmount: base,
    gatewayCharges,
    totalAmount,
  };
}

// ---------------------------------------------------------------------------
// Bhog sheet column layout
// Customer Name, Mobile, Email, [plate columns], [charge columns],
// Actual Amount, Payment Status, Transaction ID, Order ID, Timestamp
// ---------------------------------------------------------------------------
const BHOG_HEADERS = [
  'Customer Name',
  'Mobile Number',
  'Email',
  'Adult Plates',
  'Children 0-5 Plates',
  'Children 5+ Plates',
  'Senior Citizen Plates',
  'Total Plates',
  'Base Amount (₹)',
  'Gateway Charges (₹)',
  'Actual Amount Paid (₹)',
  'Payment Status',
  'Transaction ID',
  'Order ID',
  'Timestamp',
];
const BHOG_COL = {
  ADULT: 3,
  CHILDREN_0_5: 4,
  CHILDREN_5_PLUS: 5,
  SENIOR: 6,
  TOTAL_PLATES: 7,
  BASE_AMOUNT: 8,
  GATEWAY_CHARGES: 9,
  ACTUAL_AMOUNT: 10,
};
const BHOG_BOLD_COLUMNS = [BHOG_COL.TOTAL_PLATES, BHOG_COL.ACTUAL_AMOUNT];

// ---------------------------------------------------------------------------
// Anudan sheet: one table per category, all living on a single sheet.
// Every category table shares the exact same column set (no per-category
// item breakdown columns — just the customer, amount, and status columns).
// ---------------------------------------------------------------------------
interface AnudanCategoryConfig {
  title: string;
}

const ANUDAN_CATEGORIES: AnudanCategoryConfig[] = [
  { title: 'Panchami' },
  { title: 'Soshti' },
  { title: 'Saptami' },
  { title: 'Ashtami' },
  { title: 'Sondhi Pujo' },
  { title: 'Navami' },
  { title: 'Dasami' },
  { title: 'Panchadin Anudan' },
];

// Column layout used by every Anudan category table (0-based indexes)
const ANUDAN_HEADERS = [
  'Customer Name',
  'Mobile Number',
  'Email',
  'Base Amount (₹)',
  'Gateway Charges (₹)',
  'Actual Amount Paid (₹)',
  'Transaction ID',
  'Order ID',
  'Timestamp',
];
const ANUDAN_COL = {
  BASE_AMOUNT: 3,
  GATEWAY_CHARGES: 4,
  ACTUAL_AMOUNT: 5,
};

function getAnudanCategoryConfig(day: string): AnudanCategoryConfig | undefined {
  if (!day) return undefined;
  const normalized = day.trim().toLowerCase();
  return (
    ANUDAN_CATEGORIES.find((c) => c.title.toLowerCase() === normalized) ||
    ANUDAN_CATEGORIES.find((c) => normalized.includes(c.title.toLowerCase()))
  );
}

interface AnudanTableBlock {
  titleRowIndex: number;
  headerRowIndex: number;
  totalRowIndex: number;
  numColumns: number;
}

export class IciciPaymentController {
  private anudanRepository: AnudanRepository;
  private bhogRepository: BhogRepository;
  private sheetsService: GoogleSheetsService;
  private readonly FRONTEND_URL: string;
  private readonly ANUDAN_SHEET_NAME = 'Anudan Contributions';

  constructor() {
    this.anudanRepository = new AnudanRepository();
    this.bhogRepository = new BhogRepository();
    this.sheetsService = new GoogleSheetsService();
    this.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  /**
   * Build the frontend URL with the details needed to render the confirmation.
   * `finalAmount` is passed explicitly so the URL always carries the ICICI-charged
   * total (base + gateway charges) regardless of the order in which the Mongoose
   * document fields are mutated / saved.
   */
  private getSuccessRedirectUrl(
    payment: any,
    paymentType: 'anudan' | 'bhog',
    finalAmount: number,
  ): string {
    const params = new URLSearchParams({
      orderId: String(payment.orderId || ''),
      transactionId: String(payment.transactionId || ''),
      amount: finalAmount.toFixed(2),
      currency: 'INR',
      ...(paymentType === 'bhog' ? { fromBhog: 'true' } : { fromAnudan: 'true' }),
    });
    return `${this.FRONTEND_URL}/payment/success?${params.toString()}`;
  }

  /**
   * Handle ICICI payment callback
   * POST /api/payment/icici-callback
   * 
   * ICICI POSTs form data (application/x-www-form-urlencoded) to this endpoint
   * after user completes payment on hosted page.
   */
  handleIciciCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as PaymentCallbackPayload;
      const receivedHash = body.secureHash;

      // DEBUG: Log the complete raw callback body for investigation
      console.log('=== ICICI CALLBACK RAW BODY (BUG DEBUG) ===');
      console.log('Full req.body:', JSON.stringify(body, null, 2));
      console.log('Object.keys(req.body):', Object.keys(body));
      console.log('===========================================');

      console.log('ICICI Callback Received Full Payload:', JSON.stringify(body, null, 2));

      // Verify secureHash
      const isValidHash = iciciPGService.verifyCallback(body);
      if (!isValidHash) {
        console.error('ICICI callback hash verification failed - possible tampering', body.merchantTxnNo);
        return res.redirect(
          `${this.FRONTEND_URL}/payment/failure?transactionId=${body.merchantTxnNo}&errorMessage=Hash%20verification%20failed`
        );
      }

      // Validate merchantId
      const merchantId = process.env.ICICI_PG_MERCHANT_ID;
      if (body.merchantId !== merchantId) {
        console.error('ICICI callback merchantId mismatch', body.merchantId, merchantId);
        return res.redirect(
          `${this.FRONTEND_URL}/payment/failure?transactionId=${body.merchantTxnNo}&errorMessage=Invalid%20merchant`
        );
      }

      // Check payment success
      const isSuccess = iciciPGService.isPaymentSuccessful(body.responseCode);

      // Determine flow type from addlParam1 (if available in callback)
      console.log('Looking up payment for transactionId:', body.merchantTxnNo);
      const anudanPayment = await this.anudanRepository.getPaymentByTransactionId(body.merchantTxnNo);
      const bhogPayment = await this.bhogRepository.getPaymentByTransactionId(body.merchantTxnNo);

      console.log('Anudan payment found:', !!anudanPayment);
      console.log('Bhog payment found:', !!bhogPayment);

      if (anudanPayment) {
        // Anudan payment flow
        await this.handleAnudanCallback(anudanPayment, body, isSuccess, res);
      } else if (bhogPayment) {
        // Bhog payment flow
        await this.handleBhogCallback(bhogPayment, body, isSuccess, res);
      } else {
        console.error('Payment not found for transactionId:', body.merchantTxnNo);
        return res.redirect(
          `${this.FRONTEND_URL}/payment/failure?transactionId=${body.merchantTxnNo}&errorMessage=Payment%20not%20found`
        );
      }
    } catch (error: any) {
      console.error('Error handling ICICI callback:', error);
      return res.redirect(
        `${this.FRONTEND_URL}/payment/failure?errorMessage=Internal%20server%20error`
      );
    }
  };

  /**
   * Handle Anudan payment callback
   */
  private async handleAnudanCallback(
    payment: any,
    callbackBody: PaymentCallbackPayload,
    isSuccess: boolean,
    res: Response
  ): Promise<void> {
    try {
      // Calculate base amount from original booking categories
      const baseAmount = payment.categories?.reduce(
        (sum: number, cat: any) => sum + (Number(cat.amount) || 0),
        0
      ) || payment.totalAmount || 0;

      // Extract fee breakdown from ICICI callback
      const iciciBaseAmount = this.parseCallbackAmount(callbackBody.amount);
      const convenienceFee = this.parseCallbackAmount(callbackBody.convenienceFee);
      const serviceTax = this.parseCallbackAmount(callbackBody.serviceTax);  
      const othCharge = this.parseCallbackAmount(callbackBody.oth_charge);

      // Calculate the ACTUAL total amount charged by ICICI (base + all fees)
      const actualAmountCharged = iciciBaseAmount + convenienceFee + serviceTax + othCharge;

      console.log(`ICICI callback amounts -> Base: ₹${iciciBaseAmount}, ConvFee: ₹${convenienceFee}, ServiceTax: ₹${serviceTax}, OthCharge: ₹${othCharge}, TOTAL: ₹${actualAmountCharged}`);

      // Use actual charged amount as the definitive total
      let finalTotalAmount = actualAmountCharged;
      if (!finalTotalAmount || finalTotalAmount <= 0) {
        const calculated = calculateIciciGatewayCharges(baseAmount);
        finalTotalAmount = calculated.totalAmount;
        console.log(`Warning: ICICI callback missing actualAmountCharged, using calculated ₹${finalTotalAmount}`);
      }

      const gatewayCharges = Math.round(((finalTotalAmount - baseAmount) + Number.EPSILON) * 100) / 100;

      // Idempotency check - if already processed, just redirect
      if (payment.paymentStatus === 'success') {
        console.log('Anudan payment already processed, redirecting to success:', payment.transactionId);
        return res.redirect(this.getSuccessRedirectUrl(payment, 'anudan', finalTotalAmount));
      }

      if (isSuccess) {
        payment.baseAmount = baseAmount;
        payment.gatewayCharges = gatewayCharges;
        payment.totalAmount = finalTotalAmount;
        
        // Store ICICI actual charged amounts and fee breakdown
        payment.actualAmountCharged = actualAmountCharged;
        payment.convenienceFee = convenienceFee;
        payment.serviceTax = serviceTax;
        payment.othCharge = othCharge;

        payment.markModified('baseAmount');
        payment.markModified('gatewayCharges');
        payment.markModified('totalAmount');
        payment.markModified('actualAmountCharged');
        payment.markModified('convenienceFee');
        payment.markModified('serviceTax');
        payment.markModified('othCharge');

        console.log(`Anudan payment ICICI breakdown -> Base: ₹${baseAmount}, Gateway Charges: ₹${gatewayCharges}, Total Paid: ₹${finalTotalAmount}`);

        // Sanity check: log if actual charged amount differs significantly from expected
        this.logAmountDiscrepancy('Anudan', baseAmount, finalTotalAmount, actualAmountCharged, convenienceFee, serviceTax, othCharge);

        // Update payment with ICICI details
        payment.iciciTxnId = callbackBody.txnID;
        payment.iciciPaymentId = callbackBody.paymentID;
        payment.iciciPaymentMode = callbackBody.paymentMode;
        payment.iciciPaymentDateTime = callbackBody.paymentDateTime;
        payment.iciciResponseCode = callbackBody.responseCode;
        payment.paymentStatus = 'success';
        await payment.save();

        // Broadcast SSE updates for each category
        for (const category of payment.categories) {
          const campaignId = category.day;
          const remaining = anudanStateService.getRemaining(campaignId);
          anudanStateService.broadcast(campaignId, remaining);
          console.log(`SSE broadcast for ${campaignId}: remaining ₹${remaining}`);
        }

        // Log to Google Sheets (non-critical) — writes one row per category
        // into that category's own table on the Anudan sheet.
        await this.logAnudanToSheets(payment);

        console.log('Anudan payment successful:', payment.transactionId);
        return res.redirect(this.getSuccessRedirectUrl(payment, 'anudan', finalTotalAmount));
      } else {
        // Payment failed - rollback reservations
        payment.iciciTxnId = callbackBody.txnID;
        payment.iciciPaymentId = callbackBody.paymentID;
        payment.iciciPaymentMode = callbackBody.paymentMode;
        payment.iciciPaymentDateTime = callbackBody.paymentDateTime;
        payment.iciciResponseCode = callbackBody.responseCode;
        payment.paymentStatus = 'failed';
        await payment.save();

        // Rollback reservations for each category
        for (const category of payment.categories) {
          await anudanStateService.rollback(category.day, category.amount);
          console.log(`Rolled back ₹${category.amount} for ${category.day}`);
        }

        const errorMessage = callbackBody.respDescription || 'Payment failed';
        console.log('Anudan payment failed:', payment.transactionId, errorMessage);
        return res.redirect(
          `${this.FRONTEND_URL}/payment/failure?transactionId=${payment.transactionId}&errorMessage=${encodeURIComponent(errorMessage)}`
        );
      }
    } catch (error: any) {
      console.error('Error handling Anudan callback:', error);
      return res.redirect(
        `${this.FRONTEND_URL}/payment/failure?transactionId=${payment.transactionId}&errorMessage=Internal%20error`
      );
    }
  }

  /**
   * Handle Bhog payment callback
   */
  private async handleBhogCallback(
    payment: any,
    callbackBody: PaymentCallbackPayload,
    isSuccess: boolean,
    res: Response
  ): Promise<void> {
    try {
      // Calculate base amount from original booking categories
      const categories = payment.categories || payment.bookings || [];
      const baseAmount = categories.reduce(
        (sum: number, cat: any) => sum + ((Number(cat.price) || 0) * (Number(cat.quantity) || 1)),
        0
      ) || payment.totalAmount || 0;

      // Extract fee breakdown from ICICI callback
      const iciciBaseAmount = this.parseCallbackAmount(callbackBody.amount);
      const convenienceFee = this.parseCallbackAmount(callbackBody.convenienceFee);
      const serviceTax = this.parseCallbackAmount(callbackBody.serviceTax);  
      const othCharge = this.parseCallbackAmount(callbackBody.oth_charge);

      // Calculate the ACTUAL total amount charged by ICICI (base + all fees)
      const actualAmountCharged = iciciBaseAmount + convenienceFee + serviceTax + othCharge;

      console.log(`ICICI callback amounts -> Base: ₹${iciciBaseAmount}, ConvFee: ₹${convenienceFee}, ServiceTax: ₹${serviceTax}, OthCharge: ₹${othCharge}, TOTAL: ₹${actualAmountCharged}`);

      // Use actual charged amount as the definitive total
      let finalTotalAmount = actualAmountCharged;
      if (!finalTotalAmount || finalTotalAmount <= 0) {
        const calculated = calculateIciciGatewayCharges(baseAmount);
        finalTotalAmount = calculated.totalAmount;
        console.log(`Warning: ICICI callback missing actualAmountCharged, using calculated ₹${finalTotalAmount}`);
      }

      const gatewayCharges = Math.round(((finalTotalAmount - baseAmount) + Number.EPSILON) * 100) / 100;

      // Idempotency check - if already processed, just redirect
      if (payment.paymentStatus === 'success') {
        console.log('Bhog payment already processed, redirecting to success:', payment.transactionId);
        return res.redirect(this.getSuccessRedirectUrl(payment, 'bhog', finalTotalAmount));
      }

      if (isSuccess) {
        payment.baseAmount = baseAmount;
        payment.gatewayCharges = gatewayCharges;
        payment.totalAmount = finalTotalAmount;
        
        // Store ICICI actual charged amounts and fee breakdown
        payment.actualAmountCharged = actualAmountCharged;
        payment.convenienceFee = convenienceFee;
        payment.serviceTax = serviceTax;
        payment.othCharge = othCharge;

        payment.markModified('baseAmount');
        payment.markModified('gatewayCharges');
        payment.markModified('totalAmount');
        payment.markModified('actualAmountCharged');
        payment.markModified('convenienceFee');
        payment.markModified('serviceTax');
        payment.markModified('othCharge');

        console.log(`Bhog payment ICICI breakdown -> Base: ₹${baseAmount}, Gateway Charges: ₹${gatewayCharges}, Total Paid: ₹${finalTotalAmount}`);

        // Sanity check: log if actual charged amount differs significantly from expected
        this.logAmountDiscrepancy('Bhog', baseAmount, finalTotalAmount, actualAmountCharged, convenienceFee, serviceTax, othCharge);

        // Update payment with ICICI details
        payment.iciciTxnId = callbackBody.txnID;
        payment.iciciPaymentId = callbackBody.paymentID;
        payment.iciciPaymentMode = callbackBody.paymentMode;
        payment.iciciPaymentDateTime = callbackBody.paymentDateTime;
        payment.iciciResponseCode = callbackBody.responseCode;
        payment.paymentStatus = 'success';
        await payment.save();

        // Log to Google Sheets (non-critical)
        await this.logBhogToSheets(payment);

        console.log('Bhog payment successful:', payment.transactionId);
        return res.redirect(this.getSuccessRedirectUrl(payment, 'bhog', finalTotalAmount));
      } else {
        // Payment failed
        payment.iciciTxnId = callbackBody.txnID;
        payment.iciciPaymentId = callbackBody.paymentID;
        payment.iciciPaymentMode = callbackBody.paymentMode;
        payment.iciciPaymentDateTime = callbackBody.paymentDateTime;
        payment.iciciResponseCode = callbackBody.responseCode;
        payment.paymentStatus = 'failed';
        await payment.save();

        const errorMessage = callbackBody.respDescription || 'Payment failed';
        console.log('Bhog payment failed:', payment.transactionId, errorMessage);
        return res.redirect(
          `${this.FRONTEND_URL}/payment/failure?transactionId=${payment.transactionId}&errorMessage=${encodeURIComponent(errorMessage)}`
        );
      }
    } catch (error: any) {
      console.error('Error handling Bhog callback:', error);
      return res.redirect(
        `${this.FRONTEND_URL}/payment/failure?transactionId=${payment.transactionId}&errorMessage=Internal%20error`
      );
    }
  }

  // -------------------------------------------------------------------------
  // Anudan sheet logic — one table per category on a single sheet
  // -------------------------------------------------------------------------

  /**
   * Split the payment's total base/gateway/actual amounts across the
   * categories in the basket, proportionally to each category's own
   * donation amount. The last category absorbs any rounding remainder so
   * the columns always foot exactly to the ICICI-charged total.
   */
  private allocateAnudanAmounts(payment: any): Array<{ day: string; base: number; gateway: number; actual: number }> {
    const categories = payment.categories || [];
    const totalBase =
      payment.baseAmount || categories.reduce((sum: number, cat: any) => sum + (Number(cat.amount) || 0), 0);
    const totalGateway = payment.gatewayCharges || 0;
    const totalActual = payment.actualAmountCharged || payment.totalAmount || totalBase + totalGateway;

    const result: Array<{ day: string; base: number; gateway: number; actual: number }> = [];
    let allocatedGateway = 0;
    let allocatedActual = 0;

    categories.forEach((cat: any, index: number) => {
      const base = Number(cat.amount) || 0;
      const isLast = index === categories.length - 1;
      let gateway: number;
      let actual: number;

      if (isLast) {
        gateway = Math.round(((totalGateway - allocatedGateway) + Number.EPSILON) * 100) / 100;
        actual = Math.round(((totalActual - allocatedActual) + Number.EPSILON) * 100) / 100;
      } else {
        const ratio = totalBase > 0 ? base / totalBase : 0;
        gateway = Math.round((totalGateway * ratio + Number.EPSILON) * 100) / 100;
        actual = Math.round((base + gateway + Number.EPSILON) * 100) / 100;
        allocatedGateway += gateway;
        allocatedActual += actual;
      }

      result.push({ day: cat.day, base, gateway, actual });
    });

    return result;
  }

  /**
   * Create all 8 category tables (title + header + TOTAL row, each 2 blank
   * rows apart) the very first time the Anudan sheet is touched. Never runs
   * again once the sheet has any content, so it never disturbs existing data.
   */
  private async ensureAnudanSheetStructure(): Promise<void> {
    await this.sheetsService.createSheetIfNotExists(this.ANUDAN_SHEET_NAME, []);
    const existingData = await this.sheetsService.getSheetData(this.ANUDAN_SHEET_NAME);
    if (existingData.length > 0) return; // already initialized

    const rows: any[][] = [];
    const blocks: Array<{ config: AnudanCategoryConfig; titleRow: number; headerRow: number; totalRow: number; numColumns: number }> = [];
    const numColumns = ANUDAN_HEADERS.length;

    for (const config of ANUDAN_CATEGORIES) {
      const titleRow = rows.length;
      rows.push([config.title]);

      const headerRow = rows.length;
      rows.push([...ANUDAN_HEADERS]);

      const totalRow = rows.length;
      const totalRowData = new Array(numColumns).fill('');
      totalRowData[0] = 'TOTAL';
      rows.push(totalRowData);

      rows.push([]); // spacer
      rows.push([]); // spacer

      blocks.push({ config, titleRow, headerRow, totalRow, numColumns });
    }

    await this.sheetsService.appendRows(this.ANUDAN_SHEET_NAME, rows);

    for (const block of blocks) {
      await this.sheetsService.formatCategoryTitleRow(this.ANUDAN_SHEET_NAME, block.titleRow, block.numColumns);
      await this.sheetsService.formatHeaderRowAt(this.ANUDAN_SHEET_NAME, block.numColumns, block.headerRow);
      await this.sheetsService.formatRowBold(this.ANUDAN_SHEET_NAME, block.totalRow, block.numColumns);
      await this.sheetsService.formatTableBorder(this.ANUDAN_SHEET_NAME, block.titleRow, block.totalRow + 1, block.numColumns);
    }
  }

  /** Locate a category's title/header/TOTAL row positions by scanning the sheet. */
  private async findAnudanCategoryBlock(title: string): Promise<AnudanTableBlock | null> {
    const data = await this.sheetsService.getSheetData(this.ANUDAN_SHEET_NAME);
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === title) {
        const headerRowIndex = i + 1;
        const numColumns = (data[headerRowIndex] || []).length;
        for (let j = headerRowIndex + 1; j < data.length; j++) {
          if (data[j][0] === 'TOTAL') {
            return { titleRowIndex: i, headerRowIndex, totalRowIndex: j, numColumns };
          }
          // Stop if we hit the next category's title before finding a TOTAL row (shouldn't happen)
          if (ANUDAN_CATEGORIES.some((c) => c.title === data[j][0])) break;
        }
      }
    }
    return null;
  }

  /** Recompute a single category table's TOTAL row from its own data rows only. */
  private async recalculateAnudanCategoryTotal(config: AnudanCategoryConfig): Promise<void> {
    const block = await this.findAnudanCategoryBlock(config.title);
    if (!block) return;

    const data = await this.sheetsService.getSheetData(this.ANUDAN_SHEET_NAME);

    let totalActual = 0;
    for (let i = block.headerRowIndex + 1; i < block.totalRowIndex; i++) {
      totalActual += parseFloat(data[i]?.[ANUDAN_COL.ACTUAL_AMOUNT]) || 0;
    }

    const summaryRow = new Array(block.numColumns).fill('');
    summaryRow[0] = 'TOTAL';
    summaryRow[ANUDAN_COL.ACTUAL_AMOUNT] = totalActual;

    await this.sheetsService.updateRow(this.ANUDAN_SHEET_NAME, block.totalRowIndex, summaryRow);
    await this.sheetsService.formatRowBold(this.ANUDAN_SHEET_NAME, block.totalRowIndex, block.numColumns);
    await this.sheetsService.formatCellsBold(this.ANUDAN_SHEET_NAME, block.totalRowIndex, [ANUDAN_COL.ACTUAL_AMOUNT]);
  }

  /**
   * Log Anudan payment to Google Sheets — writes one row per category into
   * that category's own table, inserted directly above its TOTAL row, then
   * recalculates that table's TOTAL. Runs sequentially (not Promise.all) so
   * row-index shifts from one category's insert don't race another's.
   */
  private async logAnudanToSheets(payment: any): Promise<void> {
    try {
      await this.sheetsService.initialize();
      await this.ensureAnudanSheetStructure();

      const allocations = this.allocateAnudanAmounts(payment);

      for (const alloc of allocations) {
        const config = getAnudanCategoryConfig(alloc.day);
        if (!config) {
          console.warn(`No Anudan category config found for "${alloc.day}" — skipping sheet log for this category. Check ANUDAN_CATEGORIES.`);
          continue;
        }

        const block = await this.findAnudanCategoryBlock(config.title);
        if (!block) {
          console.error(`Could not locate table block for Anudan category "${config.title}" in the sheet — skipping.`);
          continue;
        }

        const rowData = [
          payment.userInfo?.name || '',
          payment.userInfo?.phone || '',
          payment.userInfo?.email || '',
          alloc.base,
          alloc.gateway,
          alloc.actual,
          'Paid',
          payment.transactionId,
          payment.orderId,
          payment.timestamp,
        ];

        await this.sheetsService.insertRowAt(this.ANUDAN_SHEET_NAME, block.totalRowIndex, rowData);
        await this.sheetsService.formatCellsBold(this.ANUDAN_SHEET_NAME, block.totalRowIndex, [ANUDAN_COL.ACTUAL_AMOUNT]);

        await this.recalculateAnudanCategoryTotal(config);
      }
    } catch (sheetsError) {
      console.error('Failed to log Anudan to Google Sheets (non-critical):', sheetsError);
    }
  }

  // -------------------------------------------------------------------------
  // Bhog sheet logic — single running TOTAL row at the very bottom
  // -------------------------------------------------------------------------

  /**
   * Extract bhog quantities from categories array
   */
  private extractBhogQuantities(categories: any[]): {
    adult: number;
    children05: number;
    children5Plus: number;
    seniorCitizen: number;
  } {
    const quantities = {
      adult: 0,
      children05: 0,
      children5Plus: 0,
      seniorCitizen: 0
    };

    if (!Array.isArray(categories)) return quantities;

    for (const category of categories) {
      const id = String(category.id || '').toLowerCase();
      const quantity = Number(category.quantity) || 0;

      if (id.includes('adult')) {
        quantities.adult = quantity;
      } else if (id.includes('children-0-5') || id.includes('children05')) {
        quantities.children05 = quantity;
      } else if (id.includes('children-5') || id.includes('children5')) {
        quantities.children5Plus = quantity;
      } else if (id.includes('senior')) {
        quantities.seniorCitizen = quantity;
      }
    }

    return quantities;
  }

  /**
   * Log Bhog payment to Google Sheets
   */
  private async logBhogToSheets(payment: any): Promise<void> {
    try {
      await this.sheetsService.initialize();

      const booking = payment.bookings?.[0] || {};
      const dayTitle = booking.day || payment.categories?.[0]?.title || 'General Bhog';
      const sheetName = this.getSheetNameFromTitle(dayTitle);

      await this.sheetsService.createSheetIfNotExists(sheetName, BHOG_HEADERS);
      await this.sheetsService.formatHeaderRowAt(sheetName, BHOG_HEADERS.length);

      const quantities = this.extractBhogQuantities(payment.categories || []);
      const totalPlates = booking.quantity || (quantities.adult + quantities.children05 + quantities.children5Plus + quantities.seniorCitizen);

      const rowData: any[] = [];
      rowData[0] = payment.userInfo.name;
      rowData[1] = payment.userInfo.phone;
      rowData[2] = payment.userInfo.email;
      rowData[BHOG_COL.ADULT] = quantities.adult;
      rowData[BHOG_COL.CHILDREN_0_5] = quantities.children05;
      rowData[BHOG_COL.CHILDREN_5_PLUS] = quantities.children5Plus;
      rowData[BHOG_COL.SENIOR] = quantities.seniorCitizen;
      rowData[BHOG_COL.TOTAL_PLATES] = totalPlates;
      rowData[BHOG_COL.BASE_AMOUNT] = payment.baseAmount || (payment.totalAmount - (payment.gatewayCharges || 0));
      rowData[BHOG_COL.GATEWAY_CHARGES] = payment.gatewayCharges || 0;
      rowData[BHOG_COL.ACTUAL_AMOUNT] = payment.actualAmountCharged || payment.totalAmount;
      rowData[11] = 'Paid';
      rowData[12] = payment.transactionId;
      rowData[13] = payment.orderId;
      rowData[14] = payment.timestamp;

      await this.appendOrInsertBhogRow(sheetName, rowData);
      await this.recalculateBhogTotal(sheetName);
    } catch (sheetsError) {
      console.error('Failed to log Bhog to Google Sheets (non-critical):', sheetsError);
    }
  }

  /**
   * Write a Bhog booking row. If a TOTAL row already exists at the bottom of
   * the sheet, the new row is inserted directly ABOVE it (so TOTAL stays the
   * very last row); otherwise it's simply appended.
   */
  private async appendOrInsertBhogRow(sheetName: string, rowData: any[]): Promise<void> {
    const data = await this.sheetsService.getSheetData(sheetName);
    const lastRow = data[data.length - 1];
    const hasTotalRow = !!lastRow && lastRow[0] === 'TOTAL';

    let newRowIndex: number;
    if (hasTotalRow) {
      const totalRowIndex = data.length - 1; // 0-based
      await this.sheetsService.insertRowAt(sheetName, totalRowIndex, rowData);
      newRowIndex = totalRowIndex;
    } else {
      await this.sheetsService.appendRow(sheetName, rowData);
      newRowIndex = data.length; // 0-based index of the freshly appended row
    }

    await this.sheetsService.formatCellsBold(sheetName, newRowIndex, BHOG_BOLD_COLUMNS);
  }

  /**
   * Recompute the single TOTAL row at the bottom of a Bhog sheet from every
   * data row above it. Creates the TOTAL row once if it doesn't exist yet;
   * after that it only ever updates that same row in place.
   */
  private async recalculateBhogTotal(sheetName: string): Promise<void> {
    const data = await this.sheetsService.getSheetData(sheetName);
    if (data.length <= 1) return; // only header row, nothing to total yet

    let totalPlates = 0;
    let totalActualAmount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === 'TOTAL') continue;
      totalPlates += parseInt(row[BHOG_COL.TOTAL_PLATES], 10) || 0;
      totalActualAmount += parseFloat(row[BHOG_COL.ACTUAL_AMOUNT]) || 0;
    }

    const summaryRow = new Array(BHOG_HEADERS.length).fill('');
    summaryRow[0] = 'TOTAL';
    summaryRow[BHOG_COL.TOTAL_PLATES] = totalPlates;
    summaryRow[BHOG_COL.ACTUAL_AMOUNT] = totalActualAmount;

    const lastRow = data[data.length - 1];
    if (lastRow && lastRow[0] === 'TOTAL') {
      const totalRowIndex = data.length - 1;
      await this.sheetsService.updateRow(sheetName, totalRowIndex, summaryRow);
      await this.sheetsService.formatRowBold(sheetName, totalRowIndex, BHOG_HEADERS.length);
    } else {
      await this.sheetsService.appendRow(sheetName, summaryRow);
      await this.sheetsService.formatRowBold(sheetName, data.length, BHOG_HEADERS.length);
    }
  }

  /**
   * Determine sheet name from booking title
   */
  private getSheetNameFromTitle(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('panchami')) return 'Panchami Bhog';
    if (titleLower.includes('saptami')) return 'Saptami Bhog';
    if (titleLower.includes('ashtami')) return 'Ashtami Bhog';
    if (titleLower.includes('navami')) return 'Navami Bhog';
    if (titleLower.includes('durga puja')) return 'Durga Puja Bhog';
    if (titleLower.includes('lakshmi puja')) return 'Lakshmi Puja Bhog';
    if (titleLower.includes('saraswati puja')) return 'Saraswati Puja Bhog';
    
    return 'General Bhog Bookings';
  }

  /**
   * Parse amount from ICICI callback field (handles string/number/undefined)
   */
  private parseCallbackAmount(value: any): number {
    if (value === undefined || value === null || value === '') {
      return 0;
    }
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : Math.round((parsed + Number.EPSILON) * 100) / 100;
  }

  /**
   * Log discrepancy if actual charged amount differs unexpectedly from calculated total
   */
  private logAmountDiscrepancy(
    paymentType: string,
    baseAmount: number,
    calculatedTotal: number,
    actualCharged: number,
    convenienceFee: number,
    serviceTax: number,
    othCharge: number
  ): void {
    if (!actualCharged || actualCharged <= 0) {
      console.warn(`${paymentType} payment: ICICI callback missing actualAmountCharged field`);
      return;
    }

    const totalFees = convenienceFee + serviceTax + othCharge;
    const expectedTotal = baseAmount + totalFees;
    const discrepancy = Math.abs(actualCharged - expectedTotal);
    
    if (discrepancy > 0.01) {
      console.warn(
        `${paymentType} payment amount discrepancy: ` +
        `Base=₹${baseAmount}, Fees=₹${totalFees} (Conv:₹${convenienceFee} Tax:₹${serviceTax} Oth:₹${othCharge}), ` +
        `Expected=₹${expectedTotal}, Actual=₹${actualCharged}, Discrepancy=₹${discrepancy}`
      );
    }
  }

  /**
   * Helper to extract the total charged amount from ICICI/PayPhi callback payload,
   * taking into account gateway charges, surcharges, or total amount fields.
   */
  private extractChargedAmount(body: any): number | null {
    if (!body) return null;

    // Check for explicit total/charged/gross/paid amount fields sent by ICICI/PayPhi
    const candidates = [
      body.totalAmount,
      body.chargedAmount,
      body.grossAmount,
      body.paidAmount,
      body.transactionAmount,
      body.txnAmount,
      body.amountPaid,
    ];

    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null && candidate !== '') {
        const parsed = parseFloat(String(candidate));
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }

    // Check if base amount + surcharge / convFee / tax is present
    const baseAmount = body.amount ? parseFloat(String(body.amount)) : null;
    const extraFee = parseFloat(String(body.surcharge || body.convFee || body.tax || body.serviceTax || body.fee || '0'));

    if (baseAmount !== null && !isNaN(baseAmount)) {
      if (!isNaN(extraFee) && extraFee > 0) {
        return baseAmount + extraFee;
      }
      return baseAmount;
    }

    return null;
  }
}