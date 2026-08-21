/**
 * PDF Receipt Generation Service
 * Generates payment receipts for Anudan and Bhog payments
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

interface AnudanPayment {
  orderId: string;
  transactionId: string;
  timestamp: string;
  userInfo: UserInfo;
  categories: Array<{
    day: string;
    amount: number;
    remark?: string;
    items?: Array<{ name: string; cost: string }>;
  }>;
  baseAmount?: number;
  gatewayCharges?: number;
  totalAmount: number;
  actualAmountCharged?: number;
  convenienceFee?: number;
  serviceTax?: number;
  othCharge?: number;
  iciciTxnId?: string;
  iciciPaymentId?: string;
  iciciPaymentMode?: string;
  iciciPaymentDateTime?: string;
}

interface BhogPayment {
  orderId: string;
  transactionId: string;
  timestamp: string;
  userInfo: UserInfo;
  bookings?: Array<{
    day: string;
    amount: number;
    quantity: number;
    remark?: string;
  }>;
  categories?: Array<{
    id: string;
    title: string;
    description?: string;
    price: number;
    quantity: number;
  }>;
  baseAmount?: number;
  gatewayCharges?: number;
  totalAmount: number;
  actualAmountCharged?: number;
  convenienceFee?: number;
  serviceTax?: number;
  othCharge?: number;
  iciciTxnId?: string;
  iciciPaymentId?: string;
  iciciPaymentMode?: string;
  iciciPaymentDateTime?: string;
}

export class ReceiptService {
  private receiptsDir: string;

  constructor() {
    // Create receipts directory if it doesn't exist
    this.receiptsDir = path.join(process.cwd(), 'receipts');
    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  /**
   * Generate Anudan payment receipt PDF
   */
  async generateAnudanReceipt(payment: AnudanPayment): Promise<string> {
    const fileName = `anudan-receipt-${payment.orderId}-${Date.now()}.pdf`;
    const filePath = path.join(this.receiptsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Amader Barir Pujo 2026', { align: 'center' });
        doc.fontSize(16).text('Anudan Contribution Receipt', { align: 'center' });
        doc.moveDown();

        // Receipt details
        doc.fontSize(12);
        doc.text(`Receipt Date: ${this.formatDate(payment.timestamp)}`);
        doc.text(`Order ID: ${payment.orderId}`);
        doc.text(`Transaction ID: ${payment.transactionId}`);
        if (payment.iciciTxnId) {
          doc.text(`ICICI Transaction ID: ${payment.iciciTxnId}`);
        }
        doc.moveDown();

        // User information
        doc.fontSize(14).text('Contributor Details:', { underline: true });
        doc.fontSize(12);
        doc.text(`Name: ${payment.userInfo.name}`);
        doc.text(`Phone: ${payment.userInfo.phone}`);
        doc.text(`Email: ${payment.userInfo.email}`);
        doc.moveDown();

        // Contribution details
        doc.fontSize(14).text('Contribution Details:', { underline: true });
        doc.fontSize(12);

        let totalContribution = 0;
        payment.categories.forEach((category) => {
          doc.text(`${category.day}: ₹${category.amount.toFixed(2)}`);
          if (category.remark) {
            doc.text(`  Remark: ${category.remark}`, { indent: 20 });
          }
          if (category.items && category.items.length > 0) {
            category.items.forEach((item) => {
              doc.text(`  - ${item.name}: ${item.cost}`, { indent: 20 });
            });
          }
          totalContribution += category.amount;
        });

        doc.moveDown();

        // Payment breakdown
        doc.fontSize(14).text('Payment Breakdown:', { underline: true });
        doc.fontSize(12);
        doc.text(`Base Amount: ₹${(payment.baseAmount || totalContribution).toFixed(2)}`);
        if (payment.gatewayCharges && payment.gatewayCharges > 0) {
          doc.text(`Gateway Charges: ₹${payment.gatewayCharges.toFixed(2)}`);
        }
        if (payment.convenienceFee && payment.convenienceFee > 0) {
          doc.text(`Convenience Fee: ₹${payment.convenienceFee.toFixed(2)}`);
        }
        if (payment.serviceTax && payment.serviceTax > 0) {
          doc.text(`Service Tax: ₹${payment.serviceTax.toFixed(2)}`);
        }
        doc.fontSize(14).text(`Total Amount Paid: ₹${(payment.actualAmountCharged || payment.totalAmount).toFixed(2)}`, { underline: true });
        doc.moveDown();

        // Payment method
        if (payment.iciciPaymentMode) {
          doc.fontSize(12).text(`Payment Method: ${payment.iciciPaymentMode}`);
          doc.text(`Payment Date: ${payment.iciciPaymentDateTime || payment.timestamp}`);
        }

        // Footer
        doc.moveDown();
        doc.fontSize(10).text('Thank you for your contribution to Amader Barir Pujo!', { align: 'center' });
        doc.text('This is a computer-generated receipt.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          console.log(`✅ Anudan receipt generated: ${filePath}`);
          resolve(filePath);
        });

        stream.on('error', (error) => {
          console.error('❌ Error generating Anudan receipt:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Error creating Anudan receipt:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate Bhog payment receipt PDF
   */
  async generateBhogReceipt(payment: BhogPayment): Promise<string> {
    const fileName = `bhog-receipt-${payment.orderId}-${Date.now()}.pdf`;
    const filePath = path.join(this.receiptsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Amader Barir Pujo 2026', { align: 'center' });
        doc.fontSize(16).text('Bhog Booking Receipt', { align: 'center' });
        doc.moveDown();

        // Receipt details
        doc.fontSize(12);
        doc.text(`Receipt Date: ${this.formatDate(payment.timestamp)}`);
        doc.text(`Order ID: ${payment.orderId}`);
        doc.text(`Transaction ID: ${payment.transactionId}`);
        if (payment.iciciTxnId) {
          doc.text(`ICICI Transaction ID: ${payment.iciciTxnId}`);
        }
        doc.moveDown();

        // User information
        doc.fontSize(14).text('Customer Details:', { underline: true });
        doc.fontSize(12);
        doc.text(`Name: ${payment.userInfo.name}`);
        doc.text(`Phone: ${payment.userInfo.phone}`);
        doc.text(`Email: ${payment.userInfo.email}`);
        doc.moveDown();

        // Booking details
        doc.fontSize(14).text('Bhog Booking Details:', { underline: true });
        doc.fontSize(12);

        let totalBase = 0;
        const items = payment.categories || payment.bookings || [];
        
        items.forEach((item: any) => {
          if (item.title) {
            // Categories format
            doc.text(`${item.title}: ${item.quantity} x ₹${item.price} = ₹${(item.quantity * item.price).toFixed(2)}`);
            if (item.description) {
              doc.text(`  Description: ${item.description}`, { indent: 20 });
            }
            totalBase += item.quantity * item.price;
          } else {
            // Bookings format
            doc.text(`${item.day}: ${item.quantity} x ₹${item.amount} = ₹${(item.quantity * item.amount).toFixed(2)}`);
            if (item.remark) {
              doc.text(`  Remark: ${item.remark}`, { indent: 20 });
            }
            totalBase += item.quantity * item.amount;
          }
        });

        doc.moveDown();

        // Payment breakdown
        doc.fontSize(14).text('Payment Breakdown:', { underline: true });
        doc.fontSize(12);
        doc.text(`Base Amount: ₹${(payment.baseAmount || totalBase).toFixed(2)}`);
        if (payment.gatewayCharges && payment.gatewayCharges > 0) {
          doc.text(`Gateway Charges: ₹${payment.gatewayCharges.toFixed(2)}`);
        }
        if (payment.convenienceFee && payment.convenienceFee > 0) {
          doc.text(`Convenience Fee: ₹${payment.convenienceFee.toFixed(2)}`);
        }
        if (payment.serviceTax && payment.serviceTax > 0) {
          doc.text(`Service Tax: ₹${payment.serviceTax.toFixed(2)}`);
        }
        doc.fontSize(14).text(`Total Amount Paid: ₹${(payment.actualAmountCharged || payment.totalAmount).toFixed(2)}`, { underline: true });
        doc.moveDown();

        // Payment method
        if (payment.iciciPaymentMode) {
          doc.fontSize(12).text(`Payment Method: ${payment.iciciPaymentMode}`);
          doc.text(`Payment Date: ${payment.iciciPaymentDateTime || payment.timestamp}`);
        }

        // Footer
        doc.moveDown();
        doc.fontSize(10).text('Thank you for your Bhog booking!', { align: 'center' });
        doc.text('This is a computer-generated receipt.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          console.log(`✅ Bhog receipt generated: ${filePath}`);
          resolve(filePath);
        });

        stream.on('error', (error) => {
          console.error('❌ Error generating Bhog receipt:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Error creating Bhog receipt:', error);
        reject(error);
      }
    });
  }

  /**
   * Clean up old receipt files (older than 24 hours)
   */
  async cleanupOldReceipts(): Promise<void> {
    try {
      const files = fs.readdirSync(this.receiptsDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(this.receiptsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up old receipt: ${file}`);
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up receipts:', error);
    }
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Singleton instance
export const receiptService = new ReceiptService();