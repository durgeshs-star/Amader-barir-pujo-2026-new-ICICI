/**
 * Payment Service
 * 
 * Implements the business logic for payment operations.
 * This service abstracts the payment provider implementation, allowing
 * easy switching between Mock, ICICI Sandbox, and ICICI Production.
 * 
 * The service follows the Facade pattern and uses dependency injection
 * for the payment provider service.
 */

import { PaymentStatus, PaymentMode, Currency, DEFAULT_CURRENCY } from '../constants/paymentStatus';
import { generateTransactionId, generateOrderId } from '../utils/transaction';
import { IPaymentRepository } from '../repositories/PaymentRepository';
import { MockPaymentService } from './MockPaymentService';
import { ICICIService } from './ICICIService';
import { paymentConfig, isMock, isSandbox, isProduction } from '../config/payment.config';
import { PaymentError, NotFoundError, ConflictError } from '../types/errors';

/**
 * Create Order Request Interface
 */
export interface CreateOrderRequest {
  customerId: string;
  amount: number;
  currency?: Currency;
  // Additional metadata can be added here
  metadata?: Record<string, any>;
}

/**
 * Create Order Response Interface
 */
export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  message: string;
}

/**
 * Payment Callback Request Interface
 */
export interface PaymentCallbackRequest {
  transactionId: string;
  status: string;
  paymentMode?: PaymentMode;
  bankReference?: string;
  // Additional callback fields
  [key: string]: any;
}

/**
 * Payment Callback Response Interface
 */
export interface PaymentCallbackResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  message: string;
}

/**
 * Transaction Status Response Interface
 */
export interface TransactionStatusResponse {
  transactionId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMode?: PaymentMode;
  gatewayTransactionId?: string;
  responseCode?: string;
  responseMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund Request Interface
 */
export interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

/**
 * Refund Response Interface
 */
export interface RefundResponse {
  success: boolean;
  transactionId: string;
  refundTransactionId: string;
  amount: number;
  message: string;
}

/**
 * Payment History Response Interface
 */
export interface PaymentHistoryResponse {
  payments: TransactionStatusResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Payment Service
 */
export class PaymentService {
  private paymentRepository: IPaymentRepository;
  private mockPaymentService: MockPaymentService;
  private iciciService: ICICIService;

  constructor(paymentRepository: IPaymentRepository) {
    this.paymentRepository = paymentRepository;
    this.mockPaymentService = new MockPaymentService();
    this.iciciService = new ICICIService();
  }

