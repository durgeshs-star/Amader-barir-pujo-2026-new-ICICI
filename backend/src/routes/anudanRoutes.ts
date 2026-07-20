/**
 * Anudan Routes
 * 
 * Defines all Anudan-related API routes.
 */

import { Router } from 'express';
import { AnudanController } from '../controllers/AnudanController';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import rateLimit from 'express-rate-limit';
import { ANUDAN_CONFIG } from '../config/anudan.config';

export const createAnudanRoutes = (sheetsService: GoogleSheetsService): Router => {
  const router = Router();
  const anudanController = new AnudanController(sheetsService);

  /**
   * POST /api/anudan/paid-booking
   * Handle paid anudan booking
   */
  router.post('/paid-booking', anudanController.handlePaidAnudan);

  /**
   * GET /api/anudan/status
   * Get collected amount for all Anudan categories
   */
  router.get('/status', anudanController.getAnudanStatus);

  /**
   * GET /api/anudan/remaining
   * Get real-time remaining amounts for each Anudan category (from in-memory state only)
   */
  router.get('/remaining', anudanController.getRemainingAmounts);

  /**
   * GET /api/anudan/remaining-single
   * Get remaining amount for a specific campaign (from in-memory state only)
   */
  router.get('/remaining-single', anudanController.getRemaining);

  /**
   * GET /api/anudan/events
   * SSE endpoint for real-time remaining amount updates
   */
  router.get('/events', anudanController.getEvents);

  // Rate limiting for remaining amount endpoint
  const remainingRateLimit = rateLimit({
    windowMs: ANUDAN_CONFIG.REMAINING_RATE_LIMIT_WINDOW_MS,
    max: ANUDAN_CONFIG.REMAINING_RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests to remaining amount endpoint',
  });

  // Rate limiting for SSE endpoint
  const eventsRateLimit = rateLimit({
    windowMs: ANUDAN_CONFIG.EVENTS_RATE_LIMIT_WINDOW_MS,
    max: ANUDAN_CONFIG.EVENTS_RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many SSE connection attempts',
  });

  router.use('/remaining', remainingRateLimit);
  router.use('/remaining-single', remainingRateLimit);
  router.use('/events', eventsRateLimit);

  return router;
};
