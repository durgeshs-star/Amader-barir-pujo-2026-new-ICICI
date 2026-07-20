import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AnudanRepository } from '../repositories/AnudanRepository';
import { anudanPaymentService } from '../services/anudanPayment.service';
import { anudanStateService } from '../services/anudanState.service';
import { successResponse, errorResponse } from '../utils/response.util';

// Define total costs for each Anudan category (same as frontend data)
const ANUDAN_TOTAL_COSTS: Record<string, number> = {
  'Panchami': 15000,
  'Shashti': 25000,
  'Saptami': 30000,
  'Ashtami': 40000,
  'Ashtami Sandhi Puja': 50000,
  'Navami': 35000,
  'Dashami': 20000,
};

export class AnudanController {
  private sheetsService: GoogleSheetsService;
  private anudanRepository: AnudanRepository;
  private readonly SHEET_NAME = 'Anudan Contributions';

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
    this.anudanRepository = new AnudanRepository();
  }

  /**
   * Handle paid anudan booking (single or multiple categories)
   */
  handlePaidAnudan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categories, userInfo, orderId, transactionId, timestamp } = req.body;

      // Validate required fields
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Missing categories array.'
        });
        return;
      }

      if (!userInfo || !orderId || !transactionId) {
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

      // Add each category as a separate row, but only show payer info once
      const rowPromises = categories.map((category, index) => {
        const rowData = [
          timestamp || new Date().toISOString(),
          orderId,
          transactionId,
          index === 0 ? userInfo.name || '' : '', // Only show name on first row
          index === 0 ? userInfo.phone || '' : '', // Only show phone on first row
          index === 0 ? userInfo.email || '' : '', // Only show email on first row
          category.day,
          category.amount,
          category.remark || ''
        ];
        return this.sheetsService.appendRow(this.SHEET_NAME, rowData);
      });
      await Promise.all(rowPromises);

      const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

      // Store payment in MongoDB
      await this.anudanRepository.createPayment({
        orderId,
        transactionId,
        timestamp: timestamp || new Date().toISOString(),
        userInfo,
        categories: categories.map(cat => {
          let parsedItems = [];
          if (Array.isArray(cat.items)) {
            // Check if the array contains a single stringified JSON
            if (cat.items.length > 0 && typeof cat.items[0] === 'string' && cat.items[0].startsWith('[')) {
              try {
                parsedItems = JSON.parse(cat.items[0]);
              } catch (e) {
                console.error("Failed to parse items array string", cat.items[0]);
              }
            } else {
              parsedItems = cat.items;
            }
          } else if (typeof cat.items === 'string') {
            try {
              parsedItems = JSON.parse(cat.items);
            } catch (e) {
              console.error("Failed to parse items string", cat.items);
            }
          }
          
          return {
            day: cat.day,
            amount: cat.amount,
            items: parsedItems,
            remark: cat.remark || ''
          };
        }),
        totalAmount
      });

      res.status(200).json({
        success: true,
        message: 'Anudan contribution recorded successfully',
        data: {
          categories,
          totalAmount,
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
  };

  /**
   * Get collected amount for all Anudan categories (from MongoDB)
   */
  getAnudanStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const collectedAmounts = await this.anudanRepository.getCollectedAmountsByCategory();
      
      res.status(200).json({
        success: true,
        data: collectedAmounts
      });
    } catch (error: any) {
      console.error('Error fetching anudan status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch anudan status'
      });
    }
  };

  /**
   * Get real-time remaining amounts for each Anudan category (from in-memory state only)
   * This endpoint never queries MongoDB - it only reads the in-memory value
   */
  getRemainingAmounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = anudanPaymentService.getAllRemaining();
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching remaining amounts:', error);
      res.status(500).json(errorResponse('Failed to fetch remaining amounts'));
    }
  };

  /**
   * Get remaining amount for a specific campaign (from in-memory state only)
   */
  getRemaining = async (req: Request, res: Response): Promise<void> => {
    try {
      const { campaignId } = req.query;
      if (!campaignId || typeof campaignId !== 'string') {
        res.status(400).json(errorResponse('campaignId is required'));
        return;
      }

      const result = anudanPaymentService.getRemaining(campaignId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching remaining amount:', error);
      res.status(500).json(errorResponse('Failed to fetch remaining amount'));
    }
  };

  /**
   * SSE endpoint for real-time remaining amount updates
   * Sends event: remaining-update with { remainingAmount } on every change
   * Sends heartbeat comment every 25 seconds to keep connection alive
   */
  getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { campaignId } = req.query;
      if (!campaignId || typeof campaignId !== 'string') {
        res.status(400).json(errorResponse('campaignId is required'));
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      // Generate unique subscriber ID
      const subscriberId = `${campaignId}-${Date.now()}-${Math.random()}`;

      // Add subscriber to state service
      anudanStateService.addSubscriber(campaignId, subscriberId, res);

      // Handle client disconnect
      req.on('close', () => {
        anudanStateService.removeSubscriber(campaignId, subscriberId);
        console.log(`SSE client disconnected: ${subscriberId}`);
      });

      req.on('end', () => {
        anudanStateService.removeSubscriber(campaignId, subscriberId);
        console.log(`SSE client ended: ${subscriberId}`);
      });
    } catch (error: any) {
      console.error('Error setting up SSE:', error);
      res.status(500).json(errorResponse('Failed to set up SSE'));
    }
  };
}
