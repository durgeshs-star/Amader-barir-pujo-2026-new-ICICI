/**
 * Bhog Routes
 * 
 * Routes for bhog booking operations
 */

import { Router } from 'express';
import { BhogController } from '../controllers/BhogController';

export const createBhogRoutes = (bhogController: BhogController): Router => {
  const router = Router();

  // Free bhog booking endpoint
  router.post('/free-booking', (req, res) => bhogController.handleFreeBooking(req, res));

  // Paid bhog booking endpoint
  router.post('/paid-booking', (req, res) => bhogController.handlePaidBooking(req, res));

  // Receipt data for the payment-success page.
  router.get('/payment/:transactionId', (req, res) => bhogController.getPaymentByTransactionId(req, res));

  return router;
};
