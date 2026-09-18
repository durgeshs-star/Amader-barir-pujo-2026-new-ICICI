import { EmailOptions } from '../types/contact.types';

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
  sendBhogConfirmationEmail(params: {
    to: string;
    customerName: string;
    customerPhone?: string;
    day: string;
    date: string;
    bhogTiming: string;
    isFree: boolean;
    totalAmount: number;
    categories: Array<{ title: string; quantity: number }>;
    orderId?: string;
    transactionId?: string;
    paymentStatus?: string;
  }): Promise<void>;
  sendAnudanConfirmationEmail(params: {
    to: string;
    customerName: string;
    customerPhone?: string;
    categories: Array<{ day: string; amount: number }>;
    totalAmount: number;
    orderId?: string;
    transactionId?: string;
    paymentStatus?: string;
    paymentDateTime?: string;
  }): Promise<void>;
}
