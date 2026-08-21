/**
 * WhatsApp Notification Service
 * Handles sending payment receipts via WhatsApp
 */

import { whatsappService } from '../utils/whatsappService';
import { receiptService } from './ReceiptService';

interface PaymentData {
  orderId: string;
  transactionId: string;
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  totalAmount: number;
  actualAmountCharged?: number;
  iciciPaymentMode?: string;
  iciciPaymentDateTime?: string;
  iciciTxnId?: string;
  paymentType: 'anudan' | 'bhog';
}

export class WhatsAppNotificationService {
  /**
   * Send WhatsApp notification with PDF receipt
   * This is called after successful ICICI payment verification
   */
  async sendPaymentReceipt(payment: any, paymentType: 'anudan' | 'bhog'): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      console.log(`\n📱 Starting WhatsApp notification for ${paymentType} payment: ${payment.orderId}`);

      // Check if notification already sent to prevent duplicates
      if (payment.whatsappNotificationSent) {
        console.log(`⚠️ WhatsApp notification already sent for ${payment.orderId} at ${payment.whatsappNotificationSentAt}`);
        return {
          success: true,
          message: 'WhatsApp notification already sent'
        };
      }

      // Validate user phone number
      if (!payment.userInfo?.phone) {
        throw new Error('User phone number not found in payment data');
      }

      // Generate PDF receipt
      console.log(`📄 Generating ${paymentType} receipt PDF...`);
      let pdfPath: string;
      
      if (paymentType === 'anudan') {
        pdfPath = await receiptService.generateAnudanReceipt(payment);
      } else {
        pdfPath = await receiptService.generateBhogReceipt(payment);
      }

      console.log(`✅ PDF generated: ${pdfPath}`);

      // Prepare WhatsApp message data
      const paymentData = {
        payerName: payment.userInfo.name,
        orderId: payment.orderId,
        amount: (payment.actualAmountCharged || payment.totalAmount).toFixed(2),
        purpose: paymentType === 'anudan' ? 'Anudan Contribution' : 'Bhog Booking',
        paymentDate: this.formatPaymentDate(payment.iciciPaymentDateTime || payment.timestamp),
        paymentMethod: payment.iciciPaymentMode || 'Online Payment',
        transactionId: payment.iciciTxnId || payment.transactionId,
        pdfFilePath: pdfPath
      };

      // Clean phone number (remove any formatting)
      const cleanPhone = this.cleanPhoneNumber(payment.userInfo.phone);

      console.log(`📞 Sending WhatsApp to: ${cleanPhone}`);

      // Send WhatsApp message with PDF
      const whatsappResult = await whatsappService.sendPaymentReceipt(cleanPhone, paymentData);

      if (whatsappResult.success) {
        console.log(`✅ WhatsApp receipt sent successfully to ${cleanPhone}`);
        
        // Update payment record - WhatsApp sent successfully
        payment.whatsappNotificationSent = true;
        payment.whatsappNotificationSentAt = new Date();
        payment.whatsappNotificationError = undefined;
        
        // Mark fields as modified for Mongoose
        payment.markModified('whatsappNotificationSent');
        payment.markModified('whatsappNotificationSentAt');
        payment.markModified('whatsappNotificationError');
        
        await payment.save();

        return {
          success: true,
          message: `WhatsApp receipt sent to ${cleanPhone}`
        };
      } else {
        throw new Error(whatsappResult.error || 'WhatsApp sending failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ WhatsApp notification failed for ${payment.orderId}:`, errorMessage);

      // Update payment record - WhatsApp failed (but payment is still successful)
      try {
        payment.whatsappNotificationSent = false;
        payment.whatsappNotificationError = errorMessage;
        payment.markModified('whatsappNotificationSent');
        payment.markModified('whatsappNotificationError');
        await payment.save();
      } catch (saveError) {
        console.error('❌ Failed to save WhatsApp error status:', saveError);
      }

      return {
        success: false,
        message: 'WhatsApp notification failed',
        error: errorMessage
      };
    }
  }

  /**
   * Clean and validate phone number
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming Indian numbers)
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('091')) {
      return cleaned.substring(1);
    }
    
    return cleaned;
  }

  /**
   * Format payment date for display
   */
  private formatPaymentDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Singleton instance
export const whatsappNotificationService = new WhatsAppNotificationService();