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

export class IciciPaymentController {
  private anudanRepository: AnudanRepository;
  private bhogRepository: BhogRepository;
  private sheetsService: GoogleSheetsService;
  private readonly FRONTEND_URL: string;

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

        // DEBUG: Log all amount calculations before saving
        console.log('=== ANUDAN PAYMENT AMOUNT DEBUG ===');
        console.log('baseAmount:', baseAmount);
        console.log('actualAmountCharged from ICICI:', actualAmountCharged);
        console.log('convenienceFee:', convenienceFee);
        console.log('serviceTax:', serviceTax);
        console.log('othCharge:', othCharge);
        console.log('computed finalTotalAmount:', finalTotalAmount);
        console.log('gatewayCharges (finalTotal - base):', gatewayCharges);
        console.log('Manual sum (base + fees):', baseAmount + convenienceFee + serviceTax + othCharge);
        console.log('payment.totalAmount being saved:', payment.totalAmount);
        console.log('==================================');

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

        // DEBUG: Log what was actually saved to MongoDB
        console.log('=== AFTER SAVE TO MONGODB ===');
        console.log('payment._id:', payment._id);
        console.log('payment.totalAmount after save:', payment.totalAmount);
        console.log('payment.actualAmountCharged after save:', payment.actualAmountCharged);
        console.log('============================');

        // Broadcast SSE updates for each category
        for (const category of payment.categories) {
          const campaignId = category.day;
          const remaining = anudanStateService.getRemaining(campaignId);
          anudanStateService.broadcast(campaignId, remaining);
          console.log(`SSE broadcast for ${campaignId}: remaining ₹${remaining}`);
        }

        // Log to Google Sheets (non-critical) — logs base amount, gateway charges, and total paid amount
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

        // DEBUG: Log all amount calculations before saving
        console.log('=== BHOG PAYMENT AMOUNT DEBUG ===');
        console.log('baseAmount:', baseAmount);
        console.log('actualAmountCharged from ICICI:', actualAmountCharged);
        console.log('convenienceFee:', convenienceFee);
        console.log('serviceTax:', serviceTax);
        console.log('othCharge:', othCharge);
        console.log('computed finalTotalAmount:', finalTotalAmount);
        console.log('gatewayCharges (finalTotal - base):', gatewayCharges);
        console.log('Manual sum (base + fees):', baseAmount + convenienceFee + serviceTax + othCharge);
        console.log('payment.totalAmount being saved:', payment.totalAmount);
        console.log('================================');

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

        // DEBUG: Log what was actually saved to MongoDB
        console.log('=== AFTER SAVE TO MONGODB ===');
        console.log('payment._id:', payment._id);
        console.log('payment.totalAmount after save:', payment.totalAmount);
        console.log('payment.actualAmountCharged after save:', payment.actualAmountCharged);
        console.log('============================');

        // Log to Google Sheets (non-critical) — logs base amount, gateway charges, and total paid amount
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

