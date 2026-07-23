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
  paymentStatus?: 'pending' | 'success' | 'failed' | 'cancelled';
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
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

AnudanPaymentSchema.index({ transactionId: 1 });
AnudanPaymentSchema.index({ 'categories.day': 1 });
AnudanPaymentSchema.index({ createdAt: -1 });

export const AnudanPayment = mongoose.model<IAnudanPayment>('AnudanPayment', AnudanPaymentSchema);
