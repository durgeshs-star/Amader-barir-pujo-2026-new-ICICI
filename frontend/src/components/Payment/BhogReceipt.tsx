/**
 * Bhog Receipt Component
 * 
 * Generates a receipt for bhog bookings with full details.
 * Provides download functionality as PDF with logo and styling.
 */

import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

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
}

interface BhogReceiptProps {
  receiptData?: BhogReceiptData;
}

export const BhogReceipt: React.FC<BhogReceiptProps> = ({ receiptData: propReceiptData }) => {
  const [searchParams] = useSearchParams();
  const receiptRef = useRef<HTMLDivElement>(null);
  const fromBhog = searchParams.get('fromBhog') === 'true';
  
  // Get receipt data from sessionStorage if not provided as prop
  const receiptData = propReceiptData || (fromBhog ? JSON.parse(sessionStorage.getItem('bhogReceipt') || '{}') : null);

  useEffect(() => {
    // Clear sessionStorage after component unmounts
    return () => {
      if (fromBhog) {
        sessionStorage.removeItem('bhogReceipt');
      }
    };
  }, [fromBhog]);

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

  const handleDownloadReceipt = () => {
    if (!receiptRef.current) return;

    const element = receiptRef.current;
    const opt = {
      margin: 10,
      filename: `Receipt-${receiptData.orderId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const 
      },
    };

    // Generate and download PDF
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="bhog-receipt">
      {/* Printable Receipt */}
      <div ref={receiptRef} className="bg-white border-2 border-amber-600 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-amber-600 pb-6 mb-6">
          <img 
            src="/assets/img/Logo-puja.webp" 
            alt="Amader Barir Pujo Logo" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-amber-800 font-serif mb-2">
            অমাদের বাড়ির পুজো
          </h1>
          <h2 className="text-xl text-amber-600 font-serif">Amader Barir Pujo</h2>
          <p className="text-sm text-gray-600 mt-2">Durga Puja 2026 - Wakad, Pune</p>
          <p className="text-xs text-amber-700 mt-1 italic">A Community Initiative by ProPlus Data Foundation</p>
        </div>

        {/* Receipt Details */}
        <div className="mb-6 space-y-2 text-sm">
          <p>
            <strong>Receipt No:</strong> {receiptData.orderId}
          </p>
          <p>
            <strong>Transaction ID:</strong> {receiptData.transactionId}
          </p>
          <p>
            <strong>Date & Time:</strong> {formatDate(receiptData.timestamp)}
          </p>
          <p>
            <strong>Event:</strong> {receiptData.title}
          </p>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-600 text-white">
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.categories.map((category: any) => (
                <tr key={category.id} className="border-b border-gray-200">
                  <td className="px-4 py-2">
                    <div className="font-semibold">{category.title}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                  </td>
                  <td className="px-4 py-2 text-center">{category.quantity}</td>
                  <td className="px-4 py-2 text-right">₹{category.price}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    ₹{category.price * category.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="border-t-2 border-amber-600 pt-4 text-right">
          <p className="text-lg text-gray-600 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-amber-800">₹{receiptData.totalAmount}</p>
          <p className="text-sm text-gray-500 mt-1">
            {receiptData.totalCount} {receiptData.totalCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p className="mb-2">This is a computer-generated receipt. No signature required.</p>
          <p>Thank you for your contribution to Amader Barir Pujo!</p>
          <p className="mt-2">For queries, contact: info@abp.proplusdatafoundation.com</p>
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
