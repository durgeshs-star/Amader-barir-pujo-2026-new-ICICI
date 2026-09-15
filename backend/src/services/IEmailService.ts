import { EmailOptions } from '../types/contact.types';

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
  sendBhogConfirmationEmail(params: {
    to: string;
    customerName: string;
    day: string;
    date: string;
    bhogTiming: string;
    isFree: boolean;
    totalAmount: number;
    categories: Array<{ title: string; quantity: number }>;
    receiptPath?: string;
  }): Promise<void>;
  sendAnudanConfirmationEmail(params: {
    to: string;
    customerName: string;
    categories: Array<{ day: string; amount: number }>;
    totalAmount: number;
    receiptPath: string;
  }): Promise<void>;
}
