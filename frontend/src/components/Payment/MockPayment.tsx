/**
 * Mock Payment Component
 * 
 * Simulates a payment gateway page for testing purposes.
 * Displays payment details and provides buttons to simulate success, failure, or cancellation.
 * This is used when PAYMENT_PROVIDER is set to 'mock'.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

export const MockPayment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId') || '';
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      navigate('/');
    }
  }, [transactionId, navigate]);

  const handlePaymentResult = async (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
    setLoading(true);

    try {
      // Call backend callback API
      await axios.post(
        `${API_URL}/api/payment/callback`,
        {
          transactionId,
          status,
          paymentMode: 'CREDIT_CARD',
          bankReference: `MOCK-BANK-${Date.now()}`,
        }
      );

      // Redirect to result page
      if (status === 'SUCCESS') {
        navigate(`/payment/success?transactionId=${transactionId}`);
      } else if (status === 'FAILED') {
        navigate(`/payment/failure?transactionId=${transactionId}`);
      } else {
        navigate(`/payment/failure?transactionId=${transactionId}&errorMessage=Payment was cancelled`);
      }
    } catch (error) {
      console.error('Error processing mock payment:', error);
      navigate(`/payment/failure?transactionId=${transactionId}&errorMessage=Failed to process payment`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mock Payment Gateway</h1>
          <p className="text-gray-600">Simulate payment for testing purposes</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Merchant:</span>
              <span className="font-semibold text-gray-900">Amader Barir Pujo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold text-gray-900 text-sm">{transactionId}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="text-2xl font-bold text-gray-900">₹500.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          <p className="text-center text-gray-600 mb-4">Choose payment result:</p>

          <button
            onClick={() => handlePaymentResult('SUCCESS')}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Pay Successfully
          </button>

          <button
            onClick={() => handlePaymentResult('FAILED')}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Fail Payment
          </button>

          <button
            onClick={() => handlePaymentResult('CANCELLED')}
            disabled={loading}
            className="w-full px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancel Payment
          </button>
        </div>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a mock payment gateway for testing purposes. In production, this will be replaced with the actual ICICI payment gateway.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
