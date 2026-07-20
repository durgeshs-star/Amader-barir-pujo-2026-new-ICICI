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
import { BhogReceipt } from './BhogReceipt';
import { AnudanReceipt } from './AnudanReceipt';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isBhogBooking, setIsBhogBooking] = useState(false);
  const [isAnudanPayment, setIsAnudanPayment] = useState(false);

  // Get values from URL params if not provided as props
  const orderId = propOrderId || searchParams.get('orderId') || '';
  const transactionId = propTransactionId || searchParams.get('transactionId') || '';
  const amount = propAmount || parseFloat(searchParams.get('amount') || '0');
  const fromBhog = searchParams.get('fromBhog') === 'true';

  useEffect(() => {
    if (fromBhog) {
      setIsBhogBooking(true);
      // We can't detect Anudan vs Bhog from receipt if there's no storage,
      // but we can check orderId from URL if available, or just assume it's Anudan
      // if fromAnudan param was passed (though AnudanCheckout passes fromAnudan=true)
      if (orderId && orderId.startsWith('ANUDAN-')) {
        setIsAnudanPayment(true);
      }
    }
    const fromAnudan = searchParams.get('fromAnudan') === 'true';
    if (fromAnudan) {
      setIsBhogBooking(true); // Since UI uses this for the special layout
      setIsAnudanPayment(true);
    }
  }, [fromBhog, orderId, searchParams]);

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

  // If it's a bhog booking, show the receipt
  if (isBhogBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              {isAnudanPayment ? 'Anudan Contribution Successful!' : 'Bhog Booking Successful!'}
            </h2>
            <p className="text-gray-600 text-center">
              {isAnudanPayment
                ? 'Thank you for your generous Anudan. Your contribution has been recorded successfully.'
                : 'Thank you for your bhog booking. Your payment has been completed successfully.'}
            </p>
          </div>

          {/* Receipt */}
          {isAnudanPayment ? <AnudanReceipt /> : <BhogReceipt />}

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
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
