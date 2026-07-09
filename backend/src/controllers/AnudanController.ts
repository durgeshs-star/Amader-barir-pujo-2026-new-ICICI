import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/GoogleSheetsService';

export class AnudanController {
  private sheetsService: GoogleSheetsService;
  private readonly SHEET_NAME = 'Anudan Contributions';

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
  }

  /**
   * Handle paid anudan booking
   */
  async handlePaidAnudan(req: Request, res: Response): Promise<void> {
    try {
      const { day, amount, remark, userInfo, orderId, transactionId, timestamp } = req.body;

      // Validate required fields
      if (!day || !amount || !userInfo || !orderId || !transactionId) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Missing required fields.'
        });
        return;
      }

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
      await this.sheetsService.createSheetIfNotExists(this.SHEET_NAME, headers);

      const rowData = [
        timestamp || new Date().toISOString(),
        orderId,
        transactionId,
        userInfo.name || '',
        userInfo.phone || '',
        userInfo.email || '',
        day,
        amount,
        remark || ''
      ];
      await this.sheetsService.appendRow(this.SHEET_NAME, rowData);

      // We don't necessarily need a strict summary at the bottom like Bhog, 
      // but let's keep it simple for now, we just fetch status dynamically.

      res.status(200).json({
        success: true,
        message: 'Anudan contribution recorded successfully',
        data: {
          day,
          amount,
          timestamp,
          userInfo,
          orderId,
          transactionId
        }
      });
    } catch (error: any) {
      console.error('Error handling anudan payment:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to record anudan payment'
      });
    }
  }

  /**
   * Get collected amount for all Anudan categories
   */
  async getAnudanStatus(req: Request, res: Response): Promise<void> {
    try {
      await this.sheetsService.initialize();

      // Ensure sheet exists before reading to prevent errors if empty
      const headers = [
        'Timestamp', 'Order ID', 'Transaction ID', 'Customer Name', 
        'Mobile Number', 'Email', 'Category', 'Amount (₹)', 'Remark'
      ];
      await this.sheetsService.createSheetIfNotExists(this.SHEET_NAME, headers);

      const data = await this.sheetsService.getSheetData(this.SHEET_NAME);
      
      const collectedAmountPerCategory: Record<string, number> = {};

      if (data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const category = row[6]; // Category (Day)
          const amount = parseFloat(row[7]) || 0; // Amount
          
          if (category && amount > 0) {
            collectedAmountPerCategory[category] = (collectedAmountPerCategory[category] || 0) + amount;
          }
        }
      }

      res.status(200).json({
        success: true,
        data: collectedAmountPerCategory
      });
    } catch (error: any) {
      console.error('Error fetching anudan status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch anudan status'
      });
    }
  }
}
