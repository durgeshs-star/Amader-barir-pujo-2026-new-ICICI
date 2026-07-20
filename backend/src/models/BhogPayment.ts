/**
 * Bhog Payment Model
 * 
 * Mongoose schema for storing Bhog payment information in MongoDB.
 * Tracks user bookings for Bhog on different days.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IBhogPayment extends Document {
  orderId: string;
  transactionId: string;
  timestamp: string;
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  bookings: Array<{
    day: string;
    amount: number;
    quantity: number;
    remark: string;
  }>;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BhogPaymentSchema = new Schema<IBhogPayment>(
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
    bookings: [{
      day: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
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

BhogPaymentSchema.index({ transactionId: 1 });
BhogPaymentSchema.index({ 'bookings.day': 1 });
BhogPaymentSchema.index({ createdAt: -1 });

export const BhogPayment = mongoose.model<IBhogPayment>('BhogPayment', BhogPaymentSchema);
