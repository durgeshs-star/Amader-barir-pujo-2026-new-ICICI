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
import { ReceiptService } from '../services/ReceiptService';
import { EmailService } from '../services/EmailService';
import { whatsAppService } from '../services/WhatsAppService';
import { formatBhogBookingDetails } from '../utils/bhogWhatsAppFormatter';

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
  'Pandal Bhog Plates',
  'Senior Citizen Plates',
  'Packed Bhog Plates',
  'Children 0-5 Plates',
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
  PANDAL_BHOG: 3,
  SENIOR_CITIZEN: 4,
  PACKED_BHOG: 5,
  CHILDREN_0_5: 6,
  TOTAL_PLATES: 7,
  BASE_AMOUNT: 8,
  GATEWAY_CHARGES: 9,
  ACTUAL_AMOUNT: 10,
};
const BHOG_BOLD_COLUMNS = [BHOG_COL.TOTAL_PLATES, BHOG_COL.ACTUAL_AMOUNT];

export class BhogController {
  private sheetsService: GoogleSheetsService;
  private bhogRepository: BhogRepository;
  private receiptService: ReceiptService;
  private emailService: EmailService;

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
    this.bhogRepository = new BhogRepository();
    this.receiptService = new ReceiptService();
    this.emailService = new EmailService();
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
   * Priority: Sandhi Puja must be checked before normal Ashtami
   */
  private getSheetNameFromTitle(title: string): string {
    const titleLower = title.toLowerCase();
    const sheetName = this.determineSheetName(titleLower);
    console.log(`[BhogSheetRouting] title="${title}" -> sheet="${sheetName}"`);
    return sheetName;
  }

  /**
   * Core sheet name determination logic
   * Separated for clarity and testability
   */
  private determineSheetName(titleLower: string): string {
    // Check for Sandhi Puja FIRST (before normal Ashtami)
    // Recognize both spellings: "puja" and "pujo", as well as "sandhi"
    if (
      titleLower.includes('sandhi puja') ||
      titleLower.includes('sandhi pujo') ||
      titleLower.includes('sandhi')
    ) {
      return 'Ashtami Sandhi Puja';
    }

    // Normal Ashtami Bhog (must NOT match Sandhi Puja)
    if (titleLower.includes('ashtami')) {
      return 'Ashtami Bhog';
    }

    // Other Bhog types
    if (titleLower.includes('panchami')) return 'Panchami Bhog';
    if (titleLower.includes('saptami')) return 'Saptami Bhog';
    if (titleLower.includes('navami')) return 'Navami Bhog';
    if (titleLower.includes('durga puja')) return 'Durga Puja Bhog';
    if (titleLower.includes('lakshmi')) return 'Lakshmi Puja Bhog';
    if (titleLower.includes('saraswati')) return 'Saraswati Puja Bhog';

    return 'General Bhog Bookings';
  }