  /**
   * Create a new payment order
   * 
   * This method:
   * 1. Validates the request
   * 2. Generates unique order and transaction IDs
   * 3. Creates a payment record in the database
   * 4. Calls the appropriate payment provider
   * 5. Returns the redirect URL
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate request
      this.validateCreateOrderRequest(request);

      // Generate unique IDs
      const orderId = generateOrderId();
      const transactionId = generateTransactionId();

      // Check for duplicate transaction ID (should never happen with UUID, but defensive)
      const exists = await this.paymentRepository.existsByTransactionId(transactionId);
      if (exists) {
        throw new ConflictError('Transaction ID already exists');
      }

      // Create payment record in database
      const paymentData = {
        orderId,
        transactionId,
        customerId: request.customerId,
        amount: request.amount,
        currency: request.currency || DEFAULT_CURRENCY,
        status: PaymentStatus.PENDING,
      };

      await this.paymentRepository.create(paymentData);

      // Call appropriate payment provider
      const providerRequest = {
        orderId,
        transactionId,
        amount: request.amount,
        currency: request.currency || DEFAULT_CURRENCY,
        customerId: request.customerId,
        redirectUrl: paymentConfig.redirectUrl,
        callbackUrl: paymentConfig.callbackUrl,
      };

      let providerResponse;

      if (isMock()) {
        providerResponse = await this.mockPaymentService.createPayment(providerRequest);
      } else if (isSandbox() || isProduction()) {
        providerResponse = await this.iciciService.createPayment(providerRequest);
      } else {
        throw new PaymentError('Invalid payment provider configuration');
      }

      // Update payment status to PROCESSING
      await this.paymentRepository.updateStatus(transactionId, PaymentStatus.PROCESSING);

      return {
        success: true,
        orderId,
        transactionId,
        amount: request.amount,
        currency: request.currency || DEFAULT_CURRENCY,
        redirectUrl: providerResponse.redirectUrl || '',
        message: providerResponse.message,
      };
    } catch (error: any) {
      if (error instanceof PaymentError || error instanceof ConflictError) {
        throw error;
      }
      throw new PaymentError('Failed to create payment order', error);
    }
  }

  /**
   * Process payment callback from gateway
   * 
   * This method:
   * 1. Validates the callback
   * 2. Verifies the payment with the provider
   * 3. Updates the payment record in the database
   * 4. Returns the payment status
   */
  async processCallback(callback: PaymentCallbackRequest): Promise<PaymentCallbackResponse> {
    try {
      // Validate callback
      if (!callback.transactionId || callback.transactionId.trim() === '') {
        throw new PaymentError('Transaction ID is required');
      }

      // Find payment record
      const payment = await this.paymentRepository.findByTransactionId(callback.transactionId);
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      // Check if payment is already in a terminal state
      if (payment.status === PaymentStatus.SUCCESS || 
          payment.status === PaymentStatus.FAILED || 
          payment.status === PaymentStatus.CANCELLED) {
        // Return current status without processing again (idempotency)
        return {
          success: true,
          transactionId: payment.transactionId,
          status: payment.status,
          message: 'Payment already processed',
        };
      }

      // Process callback with appropriate provider
      let callbackResult;

      if (isMock()) {
        callbackResult = await this.mockPaymentService.processCallback({
          transactionId: callback.transactionId,
          status: callback.status as any,
          paymentMode: callback.paymentMode,
          bankReference: callback.bankReference,
        });
      } else if (isSandbox() || isProduction()) {
        callbackResult = await this.iciciService.processCallback(callback);
      } else {
        throw new PaymentError('Invalid payment provider configuration');
      }

      // Update payment record
      await this.paymentRepository.updateStatus(
        callback.transactionId,
        callbackResult.status,
        {
          paymentMode: callback.paymentMode,
          bankReference: callback.bankReference,
          gatewayTransactionId: callbackResult.gatewayTransactionId,
          responseCode: callbackResult.responseCode,
          responseMessage: callbackResult.responseMessage,
          rawResponse: callbackResult.rawResponse,
        }
      );

      return {
        success: true,
        transactionId: callback.transactionId,
        status: callbackResult.status,
        message: callbackResult.responseMessage,
      };
    } catch (error: any) {
      if (error instanceof PaymentError || error instanceof NotFoundError) {
        throw error;
      }
      throw new PaymentError('Failed to process payment callback', error);
    }
  }

  /**
   * Get payment status
   * 
   * This method:
   * 1. Validates the transaction ID
   * 2. Retrieves the payment from database
   * 3. Optionally verifies with gateway
   * 4. Returns the payment status
   */
  async getTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    try {
      // Validate transaction ID
      if (!transactionId || transactionId.trim() === '') {
        throw new PaymentError('Transaction ID is required');
      }

      // Find payment record
      const payment = await this.paymentRepository.findByTransactionId(transactionId);
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      // If payment is in PROCESSING state, verify with gateway
      if (payment.status === PaymentStatus.PROCESSING && !isMock()) {
        try {
          const gatewayStatus = await this.iciciService.checkTransactionStatus(transactionId);
          
          // Update payment if gateway has final status
          if (gatewayStatus.status !== PaymentStatus.PROCESSING) {
            await this.paymentRepository.updateStatus(
              transactionId,
              gatewayStatus.status,
              {
                gatewayTransactionId: gatewayStatus.gatewayTransactionId,
                responseCode: gatewayStatus.responseCode,
                responseMessage: gatewayStatus.responseMessage,
              }
            );

            payment.status = gatewayStatus.status;
            payment.gatewayTransactionId = gatewayStatus.gatewayTransactionId;
            payment.responseCode = gatewayStatus.responseCode;
            payment.responseMessage = gatewayStatus.responseMessage;
          }
        } catch (error) {
          // If gateway check fails, return database status
          console.error('Gateway status check failed, returning database status:', error);
        }
      }

      return {
        transactionId: payment.transactionId,
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMode: payment.paymentMode,
        gatewayTransactionId: payment.gatewayTransactionId,
        responseCode: payment.responseCode,
        responseMessage: payment.responseMessage,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    } catch (error: any) {
      if (error instanceof PaymentError || error instanceof NotFoundError) {
        throw error;
      }
      throw new PaymentError('Failed to get transaction status', error);
    }
  }

