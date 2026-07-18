import React, { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import SEO from '../components/ui/SEO';
import { AnudanCard } from '../components/ui/AnudanCard';
import { AnudanBasket } from '../components/ui/AnudanBasket';
import { anudanCards } from '../assets/data/anudanData';
import { PageHero } from '../components/common/PageHero';
import UserInfoForm, { type UserInfoFormRef } from '../components/ui/UserInfoForm';
import type { AnudanCard as AnudanCardType } from '../types/anudan.types';
import { API_URL } from '../config/api';

interface BasketItem {
  card: AnudanCardType;
  amount: number;
}

export const Anudan: React.FC = () => {
  // Load paid amounts from localStorage — keyed by card.day
  const [paidAmounts] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('anudanPaidAmounts') || '{}');
    } catch {
      return {};
    }
  });

  // Basket state
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [showMobileBasket, setShowMobileBasket] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  // User info modal state
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [isUserInfoFilled, setIsUserInfoFilled] = useState(false);
  const userInfoFormRef = React.useRef<UserInfoFormRef>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToBasket = (card: AnudanCardType, amount: number) => {
    const existingItemIndex = basket.findIndex(item => item.card.day === card.day);

    if (existingItemIndex !== -1) {
      // Item already in basket, update the amount
      const updatedBasket = [...basket];
      updatedBasket[existingItemIndex] = { card, amount };
      setBasket(updatedBasket);
      setNotification({ show: true, message: 'Anudan updated in basket' });
    } else {
      // Add new item to basket
      setBasket([...basket, { card, amount }]);
      setNotification({ show: true, message: 'Anudan added to basket' });
    }
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  const removeFromBasket = (cardDay: string) => {
    setBasket(basket.filter(item => item.card.day !== cardDay));
  };

  const handleCheckout = () => {
    if (basket.length === 0) {
      alert('Your basket is empty');
      return;
    }
    setShowUserInfoModal(true);
  };

  const handlePayment = async () => {
    if (!userInfoFormRef.current) return;
    if (!userInfoFormRef.current.validateForm()) return;

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

    const anudanReceiptData = {
      orderId,
      transactionId,
      categories,
      totalAmount,
      timestamp,
      userInfo
    };

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
        // Store receipt data in sessionStorage
        sessionStorage.setItem('anudanReceipt', JSON.stringify(anudanReceiptData));

        // Update localStorage with paid amounts
        const stored: Record<string, number> = JSON.parse(
          localStorage.getItem('anudanPaidAmounts') || '{}'
        );
        categories.forEach(cat => {
          stored[cat.day] = (stored[cat.day] || 0) + cat.amount;
        });
        localStorage.setItem('anudanPaidAmounts', JSON.stringify(stored));

        // Clear basket
        setBasket([]);
        setShowUserInfoModal(false);

        // Navigate to payment success page
        window.location.href = `/payment/success?orderId=${orderId}&transactionId=${transactionId}&amount=${totalAmount}&currency=INR&fromAnudan=true`;
      } else {
        throw new Error('Failed to record anudan payment');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <SEO
        title="Anudan | Amader Barir Pujo"
        description="Offer your Anudan (অনুদান) to Amader Barir Pujo 2026 in Wakad, Pune. Support devotional services, sacred festivals, Bhog distribution, and spiritual community programs through your generous contribution."
        keywords="Anudan Durga Puja Pune, Durga Puja donation, Amader Barir Pujo contribution, Puja items sponsorship, Bengali festival donation Wakad, seva donation Pune"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/anudan"
      />
      <PageHero
        title="Anudan"
        subtitle="Durga Pujo 2026 · Offer Your Contribution"
        backgroundImage="/assets/img/culture-2.webp"
        height="h-[45vh] md:h-[70vh]"
      />

      {/* Intro Section */}
      <section className="py-14 md:py-20 bg-light-bg/60">
        <div className="max-w-4xl mx-auto px-6">
          {/* Payment Gateway Disclaimer */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm font-semibold text-center">
              ⚠️ Payment Gateway Integration is in Progress.
            </p>
          </div>

          <div className="text-center mb-8 animate-fade-in-down">
            <p className="text-lg md:text-xl text-secondary leading-relaxed md:leading-loose font-medium">
              🙏 Offer Your Anudan (অনুদান) – Support the Spirit of Amader Barir Pujo
            </p>
          </div>
          <m.div
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:scale-[1.02] transition-transform duration-300"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-base text-secondary leading-relaxed mb-6">
              Durga Pujo is a celebration of devotion, tradition, and togetherness. We warmly invite you to participate in our Pujo by making an Anudan (অনুদান) towards the various items and arrangements that make this sacred festival possible.
            </p>
            <div className="space-y-6">
              <p className="text-base text-secondary leading-relaxed">
                Whether you choose to contribute towards flowers, bhog, sarees, chandmala, decorations, or other Pujo essentials, your offering becomes a meaningful part of the rituals and celebrations.
              </p>
              <m.div
                className="pt-4 bg-linear-to-r from-primary/5 to-accent/5 rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-primary font-fraunces mb-3 flex items-center gap-2">
                  <m.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🪔
                  </m.span>
                  How You Can Participate
                </h3>
                <p className="text-base text-secondary leading-relaxed">
                  Browse our list of Pujo items and select an offering that resonates with you. Every contribution, regardless of its value, helps us preserve and celebrate our cherished traditions with devotion and joy.
                </p>
              </m.div>
            </div>
          </m.div>
        </div>
      </section>

      {/* Anudan Cards Section */}
      <section className="py-14 md:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950 font-fraunces mb-3">
              Offerings
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full animate-expand-width" />
          </div>
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            {/* Cards Column */}
            <div className="flex flex-col gap-6">
              {anudanCards && anudanCards?.map((card) => (
                <div key={card.day}>
                  <AnudanCard
                    card={card}
                    paidAmount={paidAmounts[card.day] || 0}
                    onAddToBasket={addToBasket}
                  />
                </div>
              ))}
            </div>

            {/* Basket Column - Desktop Only */}
            <div className="hidden lg:block">
              <AnudanBasket
                items={basket}
                onRemove={removeFromBasket}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Basket Icon */}
      <div className="lg:hidden fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setShowMobileBasket(true)}
          className="relative bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {basket.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              {basket.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Basket Modal */}
      {showMobileBasket && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <m.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-primary font-fraunces">Anudan Basket</h3>
              <button
                onClick={() => setShowMobileBasket(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AnudanBasket
              items={basket}
              onRemove={removeFromBasket}
              onCheckout={handleCheckout}
            />
          </m.div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-32 right-6 lg:hidden bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
        >
          {notification.message}
        </m.div>
      )}

      {/* User Info Modal */}
      {showUserInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-primary font-fraunces">Complete Your Anudan</h3>
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 text-center">
                ⚠️ Payment Gateway Integration is in Progress.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Anudan:</p>
              <div className="space-y-2">
                {basket.map((item) => (
                  <div key={item.card.day} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <span>{item.card.day}</span>
                    <span className="font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t font-bold">
                <span>Total</span>
                <span className="text-primary">₹{basket.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <UserInfoForm
              ref={userInfoFormRef}
              onFormChange={setIsUserInfoFilled}
            />

            <button
              onClick={handlePayment}
              disabled={!isUserInfoFilled || isProcessing}
              className={`w-full mt-4 px-6 py-3 font-semibold rounded-lg transition-all ${
                !isUserInfoFilled || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </m.div>
        </div>
      )}
    </LazyMotion>
  );
};

export default Anudan;
