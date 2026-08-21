import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode-terminal';
import { MessageResponse } from '../types/whatsapp.types';
import * as fs from 'fs';
import * as path from 'path';

class WhatsAppService {
  private client: Client | null = null;
  private isReady: boolean = false;
  private isInitializing: boolean = false;

  constructor() {
    this.initializeWhatsApp();
  }

  private initializeWhatsApp(): void {
    if (this.isInitializing) {
      console.log('⏳ WhatsApp is already initializing...');
      return;
    }

    this.isInitializing = true;

    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr: string) => {
      this.isReady = false;
      console.log('\n' + '='.repeat(50));
      console.log('🔐 SCAN THIS QR CODE WITH YOUR WHATSAPP APP:');
      console.log('='.repeat(50) + '\n');

      QRCode.generate(qr, { small: true });

      console.log('\n📱 Steps to scan:');
      console.log('1. Open WhatsApp on your phone (+91 9405807468)');
      console.log('2. Go to Settings → Linked Devices (or Web & Desktop)');
      console.log('3. Tap "Link a Device"');
      console.log('4. Scan the QR code above with your phone camera\n');
      console.log('⏳ Waiting for you to scan...\n');
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.isInitializing = false;
      console.log('\n' + '='.repeat(50));
      console.log('✅ WhatsApp Client is Ready!');
      console.log('🟢 Connected and ready to send messages');
      console.log('='.repeat(50) + '\n');
    });

    this.client.on('disconnected', (reason: string) => {
      this.isReady = false;
      console.error('❌ WhatsApp disconnected:', reason);
      console.log('⚠️  Attempting to reconnect...\n');
    });

    this.client.on('auth_failure', (msg: string) => {
      this.isReady = false;
      this.isInitializing = false;
      console.error('❌ Authentication failed:', msg);
      console.log('🔄 Please restart the server and scan the QR code again\n');
    });

    this.client.on('error', (error: Error) => {
      console.error('❌ WhatsApp Client Error:', error.message);
    });

    this.client.initialize().catch((error: unknown) => {
      this.isReady = false;
      this.isInitializing = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Failed to initialize WhatsApp:', errorMessage);
    });
  }

  async sendMessage(phoneNumber: string, messageBody: string): Promise<MessageResponse> {
    return new Promise((resolve) => {
      if (!this.client || !this.isReady) {
        resolve({
          success: false,
          error: 'WhatsApp client not ready. Please check console for QR code and scan it.'
        });
        return;
      }

      try {
        const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

        this.client
          .sendMessage(chatId, messageBody)
          .then((response: any) => {
            console.log(`✅ Message sent to ${phoneNumber}`);
            resolve({
              success: true,
              messageId: response.id._serialized,
              phone: phoneNumber,
              message: 'Message sent successfully'
            });
          })
          .catch((error: Error) => {
            console.error(`❌ Failed to send message to ${phoneNumber}:`, error.message);
            resolve({
              success: false,
              error: `Failed to send message: ${error.message}`,
              phone: phoneNumber
            });
          });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error in sendMessage:', errorMessage);
        resolve({
          success: false,
          error: errorMessage
        });
      }
    });
  }

  async sendOrderConfirmation(
    customerPhone: string,
    orderId: string,
    orderAmount: number | string,
    customerName?: string
  ): Promise<MessageResponse> {
    const message = `Hi ${customerName || 'there'},\n\n✅ Your order #${orderId} has been confirmed!\n\n💰 Amount: ₹${orderAmount}\n\n🎉 Thank you for your purchase!\n\nWe'll update you soon on the shipping status.`;
    return this.sendMessage(customerPhone, message);
  }

  async sendReminder(
    phoneNumber: string,
    reminderText: string,
    title: string = 'Reminder'
  ): Promise<MessageResponse> {
    const message = `📢 ${title}:\n\n${reminderText}`;
    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Send message with file attachment (PDF)
   */
  async sendMessageWithFile(
    phoneNumber: string,
    messageBody: string,
    filePath: string
  ): Promise<MessageResponse> {
    return new Promise((resolve) => {
      if (!this.client || !this.isReady) {
        resolve({
          success: false,
          error: 'WhatsApp client not ready.'
        });
        return;
      }

      try {
        // Verify file exists
        if (!fs.existsSync(filePath)) {
          resolve({
            success: false,
            error: `File not found: ${filePath}`
          });
          return;
        }

        const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

        // Send message with media using MessageMedia
        const media = MessageMedia.fromFilePath(filePath);

        this.client
          .sendMessage(chatId, media, { caption: messageBody })
          .then((response: any) => {
            console.log(`✅ Message with file sent to ${phoneNumber}`);
            resolve({
              success: true,
              messageId: response.id._serialized,
              phone: phoneNumber,
              message: 'Message with attachment sent successfully'
            });
          })
          .catch((error: Error) => {
            console.error(
              `❌ Failed to send message with file to ${phoneNumber}:`,
              error.message
            );
            resolve({
              success: false,
              error: `Failed to send message: ${error.message}`,
              phone: phoneNumber
            });
          });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error in sendMessageWithFile:', errorMessage);
        resolve({
          success: false,
          error: errorMessage
        });
      }
    });
  }

  /**
   * Send payment receipt via WhatsApp with PDF
   */
  async sendPaymentReceipt(
    customerPhone: string,
    paymentData: {
      payerName: string;
      orderId: string;
      amount: string;
      purpose: string;
      paymentDate: string;
      paymentMethod: string;
      transactionId: string;
      pdfFilePath: string;
    }
  ): Promise<MessageResponse> {
    const message = `📨 *Payment Receipt*\n\nHi ${paymentData.payerName},\n\n✅ Your payment has been received successfully!\n\n━━━━━━━━━━━━━━━━━━━\n*Payment Details:*\n━━━━━━━━━━━━━━━━━━━\n💵 Amount: ₹${paymentData.amount}\n📋 Purpose: ${paymentData.purpose}\n📅 Date: ${paymentData.paymentDate}\n💳 Method: ${paymentData.paymentMethod}\n🔐 Transaction ID: ${paymentData.transactionId}\n📦 Order ID: ${paymentData.orderId}\n\n━━━━━━━━━━━━━━━━━━━\n\nYour receipt is attached below. Please keep it for your records.\n\nThank you! 🙏`;

    return this.sendMessageWithFile(customerPhone, message, paymentData.pdfFilePath);
  }

  isConnected(): boolean {
    return this.isReady;
  }

  getStatus(): { status: 'connected' | 'disconnected'; message: string } {
    if (this.isReady) {
      return {
        status: 'connected',
        message: '✅ WhatsApp is connected and ready to send messages'
      };
    } else if (this.isInitializing) {
      return {
        status: 'disconnected',
        message: '⏳ WhatsApp is initializing. Check console for QR code.'
      };
    } else {
      return {
        status: 'disconnected',
        message: '❌ WhatsApp is not connected. Please restart the server.'
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
