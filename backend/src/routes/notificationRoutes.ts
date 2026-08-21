import { Router, Request, Response } from 'express';
import { whatsappService } from '../utils/whatsappService';
import {
  SendMessagePayload,
  OrderConfirmationPayload,
  ReminderPayload,
  MessageResponse
} from '../types/whatsapp.types';

const router = Router();

router.get('/status', (req: Request, res: Response): void => {
  const status = whatsappService.getStatus();
  res.json(status);
});

router.post('/send-message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, message } = req.body as SendMessagePayload;

    if (!phoneNumber || !message) {
      res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
      return;
    }

    if (!/^\d{10,15}$/.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Must be 10-15 digits with country code'
      });
      return;
    }

    const result: MessageResponse = await whatsappService.sendMessage(phoneNumber, message);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Error in send-message route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

router.post('/send-order-confirmation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerPhone, orderId, orderAmount, customerName } =
      req.body as OrderConfirmationPayload;

    if (!customerPhone || !orderId || !orderAmount) {
      res.status(400).json({
        success: false,
        error: 'Customer phone, order ID, and order amount are required'
      });
      return;
    }

    if (!/^\d{10,15}$/.test(customerPhone)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
      return;
    }

    const result: MessageResponse = await whatsappService.sendOrderConfirmation(
      customerPhone,
      orderId,
      orderAmount,
      customerName
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Order confirmation sent successfully',
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        details: result
      });
    }
  } catch (error: any) {
    console.error('Error in send-order-confirmation route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

router.post('/send-reminder', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, reminderText, title } = req.body as ReminderPayload;

    if (!phoneNumber || !reminderText) {
      res.status(400).json({
        success: false,
        error: 'Phone number and reminder text are required'
      });
      return;
    }

    if (!/^\d{10,15}$/.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
      return;
    }

    const result: MessageResponse = await whatsappService.sendReminder(
      phoneNumber,
      reminderText,
      title
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Reminder sent successfully',
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        details: result
      });
    }
  } catch (error: any) {
    console.error('Error in send-reminder route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
