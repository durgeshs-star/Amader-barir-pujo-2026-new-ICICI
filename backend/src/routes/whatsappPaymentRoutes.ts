import { Router, Request, Response } from 'express';
import { handlePaymentSuccess, parseICICIResponse } from '../utils/paymentService';
import { ICICIPaymentResponse } from '../types/whatsapp.types';

const router = Router();

/**
 * POST /api/payments/success
 * Handle ICICI payment success callback
 *
 * Body should contain:
 * - paymentResponse: ICICI gateway response object
 * - pdfFilePath: Full path to generated receipt PDF
 *
 * Example:
 * {
 *   "paymentResponse": { TxnId, OrderId, Amount, MOBILE, FIRSTNAME, ... },
 *   "pdfFilePath": "/path/to/receipt-ORD-001.pdf"
 * }
 */
router.post('/success', async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentResponse, pdfFilePath } = req.body;

    // Validate required fields
    if (!paymentResponse) {
      res.status(400).json({
        success: false,
        error: 'Payment response is required'
      });
      return;
    }

    if (!pdfFilePath) {
      res.status(400).json({
        success: false,
        error: 'PDF file path is required'
      });
      return;
    }

    console.log('\n📨 Processing payment success and sending WhatsApp receipt...');

    // Handle payment success and send WhatsApp
    const result = await handlePaymentSuccess(paymentResponse as ICICIPaymentResponse, pdfFilePath);

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment processed successfully',
        paymentData: result.paymentData,
        whatsapp: result.whatsappStatus
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error processing payment',
        error: result.whatsappStatus.error
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in payment success route:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * POST /api/payments/validate-response
 * Validate and parse ICICI payment response without sending WhatsApp
 * Useful for testing
 */
router.post('/validate-response', (req: Request, res: Response): void => {
  try {
    const { paymentResponse } = req.body;

    if (!paymentResponse) {
      res.status(400).json({
        success: false,
        error: 'Payment response is required'
      });
      return;
    }

    const parsed = parseICICIResponse(paymentResponse as ICICIPaymentResponse);

    res.json({
      success: true,
      parsedData: parsed,
      message: 'Payment response parsed successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;
