/**
 * Payment Controller
 * 
 * Handles HTTP requests and responses for payment operations.
 * Controllers are thin and delegate business logic to the service layer.
 * 
 * This controller follows the principle of Separation of Concerns:
 * - Controllers handle HTTP concerns (request parsing, response formatting)
 * - Services handle business logic
 * - Repositories handle database operations
 */

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { IPaymentRepository } from '../repositories/PaymentRepository';
import { AppError } from '../types/errors';

/**
 * Payment Controller
 */
export class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentRepository: IPaymentRepository) {
    this.paymentService = new PaymentService(paymentRepository);
  }

  /**
   * Create a new payment order
   * POST /api/payment/create-order
   */
  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId, amount, currency, metadata } = req.body;

      const result = await this.paymentService.createOrder({
        customerId,
        amount,
        currency,
        metadata,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process payment callback from gateway
   * POST /api/payment/callback
   */
  processCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const callbackData = req.body;

      const result = await this.paymentService.processCallback(callbackData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle payment webhook
   * POST /api/payment/webhook
   * 
   * Note: This is similar to callback but may have different authentication
   * and is typically called by the gateway server-to-server
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Verify webhook signature based on ICICI documentation
      // const signature = req.headers['x-signature'] as string;
      // const payload = req.body;
      // if (!this.verifyWebhookSignature(signature, payload)) {
      //   throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
      // }

      const callbackData = req.body;

      const result = await this.paymentService.processCallback(callbackData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment status
   * GET /api/payment/status/:transactionId
   */
  getTransactionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId } = req.params;

      const result = await this.paymentService.getTransactionStatus(transactionId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process refund
   * POST /api/payment/refund
   */
  processRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId, amount, reason } = req.body;

      const result = await this.paymentService.processRefund({
        transactionId,
        amount,
        reason,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment history
   * GET /api/payment/history
   */
  getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!customerId || typeof customerId !== 'string') {
        throw new AppError('Customer ID is required', 400, 'MISSING_CUSTOMER_ID');
      }

      const result = await this.paymentService.getPaymentHistory(customerId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