  /**
   * Log Anudan payment to Google Sheets
   */
  private async logAnudanToSheets(payment: any): Promise<void> {
    try {
      await this.sheetsService.initialize();

      // Determine if we need fee breakdown columns
      const hasConvenienceFee = (payment.convenienceFee || 0) > 0;
      const hasServiceTax = (payment.serviceTax || 0) > 0;
      const hasOthCharge = (payment.othCharge || 0) > 0;
      const hasFeeBreakdown = hasConvenienceFee || hasServiceTax || hasOthCharge;

      const headers = [
        'Timestamp',
        'Order ID',
        'Transaction ID',
        'Customer Name',
        'Mobile Number',
        'Email',
        'Category',
        'Base Amount (₹)',
        ...(hasFeeBreakdown ? [
          'Convenience Fee (₹)',
          'Service Tax (₹)',
          'Other Charges (₹)',
        ] : []),
        'Gateway Charges / Tax (₹)',
        'Actual Amount Paid (₹)',
        'Remark',
      ];
      await this.sheetsService.createSheetIfNotExists('Anudan Contributions', headers);

      // Add each category as a separate row
      // - Row 0: includes all fees and the actual ICICI-charged total
      // - Subsequent rows: shows only the category's base amount; fee columns are 0 to avoid double-counting
      const rowPromises = payment.categories.map((category: any, index: number) => {
        const rowData = [
          payment.timestamp,
          payment.orderId,
          payment.transactionId,
          index === 0 ? payment.userInfo.name || '' : '',
          index === 0 ? payment.userInfo.phone || '' : '',
          index === 0 ? payment.userInfo.email || '' : '',
          category.day,
          category.amount,
          ...(hasFeeBreakdown ? [
            index === 0 ? payment.convenienceFee || 0 : 0,
            index === 0 ? payment.serviceTax || 0 : 0,
            index === 0 ? payment.othCharge || 0 : 0,
          ] : []),
          index === 0 ? payment.gatewayCharges || 0 : 0,
          index === 0 ? payment.actualAmountCharged || payment.totalAmount : 0,
          category.remark || ''
        ];

        // DEBUG: Log what's being written to Google Sheets for Anudan
        if (index === 0) {
          console.log('=== GOOGLE SHEETS ANUDAN LOGGING DEBUG ===');
          console.log('payment.baseAmount:', payment.baseAmount);
          console.log('payment.gatewayCharges:', payment.gatewayCharges);
          console.log('payment.totalAmount:', payment.totalAmount);
          console.log('payment.actualAmountCharged:', payment.actualAmountCharged);
          console.log('actualAmountCharged || totalAmount result:', payment.actualAmountCharged || payment.totalAmount);
          console.log('Row data being written:', rowData);
          console.log('==========================================');
        }

        return this.sheetsService.appendRow('Anudan Contributions', rowData);
      });
      await Promise.all(rowPromises);
    } catch (sheetsError) {
      console.error('Failed to log Anudan to Google Sheets (non-critical):', sheetsError);
    }
  }

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

      // Determine if we need fee breakdown columns
      const hasConvenienceFee = (payment.convenienceFee || 0) > 0;
      const hasServiceTax = (payment.serviceTax || 0) > 0;
      const hasOthCharge = (payment.othCharge || 0) > 0;
      const hasFeeBreakdown = hasConvenienceFee || hasServiceTax || hasOthCharge;

      const headers = [
        'Timestamp',
        'Order ID',
        'Transaction ID',
        'Customer Name',
        'Mobile Number',
        'Email',
        'Adult Plates',
        'Children 0-5 Plates',
        'Children 5+ Plates',
        'Senior Citizen Plates',
        'Total Plates',
        'Base Amount (₹)',
        ...(hasFeeBreakdown ? [
          'Convenience Fee (₹)',
          'Service Tax (₹)',
          'Other Charges (₹)',
        ] : []),
        'Gateway Charges / Tax (₹)',
        'Actual Amount Paid (₹)',
        'Payment Status'
      ];
      await this.sheetsService.createSheetIfNotExists(sheetName, headers);

      const quantities = this.extractBhogQuantities(payment.categories || []);
      const totalPlates = booking.quantity || (quantities.adult + quantities.children05 + quantities.children5Plus + quantities.seniorCitizen);

      const rowData = [
        payment.timestamp,
        payment.orderId,
        payment.transactionId,
        payment.userInfo.name,
        payment.userInfo.phone,
        payment.userInfo.email,
        quantities.adult,
        quantities.children05,
        quantities.children5Plus,
        quantities.seniorCitizen,
        totalPlates,
        payment.baseAmount || (payment.totalAmount - (payment.gatewayCharges || 0)),
        ...(hasFeeBreakdown ? [
          payment.convenienceFee || 0,
          payment.serviceTax || 0,
          payment.othCharge || 0,
        ] : []),
        payment.gatewayCharges || 0,
        payment.actualAmountCharged || payment.totalAmount,
        'Paid'
      ];

