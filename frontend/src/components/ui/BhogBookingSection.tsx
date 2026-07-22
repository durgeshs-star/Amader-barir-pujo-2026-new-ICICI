import React, { useState } from 'react';
import axios from 'axios';
import BhogBookingCard from './BhogBookingCard';
import BhogSuccessModal from './BhogSuccessModal';
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
  const [bookings, setBookings] = useState<BhogBookingState>(() => {
    const initialState: BhogBookingState = {};
    categories.forEach((cat) => {
      initialState[cat.id] = 0;
    });
    return initialState;
  });

  const userInfoFormRef = React.useRef<UserInfoFormRef>(null);
  const [isUserInfoFilled, setIsUserInfoFilled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    categories: Array<{ id: string; title: string; quantity: number; price: number }>;
    totalCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    return { totalAmount, totalCount };
  };

  const { totalAmount, totalCount } = calculateTotal();

  const isFreeBooking = () => {
    // Check if only children-0-5 category is selected with > 0 count
    const children05Count = bookings['children-0-5'] || 0;
    const otherCategoriesSelected = categories
      .filter(cat => cat.id !== 'children-0-5')
      .some(cat => (bookings[cat.id] || 0) > 0);

    return children05Count > 0 && !otherCategoriesSelected;
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

      // Call backend to record free booking in Excel sheet
      const response = await axios.post(`${API_URL}/api/bhog/free-booking`, bookingDetails);

      if (response.data.success) {
        // Show success modal
        setSuccessModalData({
          title,
          categories: bookingDetails.categories,
          totalCount,
        });
        setShowSuccessModal(true);

        // Reset bookings and user info state flag
        const resetState: BhogBookingState = {};
        categories.forEach((cat) => {
          resetState[cat.id] = 0;
        });
        setBookings(resetState);
        setIsUserInfoFilled(false);
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
      // Generate order and transaction IDs
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

      // Call backend to initiate payment
      const response = await axios.post(`${API_URL}/api/bhog/paid-booking`, bookingDetails);

      if (response.data.success) {
        // Redirect to payment gateway or payment page
        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else if (response.data.transactionId) {
          // Redirect to mock payment page if using mock payment
          window.location.href = `/mock-payment?transactionId=${response.data.transactionId}`;
        } else {
          throw new Error('No payment URL or transaction ID returned from backend');
        }
      } else {
        throw new Error(response.data.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Payment initiation failed:', err);
      toast.error(`Failed to initiate payment: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="mt-9 p-7 border border-primary/14 rounded-lg bg-gradient-to-br from-white to-orange-50/50 shadow-lg"
      aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}Title`}
    >
      <div className="flex items-start justify-between gap-4.5 mb-6">
        <div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <BhogBookingCard
            key={category.id}
            category={category}
            value={bookings[category.id] || 0}
            onValueChange={(value) => handleValueChange(category.id, value)}
          />
        ))}
      </div>

      {disclaimer && (
        <p className="mt-5 p-3 pl-4 border-l-4 border-accent rounded-lg bg-accent/12 text-secondary text-sm leading-relaxed">
          {disclaimer}
        </p>
      )}

      {/* User Information Form */}
      <UserInfoForm ref={userInfoFormRef} onFormChange={setIsUserInfoFilled} disabled={totalCount === 0} />

      <div className="flex items-center justify-between gap-4.5 mt-5.5 pt-5.5 border-t border-primary/14">
        <div>
          <p className="text-base font-bold text-gray-900 mb-0">
            Total:{' '}
            <span className="text-2xl text-primary font-fraunces">₹{totalAmount}</span>
          </p>
          <p className="text-sm text-secondary mb-0">
            <span>{totalCount}</span>{' '}
            <span>{totalCount === 1 ? 'booking selected' : 'bookings selected'}</span>
          </p>
        </div>
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            disabled={totalCount === 0 || !isUserInfoFilled || isLoading}
            className="min-w-[150px] px-6 py-2.5 bg-primary text-text-on-primary font-semibold rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        )}
      </div>

      {/* Success Modal */}
      {successModalData && (
        <BhogSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successModalData.title}
          categories={successModalData.categories}
          totalCount={successModalData.totalCount}
        />
      )}
    </section>
  );
};

export default BhogBookingSection;
