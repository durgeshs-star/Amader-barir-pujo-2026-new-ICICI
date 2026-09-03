/**
 * WhatsApp Routes
 * 
 * Defines routes for WhatsApp webhook verification and event reception.
 */

import { Router } from 'express';
import { WhatsAppWebhookController } from '../controllers/WhatsAppWebhookController';

export function createWhatsAppRoutes(): Router {
  const router = Router();
  const whatsappWebhookController = new WhatsAppWebhookController();

  // GET /api/whatsapp/webhook - Meta webhook verification
  router.get('/webhook', whatsappWebhookController.handleWebhookVerification);

  // POST /api/whatsapp/webhook - Meta webhook event reception
  router.post('/webhook', whatsappWebhookController.handleWebhookEvent);

  return router;
}
