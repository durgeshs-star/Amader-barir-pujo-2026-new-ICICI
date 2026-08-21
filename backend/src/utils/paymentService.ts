import { PaymentData, ICICIPaymentResponse } from '../types/whatsapp.types';
import { whatsappService } from './whatsappService';
import * as fs from 'fs';

/**
 * Parse ICICI payment gateway response
 */
export const parseICICIResponse = (responseData: Record<string, string | number | undefined>): PaymentData => {
  return {
    payerName: (responseData.FIRSTNAME as string) || 'Customer',
    payerEmail: (responseData.EMAIL as string) || '',
    payerPhone: (responseData.MOBILE as string) || '',
    orderId: (responseData.ORDER_ID as string) || (responseData.TxnId as string) || '',
    amount: (responseData.AMT as string) || (responseData.Amount as string) || '0',
    purpose: (responseData.PURPOSE as string) || 'Payment',
    paymentDate: new Date().toLocaleString('en-IN'),
    paymentMethod: 'ICICI Payment Gateway',
    transactionId: (responseData.TxnId as string) || (responseData.BankTxnId as string) || '',
    status: (responseData.RESPCODE as string) === '0' || (responseData.ResponseCode as string) === '0' ? 'success' : 'failed'
  };
};

/**
 * Clean and validate phone number
 */
export const cleanPhoneNumber = (phone: string): string => {
  // Remove spaces, dashes, parentheses, plus sign
  let cleaned = phone.replace(/[\s\-+()]/g, '');

  // If 10 digits, add India country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return cleaned;
};

/**
 * Trigger WhatsApp notification with payment receipt PDF
 */
export const sendPaymentNotificationViaWhatsApp = async (
  paymentData: PaymentData,
  pdfFilePath: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    // Validate phone number exists
    if (!paymentData.payerPhone || paymentData.payerPhone.trim() === '') {
      throw new Error('Payer phone number not found in payment response');
    }

    // Clean phone number
    const cleanPhone = cleanPhoneNumber(paymentData.payerPhone);

    // Validate phone format (10-15 digits)
    if (!/^\d{10,15}$/.test(cleanPhone)) {
      throw new Error(`Invalid phone number format: ${paymentData.payerPhone}`);
    }

    // Verify PDF exists
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`Receipt PDF not found at: ${pdfFilePath}`);
    }

    console.log(`\n📱 Sending WhatsApp payment receipt to: ${cleanPhone}`);
    console.log(`💾 PDF Path: ${pdfFilePath}`);

    // Send via WhatsApp
    const result = await whatsappService.sendPaymentReceipt(cleanPhone, {
      payerName: paymentData.payerName,
      orderId: paymentData.orderId,
      amount: paymentData.amount.toString(),
      purpose: paymentData.purpose,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      pdfFilePath: pdfFilePath
    });

    if (result.success) {
      console.log(`✅ WhatsApp receipt sent successfully to ${cleanPhone}\n`);
      return {
        success: true,
        message: `Payment receipt sent via WhatsApp to ${cleanPhone}`
      };
    } else {
      throw new Error(result.error || 'Failed to send WhatsApp message');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error sending WhatsApp notification:', errorMessage);
    return {
      success: false,
      message: 'Failed to send WhatsApp notification',
      error: errorMessage
    };
  }
};

/**
 * Handle complete payment success flow
 * Call this after PDF is generated
 */
export const handlePaymentSuccess = async (
  paymentResponse: Record<string, string | number | undefined>,
  pdfFilePath: string
): Promise<{
  success: boolean;
  paymentData: PaymentData | null;
  whatsappStatus: { success: boolean; message: string; error?: string };
}> => {
  try {
    // Parse payment response from ICICI
    const paymentData = parseICICIResponse(paymentResponse);

    console.log('\n' + '='.repeat(50));
    console.log('✅ PAYMENT SUCCESSFUL');
    console.log('='.repeat(50));
    console.log('Payment Data:', JSON.stringify(paymentData, null, 2));
    console.log('PDF Path:', pdfFilePath);

    // Send WhatsApp notification
    const whatsappStatus = await sendPaymentNotificationViaWhatsApp(paymentData, pdfFilePath);

    return {
      success: true,
      paymentData,
      whatsappStatus
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error handling payment success:', errorMessage);
    return {
      success: false,
      paymentData: null,
      whatsappStatus: {
        success: false,
        message: 'Error processing payment notification',
        error: errorMessage
      }
    };
  }
};
