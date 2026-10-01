import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { FaChevronDown, FaTrashAlt, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import SEO from '../components/ui/SEO';
import PageHero from '../components/common/PageHero';
import UserInfoForm, { type UserInfoFormRef } from '../components/ui/UserInfoForm';
import { UNIFIED_BHOG_DAYS, type UnifiedBhogDay } from '../config/pujaConfig';
import { isBookingClosed } from '../utils/bookingUtils';
import { apiService } from '../services/api';

export const BhogBooking: React.FC = () => {
  const location = useLocation();
  const userInfoFormRef = useRef<UserInfoFormRef>(null);
  const mobileUserInfoFormRef = useRef<UserInfoFormRef>(null);
  const userInfoSectionRef = useRef<HTMLDivElement>(null);

  // Accordion state: multiple dropdowns can stay open independently
  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() => ({
    saptami: true,
    ashtami: false,
    sandhiPuja: false,
    navami: false,
  }));

  // Cart state: [dayKey][categoryId] -> quantity
  const [cart, setCart] = useState<Record<string, Record<string, number>>>(() => ({
    saptami: {},
    ashtami: {},
    sandhiPuja: {},
    navami: {},
  }));

  const [isUserInfoFilled, setIsUserInfoFilled] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // If navigated with hash like #navami, open that day
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (hash && UNIFIED_BHOG_DAYS.some(d => d.key.toLowerCase() === hash)) {
      setOpenDays(prev => ({ ...prev, [hash]: true }));
    }
  }, [location.hash]);

  const toggleDayAccordion = (dayKey: string) => {
    setOpenDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.25, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // Audio context may be restricted in some environments
    }
  };

  const handleQuantityChange = (dayKey: string, categoryId: string, value: number, max: number) => {
    const validValue = Math.max(0, Math.min(max, value));
    const previousValue = cart[dayKey]?.[categoryId] || 0;

    if (validValue > previousValue) {
      playNotificationSound();
    }

    setCart(prev => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || {}),
        [categoryId]: validValue,
      },
    }));
  };

  // Calculations
  const calculateCartDetails = () => {
    let totalPlates = 0;
    let totalAmount = 0;
    let hasSeniorOrChild = false;
    let hasNonFree = false;

    const daySummaries: Array<{
      dayConfig: UnifiedBhogDay;
      dayPlates: number;
      dayAmount: number;
      items: Array<{ id: string; title: string; price: number; quantity: number; description?: string }>;
    }> = [];

    UNIFIED_BHOG_DAYS.forEach(dayConfig => {
      const dayCart = cart[dayConfig.key] || {};
      const items: Array<{ id: string; title: string; price: number; quantity: number; description?: string }> = [];
      let dayPlates = 0;
      let dayAmount = 0;

      dayConfig.categories.forEach(cat => {
        const qty = dayCart[cat.id] || 0;
        if (qty > 0) {
          dayPlates += qty;
          dayAmount += qty * cat.price;
          items.push({
            id: cat.id,
            title: cat.title,
            price: cat.price,
            quantity: qty,
            description: cat.description,
          });

          const catId = cat.id.toLowerCase();
          if (catId === 'children-0-5' || catId.includes('senior')) {
            hasSeniorOrChild = true;
          }
          if (cat.price > 0) {
            hasNonFree = true;
          }
        }
      });

      if (dayPlates > 0) {
        daySummaries.push({
          dayConfig,
          dayPlates,
          dayAmount,
          items,
        });
        totalPlates += dayPlates;
        totalAmount += dayAmount;
      }
    });

    const isFreeBooking = totalPlates > 0 && !hasNonFree;

    return {
      daySummaries,
      totalPlates,
      totalAmount: Math.round((totalAmount + Number.EPSILON) * 100) / 100,
      hasSeniorOrChild,
      isFreeBooking,
    };
  };

  const { daySummaries, totalPlates, totalAmount, hasSeniorOrChild, isFreeBooking } = calculateCartDetails();

  const handleClearCart = () => {
    setCart({
      saptami: {},
      ashtami: {},
      sandhiPuja: {},
      navami: {},
    });
    setIsConfirmed(false);
  };

  const handleRemoveDayFromCart = (dayKey: string) => {
    setCart(prev => ({
      ...prev,
      [dayKey]: {},
    }));
  };

  const handleMobileCheckoutClick = () => {
    setShowMobileCart(false);
    requestAnimationFrame(() => {
      userInfoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const getActiveUserInfoRef = () => {
    if (window.innerWidth >= 1024) {
      return userInfoFormRef.current || mobileUserInfoFormRef.current;
    }
    return mobileUserInfoFormRef.current || userInfoFormRef.current;
  };

  const handleSubmitBooking = async () => {
    if (totalPlates === 0) {
      toast.error('Please select at least one Bhog offering to proceed.');
      return;
    }

    const activeForm = getActiveUserInfoRef();
    if (!activeForm) {
      toast.error('Please enter your contact details.');
      return;
    }

    const userInfo = activeForm.getUserInfo();
    if (!userInfo.name || !userInfo.phone || !userInfo.email) {
      toast.error('Please fill in your name, phone number, and email.');
      userInfoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isFreeBooking && !isConfirmed) {
      toast.error('Please confirm the non-refundable checkbox before proceeding.');
      return;
    }

    // Check if any selected day is past cutoff
    for (const summary of daySummaries) {
      if (isBookingClosed(summary.dayConfig.key)) {
        toast.error(`The booking deadline for ${summary.dayConfig.title} has passed.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const bookedDays = daySummaries.map(s => ({
        day: s.dayConfig.title,
        dayKey: s.dayConfig.key,
        amount: s.dayAmount,
        quantity: s.dayPlates,
        categories: s.items,
      }));

      const flatCategories = daySummaries.flatMap(s =>
        s.items.map(item => ({
          id: item.id,
          title: `${item.title} (${s.dayConfig.shortName})`,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          day: s.dayConfig.title,
          dayKey: s.dayConfig.key,
        }))
      );

      const timestamp = new Date().toISOString();
      const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      if (isFreeBooking) {
        // Free booking flow
        const orderId = `FREE-BHG-${suffix}`;
        const transactionId = `FREE-${suffix}`;

        const payload = {
          userInfo,
          bookings: bookedDays,
          categories: flatCategories,
          isFree: true,
          timestamp,
          orderId,
          transactionId,
        };

        const response = await apiService.submitFreeBhogBooking(payload);

        if (response.success) {
          toast.success('Bhog booking registered successfully!');
          const resOrderId = response.data?.orderId || orderId;
          const resTxnId = response.data?.transactionId || transactionId;
          window.location.href = `/payment/success?orderId=${encodeURIComponent(resOrderId)}&transactionId=${encodeURIComponent(resTxnId)}&amount=0&fromBhog=true`;
        } else {
          toast.error(response.error || 'Failed to complete free bhog booking.');
        }
      } else {
        // Paid booking flow via ICICI PG
        const orderId = `BHG-PAID-${suffix}`;
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const payload = {
          userInfo,
          bookings: bookedDays,
          categories: flatCategories,
          isFree: false,
          totalAmount,
          timestamp,
          orderId,
          transactionId,
        };

        const response = await apiService.submitPaidBhogBooking(payload);

        if (response.success && response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          toast.error(response.error || 'Failed to initiate payment.');
        }
      }
    } catch (error: any) {
      console.error('Booking submission error:', error);
      toast.error(error.response?.data?.error || error.message || 'An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-24 lg:pb-20">
      <LazyMotion features={domAnimation} strict>
        <SEO
          title="Bhog Booking | Amader Barir Pujo 2026"
          description="Book your sacred Prasad Bhog for Durga Puja 2026 at Amader Barir Pujo, Wakad Pune. Select offerings for Saptami, Ashtami, Sandhi Puja, and Navami in one unified booking."
          keywords="Durga Puja bhog booking Pune, Amader Barir Pujo Bhog, Khichuri Bhog Wakad, Saptami Ashtami Navami Bhog"
          ogImage="/assets/img/banner/1.webp"
          canonical="https://www.abp.proplusdatafoundation.com/bhog-booking"
        />

        <PageHero
          title="Bhog Booking"
          subtitle=" "
          height="h-[35vh] md:h-[50vh]"
        />

        {/* Intro Header */}
        <section className="content-layer pt-8 pb-4">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose text-center">
              Join us in celebrating Durga Pujo through the sacred tradition of Bhog.{' '}
              <strong>Saptami, Ashtami, Sandhi Puja, and Navami</strong> — four days of soulful offerings, shared with love.
            </p>
          </div>
        </section>

        {/* Main Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Bhog Days Dropdown Accordions (7 Columns on Desktop, Full on Mobile) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="flex items-center justify-center lg:justify-start pb-2 border-b border-primary/20">
                <h2 className="text-xl md:text-2xl font-bold font-fraunces text-primary text-center lg:text-left w-full">
                  Bhog Booking
                </h2>
              </div>

              {UNIFIED_BHOG_DAYS.map((dayConfig) => {
                const isOpen = !!openDays[dayConfig.key];
                const isClosed = isBookingClosed(dayConfig.key);
                const dayCart = cart[dayConfig.key] || {};
                const daySelectedPlates = dayConfig.categories.reduce(
                  (sum, cat) => sum + (dayCart[cat.id] || 0),
                  0
                );
                const daySelectedAmount = dayConfig.categories.reduce(
                  (sum, cat) => sum + ((dayCart[cat.id] || 0) * cat.price),
                  0
                );

                return (
                  <div
                    key={dayConfig.key}
                    id={dayConfig.key}
                    className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${isOpen
                      ? 'border-primary/50 bg-white ring-1 ring-primary/20'
                      : 'border-[#e8d5b5] bg-[rgb(248,233,206)]/75 hover:bg-[rgb(248,233,206)] hover:border-primary/40'
                      }`}
                  >
                    {/* Dropdown Header Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleDayAccordion(dayConfig.key)}
                      className={`w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer border-0 focus:outline-none touch-manipulation transition-colors duration-200 ${isOpen ? 'bg-white' : 'bg-transparent'
                        }`}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm ${isOpen ? 'bg-primary' : 'bg-primary/90'
                          }`}>
                          {dayConfig.shortName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold font-fraunces text-primary leading-snug">
                              {dayConfig.title}
                            </h3>
                            {isClosed && (
                              <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded-full border border-red-200">
                                Closed
                              </span>
                            )}
                          </div>
                          {daySelectedPlates > 0 && (
                            <div className="mt-1">
                              <span className="inline-block px-2.5 py-0.5 bg-primary text-white text-[11px] sm:text-xs font-semibold rounded-md shadow-xs">
                                {daySelectedPlates} {daySelectedPlates === 1 ? 'plate' : 'plates'} (₹{daySelectedAmount})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${isOpen ? 'bg-primary/10 text-primary rotate-180' : 'bg-white/80 text-primary border border-primary/20 shadow-xs'
                          }`}>
                          <FaChevronDown size={12} />
                        </div>
                      </div>
                    </button>

                    {/* Dropdown Content Panel */}
                    {isOpen && (
                      <div className="p-4 sm:p-6 border-t border-amber-100/80 bg-white animate-fade-in">
                        <div className="mb-4">
                          <p className="text-xs font-bold text-accent-text uppercase tracking-widest">
                            {dayConfig.subtitle}
                          </p>
                          <p className="text-sm text-secondary mt-0.5">{dayConfig.description}</p>
                        </div>

                        {isClosed ? (
                          <div className="py-6 text-center bg-red-50/50 rounded-xl border border-red-200">
                            <FaExclamationTriangle className="mx-auto text-red-500 text-2xl mb-2" />
                            <p className="text-sm font-bold text-red-800">
                              Bookings for {dayConfig.title} are closed
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              The booking deadline for {dayConfig.title} has passed.
                            </p>
                          </div>
                        ) : (
                          /* Categories Grid */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {dayConfig.categories.map((category) => {
                              const qty = dayCart[category.id] || 0;
                              const isMax = qty >= category.max;
                              const isMin = qty <= 0;

                              return (
                                <div
                                  key={category.id}
                                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${qty > 0
                                    ? 'border-primary bg-amber-50/40 ring-1 ring-primary/20'
                                    : 'border-gray-200 bg-white hover:border-amber-300'
                                    }`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                      <h4 className="text-sm font-bold text-primary leading-tight">
                                        {category.title}
                                      </h4>
                                      <span className="text-sm font-extrabold text-primary font-fraunces flex-shrink-0">
                                        {category.price === 0 ? 'FREE' : `₹${category.price}`}
                                      </span>
                                    </div>
                                    {category.description && (
                                      <p className="text-[11px] text-gray-500 mb-3">
                                        {category.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Counter Control */}
                                  <div className="flex items-center justify-end pt-2 border-t border-gray-100 mt-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleQuantityChange(dayConfig.key, category.id, qty - 1, category.max)}
                                        disabled={isMin}
                                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-base sm:text-sm transition-colors duration-150 border disabled:opacity-30 disabled:cursor-not-allowed bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 active:bg-gray-200 touch-manipulation cursor-pointer"
                                        aria-label={`Decrease quantity of ${category.title} for ${dayConfig.title}`}
                                      >
                                        −
                                      </button>
                                      <span className="w-7 text-center font-bold text-sm text-primary">
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuantityChange(dayConfig.key, category.id, qty + 1, category.max)}
                                        disabled={isMax}
                                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-base sm:text-sm transition-colors duration-150 border disabled:opacity-30 disabled:cursor-not-allowed bg-primary text-white border-primary hover:bg-primary-dark active:bg-primary-dark touch-manipulation cursor-pointer"
                                        aria-label={`Increase quantity of ${category.title} for ${dayConfig.title}`}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile Checkout / User Info Form Section (Visible on Mobile Below Dropdowns) */}
              <div ref={userInfoSectionRef} className="block lg:hidden mt-8 pt-4">
                <div className="rounded-2xl border border-primary/20 bg-white p-5 shadow-lg">
                  <h3 className="text-xl font-bold font-fraunces text-primary mb-3">
                    Contact & Booking Details
                  </h3>

                  {totalPlates === 0 ? (
                    <div className="py-6 text-center text-gray-500 space-y-1">
                      <p className="text-xs text-gray-500">
                        Please select at least one Bhog offering above to proceed.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Day summary preview on mobile */}
                      <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-primary pb-1 border-b border-amber-200/50">
                          <span>Total Offerings Selected</span>
                          <span>{totalPlates} {totalPlates === 1 ? 'plate' : 'plates'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-primary pt-1">
                          <span>Total Amount</span>
                          <span className="text-lg font-fraunces">₹{totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* ID Verification Warning */}
                      {hasSeniorOrChild && (
                        <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-blue-950">
                            <FaShieldAlt className="text-blue-600 text-sm flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-bold">ID Card Verification Required</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-blue-900 leading-relaxed">
                            ID card verification is mandatory at Pandal for children aged 0 to 5 years and senior citizens.
                          </p>
                        </div>
                      )}

                      {/* User Info Form */}
                      <UserInfoForm
                        ref={mobileUserInfoFormRef}
                        onFormChange={setIsUserInfoFilled}
                        disabled={totalPlates === 0}
                      />

                      {/* Non-Refundable Checkbox */}
                      {!isFreeBooking && totalPlates > 0 && (
                        <div className="mt-4">
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              id="bhog-mobile-confirm-checkbox"
                              type="checkbox"
                              checked={isConfirmed}
                              onChange={(e) => setIsConfirmed(e.target.checked)}
                              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0 cursor-pointer"
                            />
                            <span className="text-xs text-gray-700 leading-relaxed">
                              I confirm that I have reviewed my submission and understand that the payment is non-refundable under any circumstances.
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Payment Surcharge Notice */}
                      {!isFreeBooking && totalPlates > 0 && (
                        <div className="mt-3.5 p-3 bg-amber-50 border border-amber-200/80 rounded-lg">
                          <p className="text-[11px] font-bold text-amber-900 leading-relaxed">
                            The final payment amount (including applicable taxes/charges) will be shown on the payment screen.
                          </p>
                        </div>
                      )}

                      {/* Submit / Pay Button */}
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={handleSubmitBooking}
                          disabled={
                            totalPlates === 0 ||
                            !isUserInfoFilled ||
                            (!isFreeBooking && !isConfirmed) ||
                            isSubmitting
                          }
                          className="w-full py-3.5 px-6 bg-gradient-to-r from-primary to-amber-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:from-primary-dark hover:to-amber-800 transition-all duration-200 flex items-center justify-center gap-2 border-0 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer touch-manipulation"
                        >
                          {isSubmitting ? (
                            <span>Processing Booking...</span>
                          ) : isFreeBooking ? (
                            <span>Book Now (Free — {totalPlates} Plates)</span>
                          ) : (
                            <span>Proceed to Payment (₹{totalAmount.toFixed(2)})</span>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Cart & Checkout (Desktop Only - 5 Columns) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-white p-5 sm:p-6 shadow-lg">

                {/* Cart Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-primary/15">
                  <h3 className="text-xl font-bold font-fraunces text-primary flex items-center gap-2">
                    <span>🛒</span>
                    Bhog Booking Cart
                  </h3>
                  {totalPlates > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors bg-transparent border-0 cursor-pointer"
                    >
                      <FaTrashAlt size={10} />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="py-4">
                  {totalPlates === 0 ? (
                    <div className="py-4 text-center text-gray-500 space-y-2">
                      <p className="text-sm font-medium">No Bhog offerings selected yet.</p>
                      <p className="text-xs text-gray-400">
                        Open any Bhog day on the left to add plates to your unified cart.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                      {daySummaries.map(summary => (
                        <div
                          key={summary.dayConfig.key}
                          className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-accent" />
                              {summary.dayConfig.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDayFromCart(summary.dayConfig.key)}
                              className="text-[11px] text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                              title="Remove this day's selections"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {summary.items.map(item => (
                              <div key={item.id} className="flex justify-between items-center text-xs text-gray-700">
                                <span>
                                  {item.title} <strong className="text-primary">×{item.quantity}</strong>
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {item.price === 0 ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-amber-200/50 flex justify-between items-center text-xs font-bold text-amber-900">
                            <span>Day Subtotal:</span>
                            <span>₹{summary.dayAmount.toFixed(2)} ({summary.dayPlates} plates)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Calculation */}
                {totalPlates > 0 && (
                  <div className="pt-3 border-t border-primary/15 space-y-2">
                    <div className="flex justify-between items-center text-sm text-secondary">
                      <span>Total Plates:</span>
                      <span className="font-bold text-primary">{totalPlates} plates</span>
                    </div>
                    <div className="flex justify-between items-center text-lg sm:text-xl font-bold font-fraunces text-primary">
                      <span>Base Amount:</span>
                      <span className="text-2xl text-primary font-fraunces">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* ID Verification Warning Banner */}
                {hasSeniorOrChild && (
                  <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <FaShieldAlt className="text-blue-600 text-sm flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-bold">ID Card Verification Required</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-blue-900 leading-relaxed">
                      ID card verification is mandatory at Pandal for children aged 0 to 5 years and senior citizens.
                    </p>
                  </div>
                )}

                {/* User Information Form */}
                <div className="pt-4 border-t border-gray-100">
                  <UserInfoForm
                    ref={userInfoFormRef}
                    onFormChange={setIsUserInfoFilled}
                    disabled={totalPlates === 0}
                  />
                </div>

                {/* Non-Refundable Checkbox */}
                {totalPlates > 0 && !isFreeBooking && (
                  <div className="mt-4">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        id="bhog-unified-confirm-checkbox"
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700 leading-relaxed">
                        I confirm that I have reviewed my submission and understand that the payment is non-refundable under any circumstances.
                      </span>
                    </label>
                  </div>
                )}

                {/* Payment Gateway Surcharge Notice */}
                {totalPlates > 0 && !isFreeBooking && (
                  <div className="mt-3.5 p-3 bg-amber-50 border border-amber-200/80 rounded-lg">
                    <p className="text-[11px] font-bold text-amber-900 leading-relaxed">
                      The final payment amount (including applicable taxes/charges) will be shown on the payment screen.
                    </p>
                  </div>
                )}

                {/* Single Unified Submit / Payment Button */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    disabled={
                      totalPlates === 0 ||
                      !isUserInfoFilled ||
                      (!isFreeBooking && !isConfirmed) ||
                      isSubmitting
                    }
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-primary to-amber-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:from-primary-dark hover:to-amber-800 transition-all duration-200 flex items-center justify-center gap-2 border-0 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Processing Booking...</span>
                    ) : isFreeBooking ? (
                      <span>Book Now (Free — {totalPlates} Plates)</span>
                    ) : (
                      <span>Proceed to Payment (₹{totalAmount.toFixed(2)})</span>
                    )}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Mobile Floating Cart Button */}
        {totalPlates > 0 && (
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowMobileCart(true)}
              className="bg-primary text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-3 border-2 border-accent cursor-pointer"
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2.5 -right-2.5 min-w-[20px] h-5 px-1 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {totalPlates}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight uppercase tracking-wider">View Cart</span>
                <span className="text-xs font-medium text-amber-200 leading-tight">
                  ₹{totalAmount.toFixed(2)} ({totalPlates} {totalPlates === 1 ? 'plate' : 'plates'})
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Mobile Cart Modal with Scrollable Items & Always-Visible Proceed to Pay Footer */}
        {showMobileCart && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <m.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl bg-[rgb(248,233,206)] p-5 sm:p-6 shadow-2xl border border-primary/20 flex flex-col"
            >
              {/* Modal Header - Fixed */}
              <div className="flex justify-between items-center pb-3 border-b border-primary/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛒</span>
                  <h3 className="text-xl font-bold text-primary font-fraunces">Bhog Booking Cart</h3>
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalPlates}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileCart(false)}
                  className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer border-0"
                  aria-label="Close cart"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Items Container */}
              {totalPlates === 0 ? (
                <div className="py-8 text-center text-gray-600 space-y-2 flex-1">
                  <p className="text-sm font-medium">Your Bhog cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto max-h-[50vh] pr-1 space-y-3 min-h-0 my-3">
                    {daySummaries.map(summary => (
                      <div
                        key={summary.dayConfig.key}
                        className="p-3.5 rounded-xl bg-white/90 border border-amber-200/80 shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-primary uppercase tracking-wide">
                            {summary.dayConfig.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDayFromCart(summary.dayConfig.key)}
                            className="text-[11px] text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer font-medium"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-1">
                          {summary.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-xs text-gray-700">
                              <span>
                                {item.title} <strong className="text-primary">×{item.quantity}</strong>
                              </span>
                              <span className="font-semibold text-gray-900">
                                {item.price === 0 ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-amber-200/50 flex justify-between items-center text-xs font-bold text-amber-900">
                          <span>Day Subtotal:</span>
                          <span>₹{summary.dayAmount.toFixed(2)} ({summary.dayPlates} plates)</span>
                        </div>
                      </div>
                    ))}

                    {/* ID Warning */}
                    {hasSeniorOrChild && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-blue-950">
                          <FaShieldAlt className="text-blue-600 text-xs flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-bold">ID Card Verification Required</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-blue-900 leading-relaxed">
                          ID card verification is mandatory at Pandal for children aged 0 to 5 years and senior citizens.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer - Always Fixed & Visible at the Bottom */}
                  <div className="flex-shrink-0 pt-3 border-t border-primary/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-primary">Total Amount</span>
                      <span className="text-2xl font-bold text-primary font-fraunces">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleMobileCheckoutClick}
                      className="w-full bg-primary text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:bg-primary-dark uppercase tracking-wider text-xs border-0 cursor-pointer touch-manipulation"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </m.div>
          </div>
        )}

      </LazyMotion>
    </div>
  );
};

export default BhogBooking;
