/**
 * Payment Routes
 * 
 * Defines all payment-related API routes with validation middleware.
 * Routes are organized by resource and follow RESTful conventions.
 */

import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { IPaymentRepository } from '../repositories/PaymentRepository';
import {
  validateCreateOrder,
  validatePaymentCallback,
  validateTransactionStatus,
  validateRefund,
  validatePaymentHistory,
} from '../middleware/paymentValidator';
import { paymentConfig } from '../config/payment.config';
import rateLimit from 'express-rate-limit';

/**
 * Create payment routes
 * 
 * @param paymentRepository - Payment repository instance
 * @returns Express router with payment routes
 */
export const createPaymentRoutes = (paymentRepository: IPaymentRepository): Router => {
  const router = Router();
  const paymentController = new PaymentController(paymentRepository);

  // Payment-specific rate limiting (stricter than general API)
  const paymentRateLimiter = rateLimit({
    windowMs: paymentConfig.rateLimitWindowMs,
    max: paymentConfig.rateLimitMaxRequests,
    message: 'Too many payment requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * POST /api/payment/create-order
   * Create a new payment order
   */
  router.post(
    '/create-order',
    paymentRateLimiter,
    validateCreateOrder,
    paymentController.createOrder
  );

  /**
   * POST /api/payment/callback
   * Process payment callback from gateway
   * Note: This endpoint should not be rate-limited as it's called by the gateway
   */
  router.post(
    '/callback',
    validatePaymentCallback,
    paymentController.processCallback
  );

  /**
   * POST /api/payment/webhook
   * Handle payment webhook from gateway
   * Note: This endpoint should not be rate-limited as it's called by the gateway
   * TODO: Add signature verification middleware when ICICI integration is implemented
   */
  router.post(
    '/webhook',
    validatePaymentCallback,
    paymentController.handleWebhook
  );

  /**
   * GET /api/payment/status/:transactionId
   * Get payment status by transaction ID
   */
  router.get(
    '/status/:transactionId',
    validateTransactionStatus,
    paymentController.getTransactionStatus
  );

  /**
   * POST /api/payment/refund
   * Process refund
   */
  router.post(
    '/refund',
    paymentRateLimiter,
    validateRefund,
    paymentController.processRefund
  );

  /**
   * GET /api/payment/history
   * Get payment history for a customer
   */
  router.get(
    '/history',
    validatePaymentHistory,
    paymentController.getPaymentHistory
  );

  return router;
};
