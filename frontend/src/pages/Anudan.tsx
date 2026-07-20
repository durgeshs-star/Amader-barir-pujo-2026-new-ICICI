import React, { useState, useRef, useEffect } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import SEO from '../components/ui/SEO';
import { AnudanCard } from '../components/ui/AnudanCard';
import { AnudanBasket } from '../components/ui/AnudanBasket';
import { anudanCards } from '../assets/data/anudanData';
import { PageHero } from '../components/common/PageHero';
import UserInfoForm, { type UserInfoFormRef } from '../components/ui/UserInfoForm';
import AnudanReceipt from '../components/Payment/AnudanReceipt';
import { AnudanAmountChangedModal } from '../components/AnudanAmountChangedModal';
import type { AnudanCard as AnudanCardType } from '../types/anudan.types';
import { API_URL } from '../config/api';
import { useAnudanRemaining } from '../hooks/useAnudanRemaining';

interface BasketItem {
  card: AnudanCardType;
  amount: number;
}

export const Anudan: React.FC = () => {
  const userInfoFormRef = useRef<UserInfoFormRef>(null);
  const userInfoSectionRef = useRef<HTMLDivElement>(null);
  
  // Modal state for insufficient amount error
  const [showAmountChangedModal, setShowAmountChangedModal] = useState(false);
  const [modalData, setModalData] = useState<{ remaining: number; requested: number } | null>(null);
  
  // Fetch all remaining amounts
  const [allRemainingAmounts, setAllRemainingAmounts] = useState<Record<string, number>>({});

  // Use SSE hook for real-time remaining amounts (for each category)
  // We'll use the first category as default for the hook
  const defaultCampaignId = anudanCards[0]?.day || 'default';
  const { refresh } = useAnudanRemaining({
    campaignId: defaultCampaignId,
    apiBaseUrl: API_URL,
    enabled: true,
  });

  // Fetch all remaining amounts on mount and periodically
  useEffect(() => {
    const fetchAllRemaining = async () => {
      try {
        const response = await fetch(`${API_URL}/api/anudan/remaining`);
        const data = await response.json();
        if (data.success && data.data && data.data.remainingAmounts) {
          setAllRemainingAmounts(data.data.remainingAmounts);
        }
      } catch (error) {
        console.error('Failed to fetch remaining amounts:', error);
      }
    };

    fetchAllRemaining();
    const interval = setInterval(fetchAllRemaining, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [API_URL]);

  // Basket state
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [showMobileBasket, setShowMobileBasket] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  // User info and payment state
  const [isUserInfoFilled, setIsUserInfoFilled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);


  const addToBasket = (card: AnudanCardType, amount: number) => {
    const existingItemIndex = basket.findIndex(item => item.card.day === card.day);

    if (existingItemIndex !== -1) {
      // Item already in basket, add the new amount to existing amount
      const updatedBasket = [...basket];
      const currentAmount = updatedBasket[existingItemIndex].amount;
      const newTotalAmount = currentAmount + amount;
      
      updatedBasket[existingItemIndex] = { card, amount: newTotalAmount };
      setBasket(updatedBasket);
      setNotification({ show: true, message: 'Anudan amount updated in basket' });
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
    setShowUserInfoForm(true);
    setShowMobileBasket(false);
    // Scroll to user info form
    setTimeout(() => {
      userInfoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePayment = async () => {
    if (!userInfoFormRef.current) return;
    if (!userInfoFormRef.current.validateForm()) return;

    if (basket.length === 0) {
      alert('Your basket is empty');
      return;
    }

    const userInfo = userInfoFormRef.current.getUserInfo();
    setIsProcessing(true);

    // Final pre-payment validation
    try {
      const response = await fetch(`${API_URL}/api/anudan/remaining`);
      const latestData = await response.json();
      
      if (latestData.success && latestData.data && latestData.data.remainingAmounts) {
        let isExceeded = false;
        let exceededItem: { day: string; remaining: number; requested: number } | null = null;
        
        for (const item of basket) {
          const remainingAmount = latestData.data.remainingAmounts[item.card.day] || 0;
          if (item.amount > remainingAmount) {
            exceededItem = { day: item.card.day, remaining: remainingAmount, requested: item.amount };
            isExceeded = true;
            break;
          }
        }
        
        if (isExceeded && exceededItem) {
          setIsProcessing(false);
          // Show modal instead of alert
          setModalData({ remaining: exceededItem.remaining, requested: exceededItem.requested });
          setShowAmountChangedModal(true);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to validate remaining amounts before payment:', e);
      // If the check fails (e.g. network error), we allow it to proceed to backend payment API
    }

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

      const responseData = await response.json();

      if (response.ok) {
        // Clear basket and hide user info form
        setBasket([]);
        setShowUserInfoForm(false);

        // Show receipt directly
        setReceiptData(anudanReceiptData);
        setShowReceipt(true);
      } else if (responseData.errorCode === 'INSUFFICIENT_REMAINING_AMOUNT') {
        // Handle insufficient remaining amount error from backend
        setIsProcessing(false);
        setModalData({ 
          remaining: responseData.remainingAmount, 
          requested: responseData.requestedAmount 
        });
        setShowAmountChangedModal(true);
        return;
      } else {
        throw new Error(responseData.message || 'Failed to record anudan payment');
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
                    remainingAmount={allRemainingAmounts[card.day] || 0}
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

      {/* User Info Form Section */}
      {showUserInfoForm && (
        <div ref={userInfoSectionRef} className="py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8 animate-fade-in-down">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-950 font-fraunces mb-3">
                Complete Your Anudan
              </h2>
              <div className="w-20 h-1 bg-accent mx-auto rounded-full animate-expand-width" />
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              {/* Basket Summary */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-primary font-fraunces mb-4 flex items-center gap-2">
                  🛒 Your Anudan Basket
                  <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    {basket.length}
                  </span>
                </h3>

                {basket.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Your basket is empty
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {basket.map((item) => (
                        <div
                          key={item.card.day}
                          className="flex items-center justify-between p-3 bg-white rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{item.card.day}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary">₹{item.amount.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => removeFromBasket(item.card.day)}
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
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-primary font-fraunces">
                          ₹{basket.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Info Form */}
              <div>
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
                  {isProcessing ? 'Processing...' : `Pay ₹${basket.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-fraunces">Payment Successful!</h3>
                  <p className="text-sm text-gray-600">Your Anudan contribution has been recorded</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setReceiptData(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <AnudanReceipt receiptData={receiptData} />
            </div>
          </m.div>
        </div>
      )}

      {/* Amount Changed Modal */}
      <AnudanAmountChangedModal
        isOpen={showAmountChangedModal}
        remainingAmount={modalData?.remaining || 0}
        requestedAmount={modalData?.requested || 0}
        onAdjust={() => {
          setShowAmountChangedModal(false);
          setModalData(null);
          setBasket([]);
          setShowUserInfoForm(false);
          refresh(); // Refresh remaining amounts
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </LazyMotion>
  );
};

export default Anudan;
