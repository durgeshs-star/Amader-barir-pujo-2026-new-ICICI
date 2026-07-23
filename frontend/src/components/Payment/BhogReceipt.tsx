/**
 * Bhog Receipt Component
 * 
 * Generates a receipt for bhog bookings with full details.
 * Provides download functionality as PDF with logo and styling.
 */

import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';

interface BhogCategory {
  id: string;
  title: string;
  price: number;
  description: string;
  max: number;
  quantity: number;
}

interface BhogReceiptData {
  orderId: string;
  transactionId: string;
  title: string;
  categories: BhogCategory[];
  totalAmount: number;
  totalCount: number;
  timestamp: string;
  userInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  requiresIdVerification?: boolean;
}

interface BhogReceiptProps {
  receiptData?: BhogReceiptData;
}

export const BhogReceipt: React.FC<BhogReceiptProps> = ({ receiptData: propReceiptData }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // If not provided as prop, we don't have it (storage removed)
  const receiptData = propReceiptData || null;

  if (!receiptData || !receiptData.orderId) {
    return null;
  }

  const formatAmount = (amount: number) => Number(amount || 0).toFixed(2);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadReceipt = async () => {
    console.log('Download button clicked');

    if (!receiptRef.current) {
      console.error('Receipt ref is not available');
      toast.error('Unable to generate receipt. Please try again.');
      return;
    }

    console.log('Receipt ref found:', receiptRef.current);
    const element = receiptRef.current;

    const opt = {
      margin: 10,
      filename: `Receipt-${receiptData.orderId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const
      },
    };

    try {
      console.log('Starting PDF generation with options:', opt);
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate receipt. Please try again.');
    }
  };

  // Compute sum of category line items to detect gateway charges
  const lineItemsSum = receiptData.categories.reduce(
    (sum, cat) => sum + cat.price * cat.quantity,
    0
  );
  const gatewayCharges = receiptData.totalAmount - lineItemsSum;
  const hasGatewayCharges = gatewayCharges > 0.005;

  return (
    <div className="bhog-receipt">
      {/* Printable Receipt */}
      <div
        ref={receiptRef}
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #d97706',
          borderRadius: '8px',
          padding: '16px 24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '672px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #d97706', paddingBottom: '12px', marginBottom: '12px' }}>
          <img
            src="/assets/img/Logo-puja.webp"
            alt="Amader Barir Pujo Logo"
            style={{ width: '64px', height: '64px', margin: '0 auto 8px auto' }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#92400e', fontFamily: 'serif', marginBottom: '4px' }}>
            অমাদের বাড়ির পুজো
          </h1>
          <h2 style={{ fontSize: '18px', color: '#d97706', fontFamily: 'serif', marginBottom: '4px' }}>Amader Barir Pujo</h2>
          <p style={{ fontSize: '13px', color: '#4b5563' }}>Durga Puja 2026 - Wakad, Pune</p>
          <p style={{ fontSize: '12px', color: '#b45309', marginTop: '2px', fontStyle: 'italic' }}>An Initiative by <a href="https://proplusdatafoundation.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#b45309', textDecoration: 'underline', cursor: 'pointer' }}>ProPlus Data Foundation</a></p>
          <p style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold' }}>NGO Darpan ID: MH/2025/0627499</p>
        </div>

        {/* Receipt Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Receipt No:</strong> {receiptData.orderId}</p>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Transaction ID:</strong> {receiptData.transactionId}</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px', textAlign: 'right' }}>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Date &amp; Time:</strong> {formatDate(receiptData.timestamp)}</p>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Event:</strong> {receiptData.title}</p>
          </div>
        </div>

        {/* User Information */}
        {receiptData.userInfo && (
          <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Name:</strong> {receiptData.userInfo.name}</p>
              <p style={{ fontSize: '13px', marginBottom: '0' }}><strong>Phone:</strong> {receiptData.userInfo.phone}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', marginBottom: '0' }}><strong>Email:</strong> {receiptData.userInfo.email}</p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div style={{ marginBottom: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#d97706', color: '#ffffff' }}>
                <th style={{ padding: '6px 12px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '6px 12px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '6px 12px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '6px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.categories.map((category: any) => (
                <tr key={category.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '4px 12px' }}>
                    <div style={{ fontWeight: '600' }}>{category.title}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{category.description}</div>
                  </td>
                  <td style={{ padding: '4px 12px', textAlign: 'center' }}>{category.quantity}</td>
                  <td style={{ padding: '4px 12px', textAlign: 'right' }}>₹{formatAmount(category.price)}</td>
                  <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600' }}>
                    ₹{formatAmount(category.price * category.quantity)}
                  </td>
                </tr>
              ))}
              {/* Gateway charges row: rendered when ICICI totalAmount exceeds sum of line items */}
              {hasGatewayCharges && (
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef9ec' }}>
                  <td style={{ padding: '4px 12px' }} colSpan={3}>
                    <div style={{ fontWeight: '600', color: '#b45309' }}>Taxes / Payment Gateway Charges</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Processing fees charged by payment gateway</div>
                  </td>
                  <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600', color: '#b45309' }}>
                    ₹{formatAmount(gatewayCharges)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ borderTop: '2px solid #d97706', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Total Plates: {receiptData.totalCount}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '2px' }}>Total Amount Paid</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>₹{formatAmount(receiptData.totalAmount)}</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '11px', color: '#6b7280' }}>
          <p style={{ marginBottom: '4px' }}>This is a computer-generated receipt. No signature required.</p>
          <p style={{ marginBottom: '4px' }}>Thank you for your contribution to Amader Barir Pujo!</p>
          <p>For queries, contact: info@abp.proplusdatafoundation.com</p>
          {receiptData.requiresIdVerification && (
            <p style={{ marginTop: '8px', color: '#92400e', fontWeight: 'bold' }}>
              * ID card verification is required for children aged 0 to 5 years and senior citizens.
            </p>
          )}
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleDownloadReceipt}
          className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-md flex items-center justify-center mx-auto gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Download Receipt
        </button>
      </div>
    </div>
  );
};

export default BhogReceipt;