  /**
   * Extract bhog quantities from categories with defaults
   * Maps frontend category IDs to sheet columns
   */
  private extractBhogQuantities(categories: any[]): {
    pandalBhog: number;
    seniorCitizen: number;
    packedBhog: number;
    children05: number;
  } {
    const quantities = {
      pandalBhog: 0,
      seniorCitizen: 0,
      packedBhog: 0,
      children05: 0
    };

    for (const category of categories) {
      const id = String(category.id || '').toLowerCase();
      const quantity = Number(category.quantity) || 0;

      if (id === 'bhog-booking') {
        quantities.pandalBhog = quantity;
      } else if (id === 'bhog-booking-senior' || id.includes('senior')) {
        quantities.seniorCitizen = quantity;
      } else if (id === 'packed-bhog') {
        quantities.packedBhog = quantity;
      } else if (id === 'children-0-5' || id.includes('children05')) {
        quantities.children05 = quantity;
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
   * Helper to normalize request payload into standardized day bookings and flat categories
   */
  private normalizeBhogPayload(body: any): {
    dayBookings: Array<{
      day: string;
      dayKey?: string;
      amount: number;
      quantity: number;
      remark?: string;
      categories: any[];
    }>;
    flatCategories: any[];
    totalAmount: number;
    totalCount: number;
  } {
    let dayBookings: Array<{
      day: string;
      dayKey?: string;
      amount: number;
      quantity: number;
      remark?: string;
      categories: any[];
    }> = [];

    if (Array.isArray(body.bookings) && body.bookings.length > 0) {
      dayBookings = body.bookings.map((b: any) => {
        const cats = Array.isArray(b.categories) ? b.categories : [];
        const dayCats = cats.filter((c: any) => Number(c.quantity) > 0);
        const dayAmount = dayCats.reduce((sum: number, c: any) => sum + ((Number(c.price) || 0) * (Number(c.quantity) || 0)), 0);
        const dayQty = dayCats.reduce((sum: number, c: any) => sum + (Number(c.quantity) || 0), 0);
        return {
          day: b.day || 'Bhog',
          dayKey: b.dayKey,
          amount: Math.round((dayAmount + Number.EPSILON) * 100) / 100,
          quantity: dayQty,
          remark: b.remark || '',
          categories: dayCats,
        };
      }).filter((b: any) => b.quantity > 0 || (Array.isArray(b.categories) && b.categories.length > 0));
    } else if (body.title && Array.isArray(body.categories)) {
      const activeCats = body.categories.filter((c: any) => Number(c.quantity) > 0);
      const { totalAmount, totalCount } = this.calculateBookingTotals(body.categories);
      dayBookings = [{
        day: body.title,
        dayKey: body.dayKey,
        amount: totalAmount,
        quantity: totalCount,
        remark: '',
        categories: activeCats,
      }];
    }

    const flatCategories: any[] = [];
    dayBookings.forEach((b) => {
      b.categories.forEach((cat) => {
        flatCategories.push({
          ...cat,
          day: b.day,
          dayKey: b.dayKey,
        });
      });
    });

    const totalAmount = dayBookings.reduce((sum, b) => sum + b.amount, 0);
    const totalCount = dayBookings.reduce((sum, b) => sum + b.quantity, 0);

    return {
      dayBookings,
      flatCategories,
      totalAmount: Math.round((totalAmount + Number.EPSILON) * 100) / 100,
      totalCount,
    };
  }

  /**
   * Handle free bhog booking (children aged 0-5 only across all selected days)
   * Records the booking in Google Sheets without payment
   */
  async handleFreeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { timestamp, isFree, userInfo } = req.body;
      const receiptTimestamp = timestamp || new Date().toISOString();
      const receiptSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const orderId = `FREE-BHG-${receiptSuffix}`;
      const transactionId = `FREE-${receiptSuffix}`;

      const { dayBookings, flatCategories, totalAmount, totalCount } = this.normalizeBhogPayload(req.body);

      // Validate required fields
      if (dayBookings.length === 0 || totalCount === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. At least one bhog selection is required.'
        });
        return;
      }

      // Check booking cutoff for each day in the cart
      for (const booking of dayBookings) {
        if (isBhogBookingClosedByTitle(booking.day)) {
          res.status(409).json({
            success: false,
            error: getCutoffErrorMessageByTitle(booking.day)
          });
          return;
        }
      }

      // Ensure this is indeed a free booking
      if (!isFree || totalAmount !== 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid free booking request. Only children aged 0 to 5 are eligible for free booking.'
        });
        return;
      }

      // Initialize sheets service
      await this.sheetsService.initialize();

      // For EACH booked day, write a record to that day's respective sheet
      for (const booking of dayBookings) {
        const sheetName = this.getSheetNameFromTitle(booking.day);
        await this.sheetsService.createSheetIfNotExists(sheetName, BHOG_HEADERS);
        await this.sheetsService.formatHeaderRowAt(sheetName, BHOG_HEADERS.length);

        const quantities = this.extractBhogQuantities(booking.categories);
        const dayPlates = booking.quantity || (quantities.pandalBhog + quantities.seniorCitizen + quantities.packedBhog + quantities.children05);

        const rowData: any[] = [];
        rowData[0] = userInfo?.name || '';
        rowData[1] = userInfo?.phone || '';
        rowData[2] = userInfo?.email || '';
        rowData[BHOG_COL.PANDAL_BHOG] = quantities.pandalBhog;
        rowData[BHOG_COL.SENIOR_CITIZEN] = quantities.seniorCitizen;
        rowData[BHOG_COL.PACKED_BHOG] = quantities.packedBhog;
        rowData[BHOG_COL.CHILDREN_0_5] = quantities.children05;
        rowData[BHOG_COL.TOTAL_PLATES] = dayPlates;
        rowData[BHOG_COL.BASE_AMOUNT] = 0;
        rowData[BHOG_COL.GATEWAY_CHARGES] = 0;
        rowData[BHOG_COL.ACTUAL_AMOUNT] = 0;
        rowData[11] = 'Free';
        rowData[12] = transactionId;
        rowData[13] = orderId;
        rowData[14] = receiptTimestamp;

        await this.appendOrInsertBhogRow(sheetName, rowData);
        await this.recalculateBhogTotal(sheetName);
      }

      // Store booking in MongoDB
      const savedPayment = await this.bhogRepository.createPayment({
        orderId,
        transactionId,
        timestamp: receiptTimestamp,
        userInfo: userInfo || { name: '', phone: '', email: '' },
        bookings: dayBookings,
        categories: flatCategories,
        totalAmount: 0,
        paymentStatus: 'success'
      });

      // Generate receipt for free Bhog booking
      let receiptPath: string | null = null;
      try {
        console.log('[Free Bhog] Generating receipt for transactionId:', transactionId);
        receiptPath = await this.receiptService.generateBhogReceipt(savedPayment);
        console.log('[Free Bhog] Receipt generated successfully at:', receiptPath);
        
        savedPayment.receiptPath = receiptPath;
        await savedPayment.save();
      } catch (receiptError) {
        console.error('[Free Bhog] Failed to generate receipt:', receiptError);
      }

      // Send booking confirmation email
      if (userInfo?.email) {
        try {
          console.log('[Free Bhog] Sending confirmation email to:', userInfo.email);
          await this.emailService.sendBhogConfirmationEmail({
            to: userInfo.email,
            customerName: userInfo.name,
            customerPhone: userInfo.phone,
            isFree: true,
            totalAmount: 0,
            bookings: dayBookings.map((b) => ({
              day: b.day,
              date: this.getBhogDate(b.day),
              bhogTiming: this.getBhogTiming(b.day),
              quantity: b.quantity,
              categories: b.categories.map((c: any) => ({
                title: c.title || c.id || 'Bhog',
                quantity: Number(c.quantity),
              })),
            })),
            orderId: orderId,
            transactionId: transactionId,
            paymentStatus: 'success',
          });

          savedPayment.emailNotificationSent = true;
          savedPayment.emailNotificationSentAt = new Date();
          await savedPayment.save();
          console.log('[Free Bhog] Confirmation email sent successfully');
        } catch (emailError) {
          console.error('[Free Bhog] Failed to send confirmation email to:', userInfo.email);
        }
      }

      // Send WhatsApp confirmation for free Bhog booking
      await this.sendBhogWhatsAppConfirmation(savedPayment);

      res.status(200).json({
        success: true,
        message: 'Free bhog booking recorded successfully',
        data: {
          orderId,
          transactionId,
          totalAmount: 0,
          totalCount,
          fromBhog: true,
          receiptPath,
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
      const { timestamp, isFree, userInfo, orderId, transactionId } = req.body;
      const merchantTxnNo = typeof transactionId === 'string'
        ? sanitizeMerchantTxnNo(transactionId)
        : '';

      const { dayBookings, flatCategories, totalAmount, totalCount } = this.normalizeBhogPayload(req.body);

      // Validate required fields
      if (dayBookings.length === 0 || totalCount === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. At least one bhog selection is required.'
        });
        return;
      }

      // Check booking cutoff for each day in the cart
      for (const booking of dayBookings) {
        if (isBhogBookingClosedByTitle(booking.day)) {
          res.status(409).json({
            success: false,
            error: getCutoffErrorMessageByTitle(booking.day)
          });
          return;
        }
      }

      // Validate payment info for paid bookings
      if (isFree === false && (!orderId || !merchantTxnNo)) {
        res.status(400).json({
          success: false,
          error: 'Order ID and Transaction ID are required for paid bookings.'
        });
        return;
      }

      // Primary day title for ICICI PG metadata
      const primaryDayTitle = dayBookings.length === 1
        ? dayBookings[0].day
        : `Unified Bhog (${dayBookings.map(b => b.day.replace(' Bhog', '')).join(', ')})`;

      // Step 1: Save to MongoDB with paymentStatus='pending'
      try {
        await this.bhogRepository.createPayment({
          orderId: orderId || '',
          transactionId: merchantTxnNo,
          timestamp: timestamp || new Date().toISOString(),
          userInfo: userInfo || { name: '', phone: '', email: '' },
          bookings: dayBookings,
          categories: flatCategories,
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
          addlParam2: primaryDayTitle,
        };

        const iciciResponse = await iciciPGService.initiateSale(initiateSalePayload);

        // Step 3: Build payment URL and return to frontend
        const paymentUrl = `${iciciResponse.redirectURI}?tranCtx=${encodeURIComponent(iciciResponse.tranCtx || '')}`;

        res.status(200).json({
          success: true,
          message: 'Paid bhog booking initiated successfully',
          data: {
            title: primaryDayTitle,
            bookings: dayBookings,
            categories: flatCategories,
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
        console.error('ICICI initiateSale failed for bhog booking:', iciciError);
        
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

  /**
   * Get Bhog timing based on day title
   */
  private getBhogTiming(dayTitle: string): string {
    const titleLower = dayTitle.toLowerCase();
    
    if (titleLower.includes('sandhi puja') || titleLower.includes('sandhi pujo') || titleLower.includes('sandhi')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('panchami')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('saptami')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('ashtami')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('navami')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('durga puja')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('lakshmi puja')) return '12:30 PM - 2:30 PM';
    if (titleLower.includes('saraswati puja')) return '12:30 PM - 2:30 PM';
    
    return '12:30 PM - 2:30 PM';
  }

  /**
   * Get Bhog date based on day title
   */
  private getBhogDate(dayTitle: string): string {
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
   * Send WhatsApp confirmation for free Bhog booking
   * Idempotent: checks if notification already sent before sending
   * Fire and forget: errors are logged but don't affect booking status
   */
  private async sendBhogWhatsAppConfirmation(payment: any): Promise<void> {
    try {
      // Idempotency check: don't send if already sent
      if (payment.whatsappNotificationSent) {
        console.log(`[WhatsApp] Notification already sent for Bhog payment ${payment.transactionId}, skipping`);
        return;
      }

      // Prepare WhatsApp template parameters
      const params = {
        customerName: payment.userInfo?.name || '',
        bookingDetails: formatBhogBookingDetails(payment.bookings || []),
        whatsappNumber: payment.userInfo?.phone || '',
      };

      // Send WhatsApp message
      await whatsAppService.sendBhogBookingConfirmation(params);

      // Mark notification as sent
      payment.whatsappNotificationSent = true;
      payment.whatsappNotificationSentAt = new Date();
      payment.whatsappNotificationError = undefined;
      await payment.save();

      console.log(`[WhatsApp] Bhog confirmation sent successfully for ${payment.transactionId}`);
    } catch (error: any) {
      // Log error but don't throw - booking success is independent of WhatsApp
      console.error(`[WhatsApp] Failed to send Bhog confirmation for ${payment.transactionId}:`, error.message);
      
      // Store error in payment document
      try {
        payment.whatsappNotificationSent = false;
        payment.whatsappNotificationError = error.message;
        await payment.save();
      } catch (saveError: any) {
        console.error('[WhatsApp] Failed to save notification error:', saveError.message);
      }
    }
  }
}
