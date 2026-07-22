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

      console.log('ICICI Callback Received:', {
        merchantTxnNo: body.merchantTxnNo,
        responseCode: body.responseCode,
        amount: body.amount,
        paymentMode: body.paymentMode,
      });

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
      // Note: ICICI may not return addlParam1 in callback, so we need to look up the payment
      const anudanPayment = await this.anudanRepository.getPaymentByTransactionId(body.merchantTxnNo);
      const bhogPayment = await this.bhogRepository.getPaymentByTransactionId(body.merchantTxnNo);

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
      // Idempotency check - if already processed, just redirect
      if (payment.paymentStatus === 'success') {
        console.log('Anudan payment already processed, redirecting to success:', payment.transactionId);
        return res.redirect(`${this.FRONTEND_URL}/payment/success?transactionId=${payment.transactionId}`);
      }

      if (isSuccess) {
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

        // Log to Google Sheets (non-critical)
        await this.logAnudanToSheets(payment);

        console.log('Anudan payment successful:', payment.transactionId);
        return res.redirect(`${this.FRONTEND_URL}/payment/success?transactionId=${payment.transactionId}`);
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
      // Idempotency check - if already processed, just redirect
      if (payment.paymentStatus === 'success') {
        console.log('Bhog payment already processed, redirecting to success:', payment.transactionId);
        return res.redirect(`${this.FRONTEND_URL}/payment/success?transactionId=${payment.transactionId}`);
      }

      if (isSuccess) {
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
        return res.redirect(`${this.FRONTEND_URL}/payment/success?transactionId=${payment.transactionId}`);
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

      const headers = [
        'Timestamp',
        'Order ID',
        'Transaction ID',
        'Customer Name',
        'Mobile Number',
        'Email',
        'Category',
        'Amount (₹)',
        'Remark',
      ];
      await this.sheetsService.createSheetIfNotExists('Anudan Contributions', headers);

      // Add each category as a separate row
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
          category.remark || ''
        ];
        return this.sheetsService.appendRow('Anudan Contributions', rowData);
      });
      await Promise.all(rowPromises);
    } catch (sheetsError) {
      console.error('Failed to log Anudan to Google Sheets (non-critical):', sheetsError);
    }
  }

  /**
   * Log Bhog payment to Google Sheets
   */
  private async logBhogToSheets(payment: any): Promise<void> {
    try {
      await this.sheetsService.initialize();

      const booking = payment.bookings[0];
      const sheetName = this.getSheetNameFromTitle(booking.day);

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
        'Total Amount Paid (₹)',
        'Payment Status'
      ];
      await this.sheetsService.createSheetIfNotExists(sheetName, headers);

      // Extract quantities from booking (simplified - need to parse from booking data)
      const rowData = [
        payment.timestamp,
        payment.orderId,
        payment.transactionId,
        payment.userInfo.name,
        payment.userInfo.phone,
        payment.userInfo.email,
        booking.quantity || 0, // Adult plates (simplified)
        0, // Children 0-5
        0, // Children 5+
        0, // Senior
        booking.quantity || 0, // Total
        payment.totalAmount,
        'Paid'
      ];
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

      let totalAmount = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === 'TOTAL') continue;
        totalAmount += parseFloat(data[i][11]) || 0;
      }

      const lastRow = data[data.length - 1];
      if (lastRow && lastRow[0] === 'TOTAL') {
        await this.sheetsService.updateRow(sheetName, data.length, [
          'TOTAL', '', '', '', '', '', '', '', '', '', '', totalAmount, ''
        ]);
      } else {
        await this.sheetsService.appendRow(sheetName, [
          'TOTAL', '', '', '', '', '', '', '', '', '', '', totalAmount, ''
        ]);
      }
    } catch (error) {
      console.error(`Failed to update summary for sheet ${sheetName}:`, error);
    }
  }
}
