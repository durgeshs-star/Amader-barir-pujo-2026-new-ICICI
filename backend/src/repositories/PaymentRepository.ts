/**
 * Payment Repository
 * 
 * Implements the Repository Pattern for all Payment database operations using Google Sheets.
 * This abstracts database interactions from the service layer.
 */

import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { PaymentStatus } from '../constants/paymentStatus';
import { DatabaseError, NotFoundError, ConflictError } from '../types/errors';

/**
 * Payment Interface (matching the original IPayment)
 */
export interface IPayment {
  orderId: string;
  transactionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMode?: string;
  bankReference?: string;
  gatewayTransactionId?: string;
  responseCode?: string;
  responseMessage?: string;
  rawResponse?: Record<string, any>;
  // Additional fields for bhog booking
  bookingDay?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Repository Interface
 * Defines all database operations for payments
 */
export interface IPaymentRepository {
  create(paymentData: Partial<IPayment>): Promise<IPayment>;
  findByTransactionId(transactionId: string): Promise<IPayment | null>;
  findByOrderId(orderId: string): Promise<IPayment | null>;
  findByCustomerId(customerId: string, limit?: number, skip?: number): Promise<IPayment[]>;
  updateStatus(transactionId: string, status: PaymentStatus, updateData?: Partial<IPayment>): Promise<IPayment>;
  updateByTransactionId(transactionId: string, updateData: Partial<IPayment>): Promise<IPayment>;
  delete(transactionId: string): Promise<void>;
  countByCustomerId(customerId: string): Promise<number>;
  countByStatus(status: PaymentStatus): Promise<number>;
  findByStatus(status: PaymentStatus, limit?: number, skip?: number): Promise<IPayment[]>;
  existsByTransactionId(transactionId: string): Promise<boolean>;
  existsByOrderId(orderId: string): Promise<boolean>;
}

/**
 * Payment Repository Implementation using Google Sheets
 */
export class PaymentRepository implements IPaymentRepository {
  private sheetsService: GoogleSheetsService;
  private sheetName = 'Payments';
  private headers = [
    'orderId',
    'transactionId',
    'customerId',
    'amount',
    'currency',
    'status',
    'paymentMode',
    'bankReference',
    'gatewayTransactionId',
    'responseCode',
    'responseMessage',
    'rawResponse',
    'bookingDay',
    'customerName',
    'customerEmail',
    'customerPhone',
    'createdAt',
    'updatedAt',
  ];

  constructor() {
    this.sheetsService = new GoogleSheetsService();
    this.initializeSheet();
  }

  /**
   * Initialize the Google Sheet
   */
  private async initializeSheet(): Promise<void> {
    try {
      await this.sheetsService.initialize();
      await this.sheetsService.createSheetIfNotExists(this.sheetName, this.headers);
    } catch (error) {
      console.error('Failed to initialize payment sheet:', error);
    }
  }

  /**
   * Convert row data to IPayment object
   */
  private rowToPayment(row: any[]): IPayment {
    return {
      orderId: row[0] || '',
      transactionId: row[1] || '',
      customerId: row[2] || '',
      amount: parseFloat(row[3]) || 0,
      currency: row[4] || 'INR',
      status: row[5] as PaymentStatus || PaymentStatus.PENDING,
      paymentMode: row[6],
      bankReference: row[7],
      gatewayTransactionId: row[8],
      responseCode: row[9],
      responseMessage: row[10],
      rawResponse: row[11] ? JSON.parse(row[11]) : {},
      bookingDay: row[12],
      customerName: row[13],
      customerEmail: row[14],
      customerPhone: row[15],
      createdAt: new Date(row[16] || Date.now()),
      updatedAt: new Date(row[17] || Date.now()),
    };
  }

  /**
   * Convert IPayment object to row data
   */
  private paymentToRow(payment: IPayment): any[] {
    return [
      payment.orderId,
      payment.transactionId,
      payment.customerId,
      payment.amount.toString(),
      payment.currency,
      payment.status,
      payment.paymentMode || '',
      payment.bankReference || '',
      payment.gatewayTransactionId || '',
      payment.responseCode || '',
      payment.responseMessage || '',
      JSON.stringify(payment.rawResponse || {}),
      payment.bookingDay || '',
      payment.customerName || '',
      payment.customerEmail || '',
      payment.customerPhone || '',
      payment.createdAt.toISOString(),
      payment.updatedAt.toISOString(),
    ];
  }

