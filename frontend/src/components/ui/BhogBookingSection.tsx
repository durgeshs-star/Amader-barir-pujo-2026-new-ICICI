import React, { useState, useRef } from 'react';
import BhogBookingCard from './BhogBookingCard';
import UserInfoForm from './UserInfoForm';
import type { UserInfoFormRef } from './UserInfoForm';
import type { BhogBookingSectionProps, BhogBookingState } from '../../types/bhog';
import { API_URL } from '../../config/api';
import { toast } from 'react-toastify';

export const BhogBookingSection: React.FC<BhogBookingSectionProps> = ({
  title,
  subtitle,
  description,
  categories,
  disclaimer,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const [bookings, setBookings] = useState<BhogBookingState>(() => {
    const initialState: BhogBookingState = {};
    categories.forEach((cat) => {
      initialState[cat.id] = 0;
    });
    return initialState;
  });

  const userInfoFormRef = React.useRef<UserInfoFormRef>(null);
  const [isUserInfoFilled, setIsUserInfoFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleValueChange = (categoryId: string, value: number) => {
    setBookings((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const calculateTotal = () => {
    let totalAmount = 0;
    let totalCount = 0;

    categories.forEach((cat) => {
      const count = bookings[cat.id] || 0;
      totalCount += count;
      totalAmount += count * cat.price;
    });

    return { totalAmount: roundCurrency(totalAmount), totalCount };
  };

  const { totalAmount, totalCount } = calculateTotal();

  const isFreeBooking = () => {
    const children05Count = bookings['children-0-5'] || 0;
    const otherCategoriesSelected = categories
      .filter(cat => cat.id !== 'children-0-5')
      .some(cat => (bookings[cat.id] || 0) > 0);

    return children05Count > 0 && !otherCategoriesSelected;
  };

  const needsIdVerification = () => {
    const children05Count = bookings['children-0-5'] || 0;
    const seniorCount = bookings['senior-citizens'] || 0;
    return children05Count > 0 || seniorCount > 0;
  };
  // Generate booking summary for mobile
  const getBookingSummary = () => {
    return categories
      .filter(cat => bookings[cat.id] > 0)
      .map(cat => ({
        title: cat.title,
        quantity: bookings[cat.id],
        price: cat.price,
        total: cat.price * bookings[cat.id]
      }));
  };

  const bookingSummary = getBookingSummary();

  const handleBooking = async () => {
    if (!userInfoFormRef.current?.validateForm()) return;
    if (!isFreeBooking() && !isConfirmed) return;

    const selectedCategories = categories
      .filter((category) => (bookings[category.id] || 0) > 0)
      .map((category) => ({
        id: category.id,
        title: category.title,
        price: category.price,
        quantity: bookings[category.id] || 0,
      }));

    if (selectedCategories.length === 0) return;

    setIsLoading(true);
    try {
      const isFree = isFreeBooking();
      const transactionId = `BHG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const orderId = `BHG-ORD-${Date.now()}`;
      const response = await fetch(`${API_URL}/api/bhog/${isFree ? 'free-booking' : 'paid-booking'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          categories: selectedCategories,
          timestamp: new Date().toISOString(),
          isFree,
          userInfo: userInfoFormRef.current.getUserInfo(),
          orderId,
          transactionId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to start your booking. Please try again.');
      }

      if (isFree) {
        const { orderId: freeOrderId, transactionId: freeTransactionId } = result.data;
        window.location.assign(`/payment/success?orderId=${encodeURIComponent(freeOrderId)}&transactionId=${encodeURIComponent(freeTransactionId)}&amount=0&currency=INR&fromBhog=true`);
        return;
      }

      if (!result.paymentUrl) throw new Error('Payment link was not returned. Please try again.');
      window.location.assign(result.paymentUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start your booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="mt-9 p-7 border border-primary/14 rounded-lg bg-rgb(248, 233, 206) shadow-lg lg:mt-9 lg:p-7"
        aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}Title`}
      >
        {/* Mobile Header - Compact */}
        <div className="block lg:flex lg:items-start lg:justify-between lg:gap-4.5 mb-4 lg:mb-6">
          <div>
            {/* Mobile: Compact title */}
            <div className="block lg:hidden mb-4">
              <h4 className="text-3xl font-bold text-primary mb-2 font-fraunces">
                {title}
              </h4>
              <p className="text-base text-gray-600">{description}</p>
            </div>
            
            {/* Desktop: Original layout */}
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-accent-text uppercase tracking-widest">
                {subtitle}
              </p>
              <h4
                id={`${title.replace(/\s+/g, '-').toLowerCase()}Title`}
                className="text-2xl font-bold text-primary mb-2 font-fraunces"
              >
                {title}
              </h4>
              <p className="text-sm text-secondary">{description}</p>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 mb-6">
          {categories.map((category) => (
            <BhogBookingCard
              key={category.id}
              category={category}
              value={bookings[category.id] || 0}
              onValueChange={(value) => handleValueChange(category.id, value)}
            />
          ))}
        </div>
        {/* Mobile Booking Summary */}
        {bookingSummary.length > 0 && (
          <div className="block lg:hidden mb-6 p-4 border-2 border-primary/20 rounded-xl">
            <h3 className="text-xl font-bold text-primary mb-3">Booking Summary</h3>
            <div className="space-y-2">
              {bookingSummary.map((item, index) => (
                <div key={index} className="flex justify-between text-base">
                  <span>{item.title} ×{item.quantity}</span>
                  <span className="font-semibold">₹{item.total}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[rgb(180,160,130)]">
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ID Verification Warning - Compact for mobile */}
        {needsIdVerification() && (
          <div className="mb-6">
            {/* Mobile: Compact alert */}
            <div className="block lg:hidden p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <span className="text-lg">🪪</span>
                <div>
                  <p className="font-semibold text-blue-800 text-sm mb-1">ID Verification Required</p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    {bookings['children-0-5'] > 0 && <li>• Children (0–5 years)</li>}
                    {bookings['senior-citizens'] > 0 && <li>• Senior Citizens</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Desktop: Original layout */}
            <div className="hidden lg:block">
              {disclaimer && (
                <p className="p-3 pl-4 border-l-4 border-accent rounded-lg bg-accent/12 text-secondary text-sm leading-relaxed">
                  {disclaimer}
                </p>
              )}
            </div>
          </div>
        )}

        {/* User Information Form */}
        <UserInfoForm ref={userInfoFormRef} onFormChange={setIsUserInfoFilled} disabled={totalCount === 0} />
        {/* Payment Confirmation Checkbox */}
        {!isFreeBooking() && totalCount > 0 && (
          <div className="mt-4 lg:mt-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="bhog-confirm-checkbox"
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary border-[rgb(180,160,130)] rounded focus:ring-primary flex-shrink-0"
              />
              {/* Mobile: Shorter text */}
              <span className="text-sm text-gray-700 leading-relaxed block lg:hidden">
                I understand that payments are non-refundable.
              </span>
              {/* Desktop: Original text */}
              <span className="text-sm text-gray-700 leading-relaxed hidden lg:block">
                I confirm that I have reviewed my submission and understand that the payment is non-refundable under any circumstances.
              </span>
            </label>
          </div>
        )}

        {/* Payment Disclaimer - Mobile and Desktop */}
        {!isFreeBooking() && totalCount > 0 && (
          <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md lg:rounded-md">
            <p className="text-sm font-bold text-amber-800 text-left leading-relaxed">
              The final payment amount (including applicable taxes/charges) will be shown on the payment screen.
            </p>
          </div>
        )}

        {/* Mobile Payment Button - Right after disclaimer when ready */}
        {totalCount > 0 && isUserInfoFilled && (isFreeBooking() || isConfirmed) && (
          <div className="block lg:hidden mt-4">
            {isFreeBooking() ? (
              <button
                onClick={handleBooking}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-xl border-0 transition-all duration-300 hover:bg-primary/90 flex items-center justify-center space-x-2 h-[52px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Book Bhog</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleBooking}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-xl border-0 transition-all duration-300 hover:bg-primary/90 flex items-center justify-center space-x-2 h-13 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Proceed to Payment</span>
                )}
              </button>
            )}
          </div>
        )}

        {/* Desktop Payment Section - Right-aligned button layout */}
        <div className="hidden lg:block mt-5.5 pt-5.5 border-t border-primary/14">
          <div className="flex items-center justify-between gap-4.5">
            <div>
              <p className="text-base font-bold text-primary mb-0">
                Total:{' '}
                <span className="text-2xl text-primary font-fraunces">₹{totalAmount.toFixed(2)}</span>
              </p>
              <p className="text-sm text-secondary mb-0">
                <span>{totalCount}</span>{' '}
                <span>{totalCount === 1 ? 'booking selected' : 'bookings selected'}</span>
              </p>
            </div>
            <div className="flex-shrink-0">
              {isFreeBooking() ? (
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="min-w-[150px] px-6 py-2.5 bg-primary text-white font-semibold rounded-md border-0 transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Book Bhog'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="min-w-[150px] px-6 py-2.5 bg-primary text-white font-semibold rounded-md border-0 transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              )}
            </div>
            {/* <div className="flex-shrink-0">
  {isFreeBooking() ? (
    <button
      disabled={true}
      className="min-w-[150px] px-6 py-2.5 bg-gray-400 text-white font-semibold rounded-md border-0 transition-all duration-300 flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
      title="Booking temporarily disabled"
    >
      ⏸️ Booking Coming Soon
    </button>
  ) : (
    <button
      disabled={true}
      className="min-w-[150px] px-6 py-2.5 bg-gray-400 text-white font-semibold rounded-md border-0 transition-all duration-300 flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
      title="Payment temporarily disabled"
    >
      💳 Payment Coming Soon
    </button>
  )}
</div> */}
          </div>
        </div>

      </section>
    </>
  );
};

export default BhogBookingSection;