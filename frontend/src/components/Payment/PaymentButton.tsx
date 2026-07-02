/**
 * Payment Button Component
 * 
 * A reusable button component that initiates the payment flow.
 * When clicked, it calls the backend to create an order and redirects to the payment page.
 */

import React, { useState } from 'react';
import axios from 'axios';

interface PaymentButtonProps {
  customerId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
  onSuccess?: (orderId: string, transactionId: string) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  customerId,
  amount,
  currency = 'INR',
  metadata,
  onSuccess,
  onError,
  children = 'Pay Now',
  className = '',
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call backend to create order
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payment/create-order`, {
        customerId,
        amount,
        currency,
        metadata,
      });

      if (response.data.success) {
        const { orderId, transactionId, redirectUrl } = response.data.data;

        // Redirect to payment page
        window.location.href = redirectUrl;

        // Call success callback
        if (onSuccess) {
          onSuccess(orderId, transactionId);
        }
      } else {
        throw new Error('Failed to create payment order');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Payment initiation failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-button">
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
};
