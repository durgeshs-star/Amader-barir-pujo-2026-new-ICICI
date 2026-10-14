/**
 * Anudan Payment Model
 * 
 * Mongoose schema for storing Anudan payment information in MongoDB.
 * Tracks user contributions to different Anudan categories.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAnudanPayment extends Document {
  orderId: string;
  transactionId: string;
  timestamp: string;
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  categories: Array<{
    day: string;
    amount: number;
    items: Array<{
      name: string;
      cost: string;
    }>;
    remark: string;
  }>;
  baseAmount?: number;
  gatewayCharges?: number;
  totalAmount: number;
  // ICICI PG fields
  iciciTxnId?: string;
  iciciPaymentId?: string;
  iciciPaymentMode?: string;
  iciciPaymentDateTime?: string;
  iciciResponseCode?: string;
  // ICICI actual charged amount and fee breakdown
  actualAmountCharged?: number;
  convenienceFee?: number;
  serviceTax?: number;
  othCharge?: number;
  paymentStatus?: 'pending' | 'success' | 'failed' | 'cancelled' | 'abandoned';
  // WhatsApp notification tracking
  whatsappNotificationSent?: boolean;
  whatsappNotificationSentAt?: Date;
  whatsappNotificationError?: string;
  whatsappNotificationClaimedAt?: Date;
  // Email notification tracking
  emailNotificationSent?: boolean;
  emailNotificationSentAt?: Date;
  emailNotificationError?: string;
  emailNotificationClaimedAt?: Date;
  // Anudan state deduction tracking
  anudanStateDeducted?: boolean;
  anudanStateDeductedAt?: Date;
  // Google Sheets logging tracking
  googleSheetsLogged?: boolean;
  googleSheetsLoggedAt?: Date;
  googleSheetsError?: string;
  // Receipts Records logging tracking
  receiptsRecordsLogged?: boolean;
  receiptsRecordsLoggedAt?: Date;
  receiptsRecordsError?: string;
  // Server-side receipt path
  receiptPath?: string;
  // Administrative recovery email tracking
  adminReceiptEmailed?: boolean;
  adminReceiptEmailedAt?: Date;
  adminReceiptEmailError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnudanPaymentSchema = new Schema<IAnudanPayment>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    userInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    categories: [{
      day: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      items: [{
        name: { type: String },
        cost: { type: String },
      }],
      remark: {
        type: String,
        default: '',
      },
    }],
    baseAmount: {
      type: Number,
    },
    gatewayCharges: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // ICICI PG fields
    iciciTxnId: {
      type: String,
    },
    iciciPaymentId: {
      type: String,
    },
    iciciPaymentMode: {
      type: String,
    },
    iciciPaymentDateTime: {
      type: String,
    },
    iciciResponseCode: {
      type: String,
    },
    // ICICI actual charged amount and fee breakdown
    actualAmountCharged: {
      type: Number,
    },
    convenienceFee: {
      type: Number,
    },
    serviceTax: {
      type: Number,
    },
    othCharge: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled', 'abandoned'],
      default: 'pending',
    },
    // WhatsApp notification tracking
    whatsappNotificationSent: {
      type: Boolean,
      default: false,
    },
    whatsappNotificationSentAt: {
      type: Date,
    },
    whatsappNotificationError: {
      type: String,
    },
    whatsappNotificationClaimedAt: {
      type: Date,
    },
    // Email notification tracking
    emailNotificationSent: {
      type: Boolean,
      default: false,
    },
    emailNotificationSentAt: {
      type: Date,
    },
    emailNotificationError: {
      type: String,
    },
    emailNotificationClaimedAt: {
      type: Date,
    },
    // Anudan state deduction tracking
    anudanStateDeducted: {
      type: Boolean,
      default: false,
    },
    anudanStateDeductedAt: {
      type: Date,
    },
    // Google Sheets logging tracking
    googleSheetsLogged: {
      type: Boolean,
      default: false,
    },
    googleSheetsLoggedAt: {
      type: Date,
    },
    googleSheetsError: {
      type: String,
    },
    // Receipts Records logging tracking
    receiptsRecordsLogged: {
      type: Boolean,
      default: false,
    },
    receiptsRecordsLoggedAt: {
      type: Date,
    },
    receiptsRecordsError: {
      type: String,
    },
    // Server-side receipt path
    receiptPath: {
      type: String,
    },
    // Administrative recovery email tracking
    adminReceiptEmailed: {
      type: Boolean,
      default: false,
    },
    adminReceiptEmailedAt: {
      type: Date,
    },
    adminReceiptEmailError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AnudanPaymentSchema.index({ transactionId: 1 });
AnudanPaymentSchema.index({ iciciTxnId: 1 }); // Index for ICICI transaction ID lookup
AnudanPaymentSchema.index({ 'categories.day': 1 });
AnudanPaymentSchema.index({ 'categories.day': 1, 'categories.amount': 1 }); // Compound index for aggregation
AnudanPaymentSchema.index({ paymentStatus: 1 }); // Index for filtering successful payments
AnudanPaymentSchema.index({ createdAt: -1 });

export const AnudanPayment = mongoose.model<IAnudanPayment>('AnudanPayment', AnudanPaymentSchema);
