/**
 * Bhog Controller
 * 
 * Handles bhog booking operations including free bookings for children aged 0-5
 */

import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { BhogRepository } from '../repositories/BhogRepository';
import { iciciPGService, InitiateSalePayload } from '../services/iciciPG.service';
import { sanitizeMerchantTxnNo } from '../services/iciciHash.service';
import { isBhogBookingClosedByTitle, getCutoffErrorMessageByTitle } from '../config/bhogCutoffConfig';

// ---------------------------------------------------------------------------
// Bhog sheet column layout — kept identical to the layout written by
// iciciPayment.controller.ts (paid bookings) so free and paid bookings
// always land in the same structure on the same sheet.
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

export class BhogController {
  private sheetsService: GoogleSheetsService;
  private bhogRepository: BhogRepository;

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
    this.bhogRepository = new BhogRepository();
  }

  /** Get the saved Bhog booking so the payment-success page can render its receipt. */
  async getPaymentByTransactionId(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const payment = await this.bhogRepository.getPaymentByTransactionId(transactionId);

      if (!payment) {
        res.status(404).json({ success: false, error: 'Payment not found' });
        return;
      }

      res.status(200).json({ success: true, data: payment });
    } catch (error: any) {
      console.error('Error fetching Bhog payment:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payment' });
    }
  }

  /**
   * Determine sheet name based on booking title
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
   * Extract bhog quantities from categories with defaults
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

    for (const category of categories) {
      const id = category.id.toLowerCase();
      const quantity = category.quantity || 0;

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

  /** Calculate the payable amount and plate count from the selected categories. */
  private calculateBookingTotals(categories: any[]): { totalAmount: number; totalCount: number } {
    const totalAmount = categories.reduce((sum, category) => {
      const price = Number(category.price) || 0;
      const quantity = Number(category.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    const totalCount = categories.reduce((sum, category) => sum + (Number(category.quantity) || 0), 0);

    return {
      totalAmount: Math.round((totalAmount + Number.EPSILON) * 100) / 100,
      totalCount,
    };
  }

  /**
   * Handle free bhog booking (children aged 0-5 only)
   * Records the booking in Google Sheets without payment
   */
  async handleFreeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { title, categories, timestamp, isFree, userInfo } = req.body;
      const receiptTimestamp = timestamp || new Date().toISOString();
      const receiptSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const orderId = `FREE-BHG-${receiptSuffix}`;
      const transactionId = `FREE-${receiptSuffix}`;

      // Validate required fields
      if (!title || !categories || !Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Title and categories are required.'
        });
        return;
      }

      // Check booking cutoff - reject if closed
      if (isBhogBookingClosedByTitle(title)) {
        res.status(409).json({
          success: false,
          error: getCutoffErrorMessageByTitle(title)
        });
        return;
      }

      const { totalAmount, totalCount } = this.calculateBookingTotals(categories);

      // Ensure this is indeed a free booking
      if (!isFree || totalAmount !== 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid free booking request.'
        });
        return;
      }

      // Initialize sheets service
      await this.sheetsService.initialize();

      // Determine sheet name based on booking title
      const sheetName = this.getSheetNameFromTitle(title);

      // Create sheet if it doesn't exist with headers (same structure as paid bookings)
      await this.sheetsService.createSheetIfNotExists(sheetName, BHOG_HEADERS);
      await this.sheetsService.formatHeaderRowAt(sheetName, BHOG_HEADERS.length);

      // Extract bhog quantities with defaults
      const quantities = this.extractBhogQuantities(categories);

      // Build the row in the new column order: name, mobile, email, plates, charges, actual amount, status, ids, timestamp
      const rowData: any[] = [];
      rowData[0] = userInfo?.name || '';
      rowData[1] = userInfo?.phone || '';
      rowData[2] = userInfo?.email || '';
      rowData[BHOG_COL.ADULT] = quantities.adult;
      rowData[BHOG_COL.CHILDREN_0_5] = quantities.children05;
      rowData[BHOG_COL.CHILDREN_5_PLUS] = quantities.children5Plus;
      rowData[BHOG_COL.SENIOR] = quantities.seniorCitizen;
      rowData[BHOG_COL.TOTAL_PLATES] = totalCount;
      rowData[BHOG_COL.BASE_AMOUNT] = 0;
      rowData[BHOG_COL.GATEWAY_CHARGES] = 0;
      rowData[BHOG_COL.ACTUAL_AMOUNT] = totalAmount;
      rowData[11] = isFree ? 'Free' : 'Paid';
      rowData[12] = transactionId;
      rowData[13] = orderId;
      rowData[14] = receiptTimestamp;

      await this.appendOrInsertBhogRow(sheetName, rowData);

      // Store booking in MongoDB
      await this.bhogRepository.createPayment({
        orderId,
        transactionId,
        timestamp: receiptTimestamp,
        userInfo: userInfo || { name: '', phone: '', email: '' },
        bookings: [{
          day: title,
          amount: totalAmount,
          quantity: totalCount,
          remark: 'Free booking'
        }],
        categories,
        totalAmount,
        paymentStatus: 'success'
      });

      // Recalculate the single TOTAL row at the bottom of the sheet
      await this.recalculateBhogTotal(sheetName);

      res.status(200).json({
        success: true,
        message: 'Free bhog booking recorded successfully',
        data: {
          title,
          categories,
          totalAmount,
          totalCount,
          timestamp: receiptTimestamp,
          userInfo,
          orderId,
          transactionId,
        }
      });
    } catch (error: any) {
      console.error('Error handling free bhog booking:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to record free bhog booking'
      });
    }
  }

  /**
   * Handle paid bhog booking
   * Modified for ICICI PG integration - initiates payment and returns redirect URL
   */
  async handlePaidBooking(req: Request, res: Response): Promise<void> {
    try {
      const { title, categories, timestamp, isFree, userInfo, orderId, transactionId } = req.body;
      const merchantTxnNo = typeof transactionId === 'string'
        ? sanitizeMerchantTxnNo(transactionId)
        : '';

      // Validate required fields
      if (!title || !categories || !Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Title and categories are required.'
        });
        return;
      }

      // Check booking cutoff - reject if closed BEFORE initiating payment
      if (isBhogBookingClosedByTitle(title)) {
        res.status(409).json({
          success: false,
          error: getCutoffErrorMessageByTitle(title)
        });
        return;
      }

      const { totalAmount, totalCount } = this.calculateBookingTotals(categories);

      // Validate payment info for paid bookings
      if (isFree === false && (!orderId || !merchantTxnNo)) {
        res.status(400).json({
          success: false,
          error: 'Order ID and Transaction ID are required for paid bookings.'
        });
        return;
      }

      // Step 1: Save to MongoDB with paymentStatus='pending'
      try {
        await this.bhogRepository.createPayment({
          orderId: orderId || '',
          transactionId: merchantTxnNo,
          timestamp: timestamp || new Date().toISOString(),
          userInfo: userInfo || { name: '', phone: '', email: '' },
          bookings: [{
            day: title,
            amount: totalAmount,
            quantity: totalCount,
            remark: 'Paid booking'
          }],
          categories,
          totalAmount,
          paymentStatus: 'pending'
        });
      } catch (dbError) {
        console.error('DB save failed for bhog booking:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to save booking record'
        });
        return;
      }

      // Step 2: Call ICICI initiateSale API
      try {
        const initiateSalePayload: InitiateSalePayload = {
          merchantTxnNo,
          amount: totalAmount,
          customerEmailID: userInfo?.email || '',
          customerName: userInfo?.name,
          customerMobileNo: userInfo?.phone,
          invoiceNo: orderId,
          addlParam1: 'bhog',
          addlParam2: title,
        };

        const iciciResponse = await iciciPGService.initiateSale(initiateSalePayload);

        // Step 3: Build payment URL and return to frontend
        const paymentUrl = `${iciciResponse.redirectURI}?tranCtx=${encodeURIComponent(iciciResponse.tranCtx || '')}`;

        res.status(200).json({
          success: true,
          message: 'Paid bhog booking initiated successfully',
          data: {
            title,
            categories,
            totalAmount,
            totalCount,
            timestamp: timestamp || new Date().toISOString(),
            userInfo,
            orderId,
            transactionId: merchantTxnNo
          },
          paymentUrl,
        });
      } catch (iciciError: any) {
        // ICICI API failed - mark payment as failed
        console.error('ICICI initiateSale failed for bhog booking:', iciciError);
        
        // Update MongoDB payment status to failed
        try {
          const payment = await this.bhogRepository.getPaymentByTransactionId(merchantTxnNo);
          if (payment) {
            payment.paymentStatus = 'failed';
            payment.iciciResponseCode = 'ICICI_INITIATE_FAILED';
            await payment.save();
          }
        } catch (updateError) {
          console.error('Failed to update payment status to failed:', updateError);
        }

        res.status(500).json({
          success: false,
          error: `Failed to initiate payment: ${iciciError.message}`
        });
        return;
      }
    } catch (error: any) {
      console.error('Error handling paid bhog booking:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to record paid bhog booking'
      });
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
      const totalRowIndex = data.length - 1;
      await this.sheetsService.insertRowAt(sheetName, totalRowIndex, rowData);
      newRowIndex = totalRowIndex;
    } else {
      await this.sheetsService.appendRow(sheetName, rowData);
      newRowIndex = data.length;
    }

    await this.sheetsService.formatCellsBold(sheetName, newRowIndex, BHOG_BOLD_COLUMNS);
  }

  /**
   * Recompute the single TOTAL row at the bottom of a Bhog sheet from every
   * data row above it (mirrors the logic in iciciPayment.controller.ts so
   * free and paid bookings share one consistent running total).
   */
  private async recalculateBhogTotal(sheetName: string): Promise<void> {
    const data = await this.sheetsService.getSheetData(sheetName);
    if (data.length <= 1) return;

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
}