      // DEBUG: Log what's being written to Google Sheets
      console.log('=== GOOGLE SHEETS BHOG LOGGING DEBUG ===');
      console.log('payment.baseAmount:', payment.baseAmount);
      console.log('payment.gatewayCharges:', payment.gatewayCharges);
      console.log('payment.totalAmount:', payment.totalAmount);
      console.log('payment.actualAmountCharged:', payment.actualAmountCharged);
      console.log('actualAmountCharged || totalAmount result:', payment.actualAmountCharged || payment.totalAmount);
      console.log('Row data being written:', rowData);
      console.log('=======================================');

      await this.sheetsService.appendRow(sheetName, rowData);

      // Update summary
      await this.updateSheetSummary(sheetName);
    } catch (sheetsError) {
      console.error('Failed to log Bhog to Google Sheets (non-critical):', sheetsError);
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
   * Update sheet summary
   */
  private async updateSheetSummary(sheetName: string): Promise<void> {
    try {
      const data = await this.sheetsService.getSheetData(sheetName);
      
      if (data.length <= 1) return;

      let totalAdult = 0;
      let totalChildren05 = 0;
      let totalChildren5Plus = 0;
      let totalSenior = 0;
      let totalPlates = 0;
      let totalBaseAmount = 0;
      let totalConvenienceFee = 0;
      let totalServiceTax = 0;
      let totalOthCharge = 0;
      let totalGatewayCharges = 0;
      let totalActualAmount = 0;

      // Check if first data row has fee columns (detect by header count)
      const headers = data[0] || [];
      const hasFeeColumns = headers.includes('Convenience Fee (₹)');
      const baseAmountIndex = headers.indexOf('Base Amount (₹)');
      const convFeeIndex = hasFeeColumns ? headers.indexOf('Convenience Fee (₹)') : -1;
      const serviceTaxIndex = hasFeeColumns ? headers.indexOf('Service Tax (₹)') : -1;
      const othChargeIndex = hasFeeColumns ? headers.indexOf('Other Charges (₹)') : -1;
      const gatewayIndex = headers.indexOf('Gateway Charges / Tax (₹)');
      const actualAmountIndex = headers.indexOf('Actual Amount Paid (₹)');

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === 'TOTAL') continue;
        
        totalAdult += parseInt(row[6]) || 0;
        totalChildren05 += parseInt(row[7]) || 0;
        totalChildren5Plus += parseInt(row[8]) || 0;
        totalSenior += parseInt(row[9]) || 0;
        totalPlates += parseInt(row[10]) || 0;
        
        if (baseAmountIndex >= 0) totalBaseAmount += parseFloat(row[baseAmountIndex]) || 0;
        if (convFeeIndex >= 0) totalConvenienceFee += parseFloat(row[convFeeIndex]) || 0;
        if (serviceTaxIndex >= 0) totalServiceTax += parseFloat(row[serviceTaxIndex]) || 0;
        if (othChargeIndex >= 0) totalOthCharge += parseFloat(row[othChargeIndex]) || 0;
        if (gatewayIndex >= 0) totalGatewayCharges += parseFloat(row[gatewayIndex]) || 0;
        if (actualAmountIndex >= 0) totalActualAmount += parseFloat(row[actualAmountIndex]) || 0;
      }

      const summaryData = [
        'TOTAL', '', '', '', '', '',
        totalAdult, totalChildren05, totalChildren5Plus, totalSenior, totalPlates,
        totalBaseAmount,
        ...(hasFeeColumns ? [totalConvenienceFee, totalServiceTax, totalOthCharge] : []),
        totalGatewayCharges,
        totalActualAmount,
        ''
      ];

      const lastRow = data[data.length - 1];
      if (lastRow && lastRow[0] === 'TOTAL') {
        await this.sheetsService.updateRow(sheetName, data.length, summaryData);
      } else {
        await this.sheetsService.appendRow(sheetName, summaryData);
      }
    } catch (error) {
      console.error(`Failed to update summary for sheet ${sheetName}:`, error);
    }
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