  /**
   * Create a new payment record
   */
  async create(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      const payment: IPayment = {
        orderId: paymentData.orderId || '',
        transactionId: paymentData.transactionId || '',
        customerId: paymentData.customerId || '',
        amount: paymentData.amount || 0,
        currency: paymentData.currency || 'INR',
        status: paymentData.status || PaymentStatus.PENDING,
        paymentMode: paymentData.paymentMode,
        bankReference: paymentData.bankReference,
        gatewayTransactionId: paymentData.gatewayTransactionId,
        responseCode: paymentData.responseCode,
        responseMessage: paymentData.responseMessage,
        rawResponse: paymentData.rawResponse || {},
        createdAt: paymentData.createdAt || new Date(),
        updatedAt: paymentData.updatedAt || new Date(),
      };

      // Check for duplicates
      if (await this.existsByTransactionId(payment.transactionId)) {
        throw new ConflictError('Payment with this transactionId already exists');
      }
      if (await this.existsByOrderId(payment.orderId)) {
        throw new ConflictError('Payment with this orderId already exists');
      }

      await this.sheetsService.appendRow(this.sheetName, this.paymentToRow(payment));
      return payment;
    } catch (error: any) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError('Failed to create payment record', error);
    }
  }

  /**
   * Find payment by transaction ID
   */
  async findByTransactionId(transactionId: string): Promise<IPayment | null> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 1, transactionId);
      if (rowIndex === null || rowIndex === 0) return null;

      const data = await this.sheetsService.getSheetData(this.sheetName);
      return this.rowToPayment(data[rowIndex]);
    } catch (error: any) {
      throw new DatabaseError('Failed to find payment by transaction ID', error);
    }
  }

  /**
   * Find payment by order ID
   */
  async findByOrderId(orderId: string): Promise<IPayment | null> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 0, orderId);
      if (rowIndex === null || rowIndex === 0) return null;

      const data = await this.sheetsService.getSheetData(this.sheetName);
      return this.rowToPayment(data[rowIndex]);
    } catch (error: any) {
      throw new DatabaseError('Failed to find payment by order ID', error);
    }
  }

  /**
   * Find payments by customer ID
   */
  async findByCustomerId(
    customerId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPayment[]> {
    try {
      const data = await this.sheetsService.getSheetData(this.sheetName);
      const payments: IPayment[] = [];

      // Skip header row
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === customerId) {
          payments.push(this.rowToPayment(data[i]));
        }
      }

      // Sort by createdAt descending
      payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return payments.slice(skip, skip + limit);
    } catch (error: any) {
      throw new DatabaseError('Failed to find payments by customer ID', error);
    }
  }

  /**
   * Update payment status
   */
  async updateStatus(
    transactionId: string,
    status: PaymentStatus,
    updateData: Partial<IPayment> = {}
  ): Promise<IPayment> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 1, transactionId);
      if (rowIndex === null || rowIndex === 0) {
        throw new NotFoundError('Payment not found');
      }

      const data = await this.sheetsService.getSheetData(this.sheetName);
      const payment = this.rowToPayment(data[rowIndex]);

      // Validate status transition
      const { isValidStatusTransition } = require('../constants/paymentStatus');
      if (!isValidStatusTransition(payment.status, status)) {
        throw new Error(`Invalid status transition from ${payment.status} to ${status}`);
      }

      // Update payment
      const updatedPayment: IPayment = {
        ...payment,
        status,
        ...updateData,
        updatedAt: new Date(),
      };

      await this.sheetsService.updateRow(this.sheetName, rowIndex, this.paymentToRow(updatedPayment));
      return updatedPayment;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to update payment status', error);
    }
  }

  /**
   * Update payment by transaction ID
   */
  async updateByTransactionId(
    transactionId: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 1, transactionId);
      if (rowIndex === null || rowIndex === 0) {
        throw new NotFoundError('Payment not found');
      }

      const data = await this.sheetsService.getSheetData(this.sheetName);
      const payment = this.rowToPayment(data[rowIndex]);

      const updatedPayment: IPayment = {
        ...payment,
        ...updateData,
        updatedAt: new Date(),
      };

      await this.sheetsService.updateRow(this.sheetName, rowIndex, this.paymentToRow(updatedPayment));
      return updatedPayment;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to update payment', error);
    }
  }

  /**
   * Delete payment by transaction ID
   */
  async delete(transactionId: string): Promise<void> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 1, transactionId);
      if (rowIndex === null || rowIndex === 0) {
        throw new NotFoundError('Payment not found');
      }

      await this.sheetsService.deleteRow(this.sheetName, rowIndex);
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete payment', error);
    }
  }

  /**
   * Count payments by customer ID
   */
  async countByCustomerId(customerId: string): Promise<number> {
    try {
      const payments = await this.findByCustomerId(customerId);
      return payments.length;
    } catch (error: any) {
      throw new DatabaseError('Failed to count payments by customer ID', error);
    }
  }

  /**
   * Count payments by status
   */
  async countByStatus(status: PaymentStatus): Promise<number> {
    try {
      const payments = await this.findByStatus(status);
      return payments.length;
    } catch (error: any) {
      throw new DatabaseError('Failed to count payments by status', error);
    }
  }

  /**
   * Find payments by status
   */
  async findByStatus(
    status: PaymentStatus,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPayment[]> {
    try {
      const data = await this.sheetsService.getSheetData(this.sheetName);
      const payments: IPayment[] = [];

      // Skip header row
      for (let i = 1; i < data.length; i++) {
        if (data[i][5] === status) {
          payments.push(this.rowToPayment(data[i]));
        }
      }

      // Sort by createdAt descending
      payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return payments.slice(skip, skip + limit);
    } catch (error: any) {
      throw new DatabaseError('Failed to find payments by status', error);
    }
  }

  /**
   * Check if payment exists by transaction ID
   */
  async existsByTransactionId(transactionId: string): Promise<boolean> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 1, transactionId);
      return rowIndex !== null && rowIndex > 0;
    } catch (error: any) {
      throw new DatabaseError('Failed to check payment existence', error);
    }
  }

  /**
   * Check if payment exists by order ID
   */
  async existsByOrderId(orderId: string): Promise<boolean> {
    try {
      const rowIndex = await this.sheetsService.findRowByColumn(this.sheetName, 0, orderId);
      return rowIndex !== null && rowIndex > 0;
    } catch (error: any) {
      throw new DatabaseError('Failed to check payment existence', error);
    }
  }
}
