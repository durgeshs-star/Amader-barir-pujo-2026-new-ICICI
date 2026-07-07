/**
 * Bhog Controller
 * 
 * Handles bhog booking operations including free bookings for children aged 0-5
 */

import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/GoogleSheetsService';

export class BhogController {
  private sheetsService: GoogleSheetsService;
  private sheetName: string;

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
    this.sheetName = 'Free Bhog Bookings';
  }

  /**
   * Handle free bhog booking (children aged 0-5 only)
   * Records the booking in Google Sheets without payment
   */
  async handleFreeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { title, categories, totalAmount, totalCount, timestamp, isFree } = req.body;

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

      // Create sheet if it doesn't exist with headers
      const headers = [
        'Timestamp',
        'Bhog Type',
        'Category ID',
        'Category Title',
        'Quantity',
        'Price',
        'Total Amount',
        'Total Count',
        'Is Free'
      ];
      await this.sheetsService.createSheetIfNotExists(this.sheetName, headers);

      // Append booking data to sheet
      for (const category of categories) {
        const rowData = [
          timestamp || new Date().toISOString(),
          title,
          category.id,
          category.title,
          category.quantity,
          category.price,
          totalAmount,
          totalCount,
          isFree ? 'Yes' : 'No'
        ];
        await this.sheetsService.appendRow(this.sheetName, rowData);
      }

      res.status(200).json({
        success: true,
        message: 'Free bhog booking recorded successfully',
        data: {
          title,
          categories,
          totalAmount,
          totalCount,
          timestamp
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
}
