/**
 * Anudan Receipt Component
 * 
 * Generates a receipt for Anudan contributions with multiple categories.
 * Provides download functionality as PDF with logo and styling.
 */

import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';
import { CONTACT_EMAIL } from '../../config/constants';

interface AnudanCategory {
  day: string;
  amount: number;
  remark?: string;
  items?: { name: string; cost: string }[];
}

interface AnudanReceiptData {
  orderId: string;
  transactionId: string;
  categories: AnudanCategory[];
  totalAmount: number;
  timestamp: string;
  userInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  // ICICI actual charged amount and fee breakdown
  actualAmountCharged?: number;
  convenienceFee?: number;
  serviceTax?: number;
  othCharge?: number;
}

interface AnudanReceiptProps {
  receiptData?: AnudanReceiptData;
}

export const AnudanReceipt: React.FC<AnudanReceiptProps> = ({ receiptData: propReceiptData }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const receiptData = propReceiptData || null;

  if (!receiptData || !receiptData.orderId) {
    return null;
  }

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
    if (!receiptRef.current) {
      toast.error('Unable to generate receipt. Please try again.');
      return;
    }

    const element = receiptRef.current;

    const opt = {
      margin: 10,
      filename: `AnudanReceipt-${receiptData.orderId}.pdf`,
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
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('html2pdf failed, falling back to browser print:', error);

      try {
        const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
        if (!printWindow) {
          toast.error('Please allow pop-ups to download the receipt.');
          return;
        }

        const printable = element.cloneNode(true) as HTMLElement;
        printable.style.width = '100%';
        printable.style.maxWidth = '700px';
        printable.style.margin = '0 auto';

        printWindow.document.write('<!DOCTYPE html><html><head><title>Anudan Receipt</title><style>' +
          'body{margin:0;padding:24px;background:#fff;color:#111;font-family:Arial,sans-serif;} ' +
          'table{border-collapse:collapse;width:100%;font-size:13px;} ' +
          'th,td{padding:8px 10px;border-bottom:1px solid #e5e7eb;} ' +
          'th{background:#d97706;color:#fff;text-align:left;} ' +
          'p{margin:4px 0;} ' +
          '@media print{body{padding:0;} button{display:none;}}' +
          '</style></head><body>');
        printWindow.document.write(printable.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
      } catch (fallbackError) {
        console.error('Fallback receipt print failed:', fallbackError);
        toast.error('Failed to generate receipt. Please try again.');
      }
    }
  };

  return (
    <div className="anudan-receipt">
      {/* Printable Receipt */}
      <div
        ref={receiptRef}
        style={{
          backgroundColor: 'var(--color-surface)',
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
            src="/assets/img/ABP-Logo.png"
            alt="Amader Bari'r Pujo Logo"
            style={{ width: '240px', height: '80px', margin: '0 auto 8px auto', display: 'block', objectFit: 'contain' }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#92400e', fontFamily: 'serif', marginBottom: '4px' }}>
            অমাদের বাড়ির পুজো
          </h1>
          <h2 style={{ fontSize: '18px', color: '#d97706', fontFamily: 'serif', marginBottom: '4px' }}>Amader Bari'r Pujo</h2>
          <p style={{ fontSize: '13px', color: '#4b5563' }}>Durga Pujo 2026 - Wakad, Pune</p>
          <p style={{ fontSize: '12px', color: '#b45309', marginTop: '2px', fontStyle: 'italic' }}>A ProPlus Data Foundation Initiative</p>
          <p style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold' }}>Darpan ID: MH/2025/0627499</p>
        </div>

        {/* Receipt Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Receipt No:</strong> {receiptData.orderId}</p>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Transaction ID:</strong> {receiptData.transactionId}</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px', textAlign: 'right' }}>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Date & Time:</strong> {formatDate(receiptData.timestamp)}</p>
            <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Type:</strong> Anudan Contribution</p>
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
                <th style={{ padding: '6px 12px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.categories.map((category, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '4px 12px' }}>
                    <div style={{ fontWeight: '600' }}>{category.day}</div>
                    {category.items && category.items.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {category.items.map(item => item.name).join(', ')}
                      </div>
                    )}
                    {category.remark && (
                      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic' }}>Remark: {category.remark}</div>
                    )}
                  </td>
                  <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600' }}>
                    ₹{category.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {/* ICICI fee breakdown: show individual fee components if present */}
              {(() => {
                const convenienceFee = Number((receiptData as any).convenienceFee || 0);
                const serviceTax = Number((receiptData as any).serviceTax || 0);
                const othCharge = Number((receiptData as any).othCharge || 0);
                const feeRows = [];
                
                if (convenienceFee > 0) {
                  feeRows.push(
                    <tr key="convenience-fee" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef9ec' }}>
                      <td style={{ padding: '4px 12px' }}>
                        <div style={{ fontWeight: '600', color: '#b45309' }}>Convenience Fee</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Processing fee charged by payment gateway</div>
                      </td>
                      <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600', color: '#b45309' }}>
                        ₹{convenienceFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                }
                
                if (serviceTax > 0) {
                  feeRows.push(
                    <tr key="service-tax" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef9ec' }}>
                      <td style={{ padding: '4px 12px' }}>
                        <div style={{ fontWeight: '600', color: '#b45309' }}>Service Tax</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Tax component on payment processing</div>
                      </td>
                      <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600', color: '#b45309' }}>
                        ₹{serviceTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                }
                
                if (othCharge > 0) {
                  feeRows.push(
                    <tr key="other-charge" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef9ec' }}>
                      <td style={{ padding: '4px 12px' }}>
                        <div style={{ fontWeight: '600', color: '#b45309' }}>Other Charges</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Additional charges by payment gateway</div>
                      </td>
                      <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600', color: '#b45309' }}>
                        ₹{othCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                }
                
                // If no individual fee components but there's a difference, show as gateway charges
                if (feeRows.length === 0) {
                  const lineItemsSum = receiptData.categories.reduce(
                    (sum, cat) => sum + (Number(cat.amount) || 0),
                    0
                  );
                  const actualTotal = Number((receiptData as any).actualAmountCharged || receiptData.totalAmount);
                  const gatewayCharges = actualTotal - lineItemsSum;
                  
                  if (gatewayCharges > 0.005) {
                    feeRows.push(
                      <tr key="gateway-charges" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef9ec' }}>
                        <td style={{ padding: '4px 12px' }}>
                          <div style={{ fontWeight: '600', color: '#b45309' }}>Taxes / Payment Gateway Charges</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Processing fees charged by payment gateway</div>
                        </td>
                        <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '600', color: '#b45309' }}>
                          ₹{gatewayCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  }
                }
                
                return feeRows;
              })()}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ borderTop: '2px solid #d97706', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              {receiptData.categories.length} {receiptData.categories.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '2px' }}>Total Anudan Paid</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
              ₹{(() => {
                const baseAmount = receiptData.categories.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0);
                const convenienceFee = Number((receiptData as any).convenienceFee || 0);
                const serviceTax = Number((receiptData as any).serviceTax || 0);
                const othCharge = Number((receiptData as any).othCharge || 0);
                const totalAmount = baseAmount + convenienceFee + serviceTax + othCharge;
                return totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '11px', color: '#6b7280' }}>
          <p style={{ marginBottom: '4px' }}>This is a computer-generated receipt. No signature required.</p>
          <p style={{ marginBottom: '4px' }}>Anudan contributions, once made, are non-refundable and non-transferable.</p>
          <p style={{ marginBottom: '4px' }}>Thank you for your generous Anudan contribution to Amader Bari'r Pujo!</p>
          <p>For queries regarding this receipt, contact:  {CONTACT_EMAIL}</p>
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

export default AnudanReceipt;
