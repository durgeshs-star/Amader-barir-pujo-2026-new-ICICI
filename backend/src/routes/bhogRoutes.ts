/**
 * Bhog Routes
 * 
 * Routes for bhog booking operations
 */

import { Router } from 'express';
import { BhogController } from '../controllers/BhogController';
import path from 'path';
import fs from 'fs';

export const createBhogRoutes = (bhogController: BhogController): Router => {
  const router = Router();

  // Free bhog booking endpoint
  router.post('/free-booking', (req, res) => bhogController.handleFreeBooking(req, res));

  // Paid bhog booking endpoint
  router.post('/paid-booking', (req, res) => bhogController.handlePaidBooking(req, res));

  // Receipt data for the payment-success page.
  router.get('/payment/:transactionId', (req, res) => bhogController.getPaymentByTransactionId(req, res));

  // Serve receipt PDF for download/viewing
  router.get('/receipt/:filename', (req, res) => {
    const { filename } = req.params;
    const receiptsDir = path.join(process.cwd(), 'receipts');
    const filePath = path.join(receiptsDir, filename);

    // Security: Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Send file with proper headers for download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('[BhogRoutes] Error sending receipt:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download receipt' });
        }
      }
    });
  });

  return router;
};
