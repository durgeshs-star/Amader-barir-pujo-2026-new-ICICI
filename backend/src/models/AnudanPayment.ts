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
  totalAmount: number;
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
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries

AnudanPaymentSchema.index({ transactionId: 1 });
AnudanPaymentSchema.index({ 'categories.day': 1 });
AnudanPaymentSchema.index({ createdAt: -1 });

export const AnudanPayment = mongoose.model<IAnudanPayment>('AnudanPayment', AnudanPaymentSchema);
