/**
 * Payment Pending Component
 * 
 * Displays a pending message while payment is being processed.
 * Shows a loading animation and transaction details.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import SEO from '../ui/SEO';

interface PaymentPendingProps {
  transactionId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  onStatusChange?: (status: string) => void;
}

export const PaymentPending: React.FC<PaymentPendingProps> = ({
  transactionId,
  orderId,
  amount,
  currency = 'INR',
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 30; // Poll for 30 seconds (1 second interval)

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/payment/status/${transactionId}`
        );

        if (response.data.success) {
          const { status } = response.data.data;

          if (onStatusChange) {
            onStatusChange(status);
          }

          // Navigate based on status
          if (status === 'SUCCESS') {
            navigate(`/payment/success?orderId=${orderId}&transactionId=${transactionId}&amount=${amount}&currency=${currency}`);
          } else if (status === 'FAILED') {
            navigate(`/payment/failure?transactionId=${transactionId}`);
          } else if (status === 'CANCELLED') {
            navigate(`/payment/failure?transactionId=${transactionId}&errorMessage=Payment was cancelled`);
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    };

    // Poll every second
    const interval = setInterval(() => {
      if (attempts < maxAttempts) {
        setAttempts(prev => prev + 1);
        pollStatus();
      } else {
        // Stop polling after max attempts
        clearInterval(interval);
        navigate(`/payment/failure?transactionId=${transactionId}&errorMessage=Payment status check timeout`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [transactionId, orderId, amount, currency, attempts, navigate, onStatusChange]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO title="Payment Processing" robots="noindex,follow" />
      <div className="max-w-md w-full rounded-2xl shadow-2xl p-8 text-center">
        {/* Loading Animation */}
        <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
          <svg className="animate-spin w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        {/* Pending Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Processing Payment
        </h2>
        <p className="text-gray-600 mb-6">
          Please wait while we process your payment. This may take a few seconds.
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

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Checking payment status...</span>
            <span>{attempts}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(attempts / maxAttempts) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-sm text-gray-500">
          Please do not close this window while your payment is being processed.
        </p>
      </div>
    </div>
  );
};

export default PaymentPending;
