export interface SendMessagePayload {
  phoneNumber: string;
  message: string;
}

export interface OrderConfirmationPayload {
  customerPhone: string;
  orderId: string;
  orderAmount: number | string;
  customerName?: string;
}

export interface ReminderPayload {
  phoneNumber: string;
  reminderText: string;
  title?: string;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  phone?: string;
  error?: string;
  message?: string;
}

export interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'error';
  message: string;
  timestamp?: Date;
}

export interface PaymentData {
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  orderId: string;
  amount: string | number;
  purpose: string;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
}

export interface PaymentReceipt {
  paymentData: PaymentData;
  pdfFilePath: string;
  receiptGeneratedAt: Date;
}

export interface ICICIPaymentResponse {
  TxnId: string;
  BankTxnId: string;
  OrderId: string;
  Amount: string;
  CurrencyCode: string;
  MerchantId: string;
  ResponseCode: string;
  ResponseDesc: string;
  CheckSum: string;
  FIRSTNAME?: string;
  EMAIL?: string;
  MOBILE?: string;
  PURPOSE?: string;
  AMT?: string;
  RESPCODE?: string;
  [key: string]: string | number | undefined;
}
