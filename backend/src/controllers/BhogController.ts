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

export class BhogController {
  private sheetsService: GoogleSheetsService;
  private bhogRepository: BhogRepository;

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
    this.bhogRepository = new BhogRepository();
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

  /**
   * Handle free bhog booking (children aged 0-5 only)
   * Records the booking in Google Sheets without payment
   */
  async handleFreeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { title, categories, totalAmount, totalCount, timestamp, isFree, userInfo } = req.body;

      // Validate required fields
      if (!title || !categories || !Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Title and categories are required.'
        });
        return;
      }

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

      // Extract bhog quantities with defaults
      const quantities = this.extractBhogQuantities(categories);

      // Append booking data to sheet (empty Order ID and Transaction ID for free bookings)
      const rowData = [
        timestamp || new Date().toISOString(),
        '', // Order ID (empty for free bookings)
        '', // Transaction ID (empty for free bookings)
        userInfo?.name || '',
        userInfo?.phone || '',
        userInfo?.email || '',
        quantities.adult,
        quantities.children05,
        quantities.children5Plus,
        quantities.seniorCitizen,
        totalCount,
        totalAmount,
        isFree ? 'Free' : 'Paid'
      ];
      await this.sheetsService.appendRow(sheetName, rowData);

      // Store booking in MongoDB
      await this.bhogRepository.createPayment({
        orderId: '',
        transactionId: '',
        timestamp: timestamp || new Date().toISOString(),
        userInfo: userInfo || { name: '', phone: '', email: '' },
        bookings: [{
          day: title,
          amount: totalAmount,
          quantity: totalCount,
          remark: 'Free booking'
        }],
        totalAmount
      });

      // Update summary calculations at the end of the sheet
      await this.updateSheetSummary(sheetName);

      res.status(200).json({
        success: true,
        message: 'Free bhog booking recorded successfully',
        data: {
          title,
          categories,
          totalAmount,
          totalCount,
          timestamp,
          userInfo
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
      const { title, categories, totalAmount, totalCount, timestamp, isFree, userInfo, orderId, transactionId } = req.body;
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
   * Update summary calculations at the end of the sheet
   */
  private async updateSheetSummary(sheetName: string): Promise<void> {
    try {
      const data = await this.sheetsService.getSheetData(sheetName);
      
      if (data.length <= 1) return; // Only header row, no data to summarize

      // Skip header row (index 0) and calculate totals
      let totalAdult = 0;
      let totalChildren05 = 0;
      let totalChildren5Plus = 0;
      let totalSenior = 0;
      let totalPlates = 0;
      let totalAmount = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // Skip existing summary row
        if (row[0] === 'TOTAL') continue;
        
        totalAdult += parseInt(row[6]) || 0; // Adult Plates (column index 6)
        totalChildren05 += parseInt(row[7]) || 0; // Children 0-5 (column index 7)
        totalChildren5Plus += parseInt(row[8]) || 0; // Children 5+ (column index 8)
        totalSenior += parseInt(row[9]) || 0; // Senior Citizen (column index 9)
        totalPlates += parseInt(row[10]) || 0; // Total Plates (column index 10)
        totalAmount += parseFloat(row[11]) || 0; // Total Amount (column index 11)
      }

      // Check if summary row already exists (last row starts with "TOTAL")
      const lastRow = data[data.length - 1];
      if (lastRow && lastRow[0] === 'TOTAL') {
        // Update existing summary row
        const summaryRowIndex = data.length;
        await this.sheetsService.updateRow(sheetName, summaryRowIndex, [
          'TOTAL',
          '',
          '',
          '',
          '',
          '',
          '',
          totalAdult,
          totalChildren05,
          totalChildren5Plus,
          totalSenior,
          totalPlates,
          totalAmount,
          ''
        ]);
      } else {
        // Add new summary row
        await this.sheetsService.appendRow(sheetName, [
          'TOTAL',
          '',
          '',
          '',
          '',
          '',
          '',
          totalAdult,
          totalChildren05,
          totalChildren5Plus,
          totalSenior,
          totalPlates,
          totalAmount,
          ''
        ]);
      }
    } catch (error) {
      console.error(`Failed to update summary for sheet ${sheetName}:`, error);
      // Don't throw error - summary update is not critical
    }
  }
}
