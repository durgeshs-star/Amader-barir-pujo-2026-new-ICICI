/**
 * ICICI Payment Routes
 * 
 * Defines routes for ICICI payment gateway callbacks
 */

import { Router } from 'express';
import { IciciPaymentController } from '../controllers/IciciPaymentController';

export function createIciciPaymentRoutes(): Router {
  const router = Router();
  const iciciPaymentController = new IciciPaymentController();

  // ICICI payment callback endpoint
  // ICICI POSTs form data (application/x-www-form-urlencoded) to this endpoint
  router.post('/icici-callback', iciciPaymentController.handleIciciCallback);

  return router;
}
