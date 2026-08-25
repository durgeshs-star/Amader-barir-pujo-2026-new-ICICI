/**
 * Payment Failure Component
 * 
 * Displays a failure message after a failed payment.
 * Shows error details and provides options to retry or contact support.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../ui/SEO';

interface PaymentFailureProps {
  transactionId?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

export const PaymentFailure: React.FC<PaymentFailureProps> = ({
  transactionId,
  errorMessage = 'Your payment could not be processed. Please try again or contact support.',
  onRetry,
  onContactSupport,
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate(-1);
    }
  };

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      // Navigate to contact page or open email
      window.location.href = 'mailto:support@example.com';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO title="Payment Failed" robots="noindex,follow" />
      <div className="max-w-md w-full rounded-2xl shadow-2xl p-8 text-center">
        {/* Failure Icon */}
        <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        {/* Failure Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          {errorMessage}
        </p>

        {/* Transaction ID (if available) */}
        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold text-gray-900">{transactionId}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={handleContactSupport}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Contact Support
          </button>
        </div>

        {/* Additional Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          If the problem persists, please check your payment details or try a different payment method.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
