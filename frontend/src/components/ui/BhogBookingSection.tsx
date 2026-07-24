import React, { useState } from 'react';
import BhogBookingCard from './BhogBookingCard';
import UserInfoForm from './UserInfoForm';
import type { UserInfoFormRef } from './UserInfoForm';
import type { BhogBookingSectionProps, BhogBookingState } from '../../types/bhog';
import { toast } from 'react-toastify';
import { apiService } from '../../services/api';

export const BhogBookingSection: React.FC<BhogBookingSectionProps> = ({
  title,
  subtitle,
  description,
  categories,
  disclaimer,
}) => {
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
  const handleFreeBooking = async () => {
    if (!userInfoFormRef.current) return;
    if (!userInfoFormRef.current.validateForm()) return;

    const userInfo = userInfoFormRef.current.getUserInfo();
    setIsLoading(true);

    try {
      const bookingDetails = {
        title,
        categories: categories.map(cat => ({
          ...cat,
          quantity: bookings[cat.id] || 0
        })).filter(cat => cat.quantity > 0),
        totalAmount: 0,
        totalCount,
        timestamp: new Date().toISOString(),
        isFree: true,
        userInfo
      };

      const response = await apiService.submitFreeBhogBooking(bookingDetails);

      if (response.success) {
        const { orderId, transactionId } = response.data || {};
        if (!orderId || !transactionId) {
          throw new Error('Receipt details were not returned for the free booking');
        }

        window.location.href = `/payment/success?orderId=${encodeURIComponent(orderId)}&transactionId=${encodeURIComponent(transactionId)}&amount=0&currency=INR&fromBhog=true`;
      } else {
        throw new Error('Failed to record free booking');
      }
    } catch (err: any) {
      console.error('Free booking failed:', err);
      toast.error(`Failed to record free booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!userInfoFormRef.current) return;
    if (!userInfoFormRef.current.validateForm()) return;

    const userInfo = userInfoFormRef.current.getUserInfo();
    setIsLoading(true);

    try {
      const orderId = `BHG-${Date.now()}`;
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const bookingDetails = {
        orderId,
        transactionId,
        title,
        categories: categories.map(cat => ({
          ...cat,
          quantity: bookings[cat.id] || 0
        })).filter(cat => cat.quantity > 0),
        totalAmount,
        totalCount,
        timestamp: new Date().toISOString(),
        isFree: false,
        userInfo
      };

      const response = await apiService.submitPaidBhogBooking(bookingDetails);

      if (response.success) {
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else if (response.data?.transactionId) {
          window.location.href = `/mock-payment/${response.data.transactionId}`;
        } else {
          throw new Error('No payment URL or transaction ID returned from backend');
        }
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Payment initiation failed:', err);
      toast.error(`Failed to initiate payment: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <>
      <section
        className="mt-9 p-7 border border-primary/14 rounded-lg bg-gradient-to-br from-white to-orange-50/50 shadow-lg lg:mt-9 lg:p-7"
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
          <div className="block lg:hidden mb-6 p-4 bg-white border-2 border-primary/20 rounded-xl">
            <h3 className="text-xl font-bold text-primary mb-3">Booking Summary</h3>
            <div className="space-y-2">
              {bookingSummary.map((item, index) => (
                <div key={index} className="flex justify-between text-base">
                  <span>{item.title} ×{item.quantity}</span>
                  <span className="font-semibold">₹{item.total}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200">
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
                className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
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
            <p className="text-sm font-bold text-amber-800 text-center leading-relaxed">
              The final payment amount (including applicable taxes/charges) will be shown on the payment screen.
            </p>
          </div>
        )}

        {/* Mobile Payment Button - Right after disclaimer when ready */}
        {totalCount > 0 && isUserInfoFilled && (isFreeBooking() || isConfirmed) && (
          <div className="block lg:hidden mt-4">
            {isFreeBooking() ? (
              <button
                onClick={handleFreeBooking}
                disabled={totalCount === 0 || !isUserInfoFilled || isLoading}
                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-xl border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center space-x-2 h-[52px]"
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
                onClick={handlePayment}
                disabled={totalCount === 0 || !isUserInfoFilled || !isConfirmed || isLoading}
                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-xl border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center space-x-2 h-[52px]"
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
              <p className="text-base font-bold text-gray-900 mb-0">
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
                  onClick={handleFreeBooking}
                  disabled={totalCount === 0 || !isUserInfoFilled || isLoading}
                  className="min-w-[150px] px-6 py-2.5 bg-primary text-text-on-primary font-semibold rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:hover:scale-100 flex items-center justify-center gap-2"
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
                  onClick={handlePayment}
                  disabled={totalCount === 0 || !isUserInfoFilled || !isConfirmed || isLoading}
                  className="min-w-[150px] px-6 py-2.5 bg-primary text-text-on-primary font-semibold rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:hover:scale-100 flex items-center justify-center gap-2"
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
          </div>
        </div>

      </section>
    </>
  );
};

export default BhogBookingSection;