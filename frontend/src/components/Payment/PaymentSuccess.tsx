/**
 * Payment Success Component
 * 
 * Displays a success message after a successful payment.
 * Shows payment details and provides options to continue or view history.
 * For bhog bookings, also displays the receipt with download option.
 * For anudan contributions, displays the anudan receipt with download option.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { API_URL } from '../../config/api';
import SEO from '../ui/SEO';

const BhogReceipt = lazy(() => import('./BhogReceipt'));
const AnudanReceipt = lazy(() => import('./AnudanReceipt'));

interface PaymentSuccessProps {
  orderId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  onContinue?: () => void;
  onViewHistory?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  orderId: propOrderId,
  transactionId: propTransactionId,
  amount: propAmount,
  currency = 'INR',
  onContinue,
  onViewHistory,
}) => {
  const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isBhogBooking, setIsBhogBooking] = useState(false);
  const [isAnudanPayment, setIsAnudanPayment] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(undefined);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(Boolean(propTransactionId || searchParams.get('transactionId')));

  // Get values from URL params if not provided as props
  const orderId = propOrderId || searchParams.get('orderId') || '';
  const transactionId = propTransactionId || searchParams.get('transactionId') || '';
  const amount = propAmount || parseFloat(searchParams.get('amount') || '0');
  const fromBhog = searchParams.get('fromBhog') === 'true';

  useEffect(() => {
    const fromAnudan = searchParams.get('fromAnudan') === 'true';
    
    if (fromBhog) {
      setIsBhogBooking(true);
      if (orderId && orderId.startsWith('ANUDAN-')) {
        setIsAnudanPayment(true);
      }
    }
    
    if (fromAnudan) {
      setIsBhogBooking(true);
      setIsAnudanPayment(true);
    }

    // Fetch receipt data if we have a transactionId
    if (transactionId) {
      fetchReceiptData(transactionId);
    }
  }, [orderId, transactionId, searchParams]);

  const fetchReceiptData = async (txnId: string) => {
    setIsLoadingReceipt(true);
    try {
      let response = await fetch(`${API_URL}/api/anudan/payment/${encodeURIComponent(txnId)}`);
      let paymentType: 'anudan' | 'bhog' = 'anudan';

      // A successful ICICI callback may belong to either payment flow.
      if (response.status === 404) {
        response = await fetch(`${API_URL}/api/bhog/payment/${encodeURIComponent(txnId)}`);
        paymentType = 'bhog';
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const fetchedData = data.data;
          // The URL `amount` param always carries the definitive ICICI-charged total
          // (base + gateway charges) set by the backend before redirecting.
          // Always apply it when present so a stale DB read (race condition where
          // the frontend fetches before Mongoose has fully flushed the save) never
          // causes the receipt to show the lower base amount.
          if (amount > 0) {
            fetchedData.totalAmount = amount;
          }
          setReceiptData(fetchedData);
          setIsAnudanPayment(paymentType === 'anudan');
          setIsBhogBooking(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch receipt data:', error);
      // If fetch fails, still show the receipt with URL params
      if (orderId && transactionId) {
        setReceiptData({
          orderId,
          transactionId,
          categories: [],
          totalAmount: amount,
          timestamp: new Date().toISOString(),
        });
        setIsAnudanPayment(true);
        setIsBhogBooking(true);
      }
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/');
    }
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory();
    } else {
      navigate('/payment/history');
    }
  };

  // A transaction ID always represents a receipt flow. This prevents the generic
  // success card from flashing while the receipt data is being loaded.
  if (isBhogBooking || isLoadingReceipt) {
    const finalTotalAmount = roundCurrency(
      Math.max(Number(receiptData?.totalAmount || 0), Number(amount || 0))
    );

    return (
    <div className="min-h-screen px-4 py-8">
      <SEO title="Payment Successful" robots="noindex,follow" />
      <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              {isAnudanPayment ? 'Anudan Contribution Successful!' : 'Bhog Booking Successful!'}
            </h2>
          </div>

          {/* Receipt */}
          {isLoadingReceipt ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600 text-center">Loading receipt...</p>
            </div>
          ) : isAnudanPayment ? (
            <Suspense fallback={<p className="mt-2 text-gray-600 text-center">Loading receipt...</p>}>
              <AnudanReceipt
                receiptData={receiptData ? {
                  ...receiptData,
                  totalAmount: finalTotalAmount,
                } : undefined}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<p className="mt-2 text-gray-600 text-center">Loading receipt...</p>}>
              <BhogReceipt
                receiptData={receiptData ? {
                  orderId: receiptData.orderId,
                  transactionId: receiptData.transactionId,
                title: receiptData.bookings?.[0]?.day || 'Bhog Booking',
                categories: (receiptData.categories?.length ? receiptData.categories : receiptData.bookings || []).map((booking: any, index: number) => ({
                  id: booking.id || `booking-${index}`,
                  title: booking.title || booking.day,
                  price: roundCurrency(Number(booking.price ?? (booking.quantity ? booking.amount / booking.quantity : booking.amount)) || 0),
                  description: booking.description || booking.remark || '',
                  max: booking.quantity || 0,
                  quantity: booking.quantity || 0,
                })),
                totalAmount: finalTotalAmount,
                // Pass through ICICI fee breakdown fields
                actualAmountCharged: receiptData.actualAmountCharged,
                convenienceFee: receiptData.convenienceFee,
                serviceTax: receiptData.serviceTax,
                othCharge: receiptData.othCharge,
                totalCount: (receiptData.categories?.length ? receiptData.categories : receiptData.bookings || []).reduce(
                  (total: number, category: any) => total + (category.quantity || 0),
                  0
                ),
                timestamp: receiptData.timestamp,
                userInfo: receiptData.userInfo,
                requiresIdVerification: (receiptData.categories || []).some((category: any) => {
                  const categoryId = String(category.id || '').toLowerCase();
                  return category.quantity > 0 && (categoryId === 'children-0-5' || categoryId.includes('senior'));
                }),
              } : undefined}
            />
            </Suspense>
          )}

          {/* Action Buttons */}
          <div className="max-w-md mx-auto mt-8 space-y-3">
            <button
              onClick={handleContinue}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
            >
              Continue to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular payment success
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO title="Payment Successful" robots="noindex,follow" />
      <div className="max-w-md w-full rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your transaction has been completed successfully.
        </p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold text-gray-900">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">
                {currency} {amount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
          >
            Continue
          </button>
          <button
            onClick={handleViewHistory}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            View Payment History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
