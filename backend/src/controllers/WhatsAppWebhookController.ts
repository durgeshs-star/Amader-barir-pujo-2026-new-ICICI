/**
 * WhatsApp Webhook Controller
 * 
 * Handles Meta WhatsApp webhook verification and event reception.
 */

import { Request, Response } from 'express';

export class WhatsAppWebhookController {
  private verifyToken: string;

  constructor() {
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';

    if (!this.verifyToken) {
      console.warn('[WhatsAppWebhook] WHATSAPP_VERIFY_TOKEN not configured');
    }
  }

  /**
   * GET /api/whatsapp/webhook
   * 
   * Meta webhook verification endpoint.
   * Meta sends: hub.mode, hub.verify_token, hub.challenge
   * 
   * Returns hub.challenge with HTTP 200 when valid
   * Returns HTTP 403 when invalid
   */
  handleWebhookVerification = (req: Request, res: Response): void => {
    try {
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      console.log('[WhatsAppWebhook] Verification request received');

      // Verify hub.mode === "subscribe"
      if (mode !== 'subscribe') {
        console.warn('[WhatsAppWebhook] Invalid hub.mode:', mode);
        res.status(403).send('Forbidden');
        return;
      }

      // Compare hub.verify_token with WHATSAPP_VERIFY_TOKEN
      if (token !== this.verifyToken) {
        console.warn('[WhatsAppWebhook] Invalid verify token');
        res.status(403).send('Forbidden');
        return;
      }

      // Return hub.challenge with HTTP 200 when valid
      console.log('[WhatsAppWebhook] Verification successful');
      res.status(200).send(challenge);
    } catch (error: any) {
      console.error('[WhatsAppWebhook] Verification error:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };

  /**
   * POST /api/whatsapp/webhook
   * 
   * Meta webhook event reception endpoint.
   * Accepts Meta webhook events, logs useful non-sensitive information,
   * and immediately returns HTTP 200 to Meta.
   * 
   * Does not perform long-running operations before acknowledging Meta.
   * Handles malformed/unexpected payloads safely.
   */
  handleWebhookEvent = (req: Request, res: Response): void => {
    try {
      const body = req.body;

      console.log('[WhatsAppWebhook] Webhook event received');

      // Log basic event information (non-sensitive)
      if (body && body.entry) {
        const entryCount = body.entry.length || 0;
        console.log(`[WhatsAppWebhook] Entries received: ${entryCount}`);

        for (const entry of body.entry) {
          if (entry.changes) {
            const changeCount = entry.changes.length || 0;
            console.log(`[WhatsAppWebhook] Changes in entry: ${changeCount}`);

            for (const change of entry.changes) {
              const field = change.field;
              console.log(`[WhatsAppWebhook] Field: ${field}`);

              // Log message events without exposing sensitive data
              if (field === 'messages' && change.value?.messages) {
                const messageCount = change.value.messages.length || 0;
                console.log(`[WhatsAppWebhook] Messages: ${messageCount}`);
              }

              // Log status events (delivery, read, etc.)
              if (field === 'message_status' && change.value?.statuses) {
                const statusCount = change.value.statuses.length || 0;
                console.log(`[WhatsAppWebhook] Status updates: ${statusCount}`);
              }
            }
          }
        }
      }

      // Immediately return HTTP 200 to Meta
      // Do not perform long-running operations here
      res.status(200).json({ status: 'received' });
    } catch (error: any) {
      console.error('[WhatsAppWebhook] Event handling error:', error.message);
      
      // Still return 200 to avoid Meta retrying on our server errors
      // The error is logged for investigation
      res.status(200).json({ status: 'received' });
    }
  };
}
