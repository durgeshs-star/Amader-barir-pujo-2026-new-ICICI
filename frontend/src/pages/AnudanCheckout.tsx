import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import SEO from '../components/ui/SEO';
import UserInfoForm, { type UserInfoFormRef } from '../components/ui/UserInfoForm';
import type { AnudanCard as AnudanCardType } from '../types/anudan.types';
import { API_URL } from '../config/api';
import { toast } from 'react-toastify';

interface BasketItem {
  card: AnudanCardType;
  amount: number;
}

export const AnudanCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isUserInfoFilled, setIsUserInfoFilled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const userInfoFormRef = React.useRef<UserInfoFormRef>(null);

  useEffect(() => {
    // If not using state/storage, just redirect since we can't maintain basket across refreshes
    navigate('/anudan');
  }, [navigate]);

  const handleRemoveItem = (cardDay: string) => {
    const updatedBasket = basket.filter(item => item.card.day !== cardDay);
    setBasket(updatedBasket);
  };

  const handlePayment = async () => {
    if (!userInfoFormRef.current) return;
    if (!userInfoFormRef.current.validateForm()) return;

    if (basket.length === 0) {
      toast.error('Your basket is empty');
      return;
    }

    const userInfo = userInfoFormRef.current.getUserInfo();
    setIsProcessing(true);

    // Generate dummy order and transaction IDs
    const orderId = `ANUDAN-${Date.now()}`;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const totalAmount = basket.reduce((sum, item) => sum + item.amount, 0);

    const categories = basket.map(item => ({
      day: item.card.day,
      amount: item.amount,
      items: item.card.items,
      remark: ''
    }));

    try {
      // Call backend to record anudan payment
      const response = await fetch(`${API_URL}/api/anudan/paid-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories,
          userInfo,
          orderId,
          transactionId,
          timestamp
        })
      });

      if (response.ok) {


        // Navigate to payment success page
        window.location.href = `/payment/success?orderId=${orderId}&transactionId=${transactionId}&amount=${totalAmount}&currency=INR&fromAnudan=true`;
      } else {
        throw new Error('Failed to record anudan payment');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = basket.reduce((sum, item) => sum + item.amount, 0);

  return (
    <LazyMotion features={domAnimation} strict>
      <SEO
        title="Anudan Checkout | Amader Barir Pujo"
        description="Complete your Anudan contribution checkout for Amader Barir Pujo 2026."
        canonical="https://www.abp.proplusdatafoundation.com/anudan/checkout"
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary font-fraunces mb-2">
              Complete Your Anudan
            </h1>
            <p className="text-gray-600">Review your contribution and provide your details</p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basket Summary */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-primary font-fraunces mb-4 flex items-center gap-2">
                🛒 Your Anudan Basket
                <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  {basket.length}
                </span>
              </h2>

              {basket.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Your basket is empty
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                    {basket.map((item) => (
                      <div
                        key={item.card.day}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-primary text-sm">{item.card.day}</p>
                          {item.card.items && item.card.items.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {item.card.items.map(i => i.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">₹{item.amount.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => handleRemoveItem(item.card.day)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove from basket"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-primary">Total</span>
                      <span className="text-2xl font-bold text-primary font-fraunces">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => navigate('/anudan')}
                className="w-full mt-4 px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-all"
              >
                ← Add More Anudan
              </button>
            </m.div>

            {/* User Info Form */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-primary font-fraunces mb-4">
                ddgg
              </h2>

              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 text-center">
                  ⚠️ Payment Gateway Integration is in Progress.
                </p>
              </div>

              <UserInfoForm
                ref={userInfoFormRef}
                onFormChange={setIsUserInfoFilled}
              />

              <button
                onClick={handlePayment}
                disabled={!isUserInfoFilled || isProcessing || basket.length === 0}
                className={`w-full mt-4 px-6 py-3 font-semibold rounded-lg transition-all ${
                  !isUserInfoFilled || isProcessing || basket.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                }`}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
              </button>
            </m.div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};

export default AnudanCheckout;
