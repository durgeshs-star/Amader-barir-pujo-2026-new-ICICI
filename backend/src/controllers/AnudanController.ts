import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AnudanRepository } from '../repositories/AnudanRepository';
import { anudanPaymentService } from '../services/anudanPayment.service';
import { anudanStateService } from '../services/anudanState.service';
import { errorResponse } from '../utils/response.util';
import { iciciPGService, InitiateSalePayload } from '../services/iciciPG.service';
import { sanitizeMerchantTxnNo } from '../services/iciciHash.service';

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
   * Modified for ICICI PG integration - initiates payment and returns redirect URL
   */
  handlePaidAnudan = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('=== Anudan Paid Booking Request Received ===');
      const { categories, userInfo, orderId, transactionId, timestamp } = req.body;
      const merchantTxnNo = typeof transactionId === 'string'
        ? sanitizeMerchantTxnNo(transactionId)
        : '';
      console.log('Request body:', { categories, userInfo, orderId, transactionId, timestamp });

      // Validate required fields
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Missing categories array.'
        });
        return;
      }

      if (!userInfo || !orderId || !merchantTxnNo) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking data. Missing required fields.'
        });
        return;
      }

      const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);
      console.log('Total amount:', totalAmount);

      // Step 1: Reserve amounts from in-memory state (mutex-protected)
      console.log('Step 1: Reserving amounts from in-memory state');
      const reservations = [];
      for (const category of categories) {
        const campaignId = category.day;
        const amount = category.amount;

        console.log(`Reserving ₹${amount} for ${campaignId}`);
        const reserveResult = await anudanStateService.tryReserve(campaignId, amount);

        if (!reserveResult.ok) {
          // Reservation failed - rollback all previous reservations
          console.log(`Insufficient remaining amount for ${campaignId}: requested ₹${amount}, remaining ₹${reserveResult.remaining}`);
          
          for (const prevReservation of reservations) {
            await anudanStateService.rollback(prevReservation.campaignId, prevReservation.amount);
          }
          
          res.status(400).json({
            success: false,
            errorCode: 'INSUFFICIENT_REMAINING_AMOUNT',
            remainingAmount: reserveResult.remaining,
            requestedAmount: amount,
            message: `Insufficient remaining amount for ${campaignId}`
          });
          return;
        }

        reservations.push({
          campaignId,
          amount,
          remaining: reserveResult.remaining
        });
      }

      // Step 2: Save to MongoDB with paymentStatus='pending'
      console.log('Step 2: Saving to MongoDB with paymentStatus=pending');
      try {
        console.log('Saving payment to MongoDB with ICICI merchantTxnNo:', merchantTxnNo);
        const savedPayment = await this.anudanRepository.createPayment({
          orderId,
          transactionId: merchantTxnNo,
          timestamp: timestamp || new Date().toISOString(),
          userInfo,
          categories,
          totalAmount,
          paymentStatus: 'pending'
        });
        console.log('Payment saved successfully with _id:', savedPayment._id);
      } catch (dbError) {
        // DB save failed - rollback all reservations
        console.error('DB save failed, rolling back all reservations:', dbError);
        for (const reservation of reservations) {
          await anudanStateService.rollback(reservation.campaignId, reservation.amount);
        }
        res.status(500).json({
          success: false,
          error: 'Failed to save payment record'
        });
        return;
      }

      // Step 3: Call ICICI initiateSale API
      try {
        const initiateSalePayload: InitiateSalePayload = {
          merchantTxnNo,
          amount: totalAmount,
          customerEmailID: userInfo.email,
          customerName: userInfo.name,
          customerMobileNo: userInfo.phone,
          invoiceNo: orderId,
          addlParam1: 'anudan',
          addlParam2: categories[0]?.day || '', // First category for reference
        };

        const iciciResponse = await iciciPGService.initiateSale(initiateSalePayload);

        // Step 4: Build payment URL and return to frontend
        const paymentUrl = `${iciciResponse.redirectURI}?tranCtx=${encodeURIComponent(iciciResponse.tranCtx || '')}`;

        res.status(200).json({
          success: true,
          data: {
            orderId,
            transactionId: merchantTxnNo,
            categories: reservations.map(r => ({
              campaignId: r.campaignId,
              amount: r.amount,
              remaining: r.remaining,
              status: 'pending',
            })),
            totalAmount,
            timestamp: timestamp || new Date().toISOString(),
            userInfo,
          },
          paymentUrl,
        });
      } catch (iciciError: any) {
        // ICICI API failed - rollback reservations and mark payment as failed
        console.error('ICICI initiateSale failed, rolling back reservations:', iciciError);
        
        for (const reservation of reservations) {
          await anudanStateService.rollback(reservation.campaignId, reservation.amount);
        }

        // Update MongoDB payment status to failed
        try {
          const payment = await this.anudanRepository.getPaymentByTransactionId(merchantTxnNo);
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
      const isReady = anudanStateService.isReady();
      const result = anudanPaymentService.getAllRemaining();

      // Add initialization status to response
      res.status(200).json({
        ...result,
        isReady
      });
    } catch (error: any) {
      console.error('Error fetching remaining amounts:', error);
      res.status(500).json(errorResponse('Failed to fetch remaining amounts'));
    }
  };

  /**
   * Get payment details by transactionId
   * GET /api/anudan/payment/:transactionId
   */
  getPaymentByTransactionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionId } = req.params;
      console.log('Fetching payment for transactionId:', transactionId);

      if (!transactionId) {
        res.status(400).json({
          success: false,
          error: 'transactionId is required'
        });
        return;
      }

      const payment = await this.anudanRepository.getPaymentByTransactionId(transactionId);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment'
      });
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

