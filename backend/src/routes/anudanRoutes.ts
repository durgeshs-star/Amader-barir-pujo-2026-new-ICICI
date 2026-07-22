/**
 * Anudan Routes
 * 
 * Defines all Anudan-related API routes.
 */

import { Router } from 'express';
import { AnudanController } from '../controllers/AnudanController';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { remainingLimiter, paymentLimiter } from '../middleware/rateLimit';

export const createAnudanRoutes = (sheetsService: GoogleSheetsService): Router => {
  const router = Router();
  const anudanController = new AnudanController(sheetsService);

  /**
   * POST /api/anudan/paid-booking
   * Handle paid anudan booking
   */
  router.post('/paid-booking', paymentLimiter, (req, res, next) => {
    console.log('=== /api/anudan/paid-booking HIT ===');
    anudanController.handlePaidAnudan(req, res);
  });

  /**
   * GET /api/anudan/status
   * Get collected amount for all Anudan categories
   */
  router.get('/status', anudanController.getAnudanStatus);

  /**
   * GET /api/anudan/remaining
   * Get real-time remaining amounts for each Anudan category (from in-memory state only)
   */
  router.get('/remaining', remainingLimiter, anudanController.getRemainingAmounts);

  /**
   * GET /api/anudan/remaining-single
   * Get remaining amount for a specific campaign (from in-memory state only)
   */
  router.get('/remaining-single', remainingLimiter, anudanController.getRemaining);

  /**
   * GET /api/anudan/events
   * SSE endpoint for real-time remaining amount updates
   */
  router.get('/events', remainingLimiter, anudanController.getEvents);

  return router;
};
