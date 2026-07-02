/**
 * Mock Payment Service
 * 
 * Implements a complete mock payment gateway for testing purposes.
 * This service simulates the behavior of a real payment gateway without
 * requiring actual credentials or making external API calls.
 * 
 * When ICICI credentials become available, this service can be replaced
 * with the actual ICICI service implementation.
 */

import { PaymentStatus, PaymentMode } from '../constants/paymentStatus';
import { generateReferenceId } from '../utils/transaction';
import { PaymentError } from '../types/errors';

/**
 * Mock Payment Request Interface
 */
export interface MockPaymentRequest {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  customerId: string;
  redirectUrl: string;
  callbackUrl: string;
}

/**
 * Mock Payment Response Interface
 */
export interface MockPaymentResponse {
  success: boolean;
  transactionId: string;
  redirectUrl: string;
  message: string;
}

/**
 * Mock Callback Request Interface
 */
export interface MockCallbackRequest {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentMode?: PaymentMode;
  bankReference?: string;
}

/**
 * Mock Payment Service
 */
export class MockPaymentService {
  /**
   * Create a mock payment
   * Returns a redirect URL to the mock payment page
   */
  async createPayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    try {
      // Validate request
      this.validatePaymentRequest(request);

      // Generate mock redirect URL
      const redirectUrl = `/mock-payment/${request.transactionId}`;

      return {
        success: true,
        transactionId: request.transactionId,
        redirectUrl,
        message: 'Payment initiated successfully',
      };
    } catch (error: any) {
      throw new PaymentError('Failed to create mock payment', error);
    }
  }

  /**
   * Process mock payment callback
   * Simulates the callback from a payment gateway
   */
  async processCallback(callback: MockCallbackRequest): Promise<{
    transactionId: string;
    status: PaymentStatus;
    gatewayTransactionId: string;
    responseCode: string;
    responseMessage: string;
    rawResponse: Record<string, any>;
  }> {
    try {
      // Validate callback
      this.validateCallbackRequest(callback);

      // Generate mock gateway transaction ID
      const gatewayTransactionId = `MOCK-${generateReferenceId()}`;

      // Map callback status to payment status
      const statusMap: Record<string, PaymentStatus> = {
        SUCCESS: PaymentStatus.SUCCESS,
        FAILED: PaymentStatus.FAILED,
        CANCELLED: PaymentStatus.CANCELLED,
      };

      const status = statusMap[callback.status];

      // Generate mock response code
      const responseCode = callback.status === 'SUCCESS' ? '000' : '001';

      // Generate mock response message
      const responseMessage = this.getResponseMessage(callback.status);

      // Create raw response (simulating gateway response)
      const rawResponse = {
        transactionId: callback.transactionId,
        gatewayTransactionId,
        status: callback.status,
        paymentMode: callback.paymentMode || PaymentMode.CREDIT_CARD,
        bankReference: callback.bankReference || `BANK-${generateReferenceId()}`,
        amount: 0, // Will be filled by service layer
        currency: 'INR',
        timestamp: new Date().toISOString(),
        responseCode,
        responseMessage,
      };

      return {
        transactionId: callback.transactionId,
        status,
        gatewayTransactionId,
        responseCode,
        responseMessage,
        rawResponse,
      };
    } catch (error: any) {
      throw new PaymentError('Failed to process mock callback', error);
    }
  }

  /**
   * Check transaction status
   * In mock mode, this always returns the current status from database
   */
  async checkTransactionStatus(transactionId: string): Promise<{
    status: PaymentStatus;
    gatewayTransactionId?: string;
    responseCode?: string;
    responseMessage?: string;
  }> {
    try {
      // In mock mode, we don't have a real gateway to check
      // The status is maintained in our database
      // This method is a placeholder for when ICICI integration is implemented
      
      return {
        status: PaymentStatus.PROCESSING,
      };
    } catch (error: any) {
      throw new PaymentError('Failed to check transaction status', error);
    }
  }

  /**
   * Process refund
   * Simulates refund processing
   */
  async processRefund(transactionId: string, amount?: number): Promise<{
    success: boolean;
    refundTransactionId: string;
    message: string;
  }> {
    try {
      const refundTransactionId = `REF-${generateReferenceId()}`;

      return {
        success: true,
        refundTransactionId,
        message: 'Refund processed successfully',
      };
    } catch (error: any) {
      throw new PaymentError('Failed to process refund', error);
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: MockPaymentRequest): void {
    if (!request.orderId || request.orderId.trim() === '') {
      throw new PaymentError('Order ID is required');
    }

    if (!request.transactionId || request.transactionId.trim() === '') {
      throw new PaymentError('Transaction ID is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new PaymentError('Amount must be greater than 0');
    }

    if (!request.currency || request.currency.trim() === '') {
      throw new PaymentError('Currency is required');
    }

    if (!request.customerId || request.customerId.trim() === '') {
      throw new PaymentError('Customer ID is required');
    }

    if (!request.redirectUrl || request.redirectUrl.trim() === '') {
      throw new PaymentError('Redirect URL is required');
    }

    if (!request.callbackUrl || request.callbackUrl.trim() === '') {
      throw new PaymentError('Callback URL is required');
    }
  }

  /**
   * Validate callback request
   */
  private validateCallbackRequest(callback: MockCallbackRequest): void {
    if (!callback.transactionId || callback.transactionId.trim() === '') {
      throw new PaymentError('Transaction ID is required');
    }

    if (!callback.status || !['SUCCESS', 'FAILED', 'CANCELLED'].includes(callback.status)) {
      throw new PaymentError('Invalid status');
    }
  }

  /**
   * Get response message based on status
   */
  private getResponseMessage(status: string): string {
    const messages: Record<string, string> = {
      SUCCESS: 'Payment completed successfully',
      FAILED: 'Payment failed',
      CANCELLED: 'Payment cancelled by user',
    };

    return messages[status] || 'Payment status unknown';
  }
}