  /**
   * Process refund
   * 
   * This method:
   * 1. Validates the refund request
   * 2. Checks if payment can be refunded
   * 3. Calls the appropriate provider
   * 4. Updates the payment record
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Validate request
      if (!request.transactionId || request.transactionId.trim() === '') {
        throw new PaymentError('Transaction ID is required');
      }

      // Find payment record
      const payment = await this.paymentRepository.findByTransactionId(request.transactionId);
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      // Check if payment can be refunded
      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new PaymentError('Only successful payments can be refunded');
      }

      // Process refund with appropriate provider
      let refundResult;

      if (isMock()) {
        refundResult = await this.mockPaymentService.processRefund(
          request.transactionId,
          request.amount
        );
      } else if (isSandbox() || isProduction()) {
        refundResult = await this.iciciService.processRefund({
          transactionId: request.transactionId,
          amount: request.amount,
          refundReason: request.reason,
        });
      } else {
        throw new PaymentError('Invalid payment provider configuration');
      }

      // Note: In a real implementation, you might want to create a separate refund record
      // or add a refund status to the payment record
      // For now, we'll just return the refund result

      return {
        success: refundResult.success,
        transactionId: request.transactionId,
        refundTransactionId: refundResult.refundTransactionId,
        amount: request.amount || payment.amount,
        message: refundResult.message,
      };
    } catch (error: any) {
      if (error instanceof PaymentError || error instanceof NotFoundError) {
        throw error;
      }
      throw new PaymentError('Failed to process refund', error);
    }
  }

  /**
   * Get payment history for a customer
   * 
   * This method:
   * 1. Validates the customer ID
   * 2. Retrieves payment history from database
   * 3. Returns paginated results
   */
  async getPaymentHistory(
    customerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaymentHistoryResponse> {
    try {
      // Validate customer ID
      if (!customerId || customerId.trim() === '') {
        throw new PaymentError('Customer ID is required');
      }

      // Validate pagination parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      // Get total count
      const total = await this.paymentRepository.countByCustomerId(customerId);

      // Get payments
      const skip = (page - 1) * limit;
      const payments = await this.paymentRepository.findByCustomerId(customerId, limit, skip);

      // Transform to response format
      const paymentResponses: TransactionStatusResponse[] = payments.map(payment => ({
        transactionId: payment.transactionId,
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMode: payment.paymentMode,
        gatewayTransactionId: payment.gatewayTransactionId,
        responseCode: payment.responseCode,
        responseMessage: payment.responseMessage,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      }));

      return {
        payments: paymentResponses,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentError('Failed to get payment history', error);
    }
  }

  /**
   * Validate create order request
   */
  private validateCreateOrderRequest(request: CreateOrderRequest): void {
    if (!request.customerId || request.customerId.trim() === '') {
      throw new PaymentError('Customer ID is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new PaymentError('Amount must be greater than 0');
    }

    if (request.amount > 1000000) {
      throw new PaymentError('Amount cannot exceed 1,000,000');
    }

    // Validate currency if provided
    if (request.currency) {
      const validCurrencies = Object.values(Currency);
      if (!validCurrencies.includes(request.currency)) {
        throw new PaymentError('Invalid currency');
      }
    }
  }
}
