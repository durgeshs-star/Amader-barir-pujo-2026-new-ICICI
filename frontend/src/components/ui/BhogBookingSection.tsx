import React, { useState } from 'react';
import axios from 'axios';
import BhogBookingCard from './BhogBookingCard';
import BhogSuccessModal from './BhogSuccessModal';
import UserInfoForm from './UserInfoForm';
import type { BhogBookingSectionProps, BhogBookingState } from '../../types/bhog';

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
  const [userInfo, setUserInfo] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    categories: Array<{ id: string; title: string; quantity: number; price: number }>;
    totalCount: number;
  } | null>(null);

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
    if (!userInfo) {
      return;
    }

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
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/bhog/free-booking`, bookingDetails);

      if (response.data.success) {
        // Show success modal
        setSuccessModalData({
          title,
          categories: bookingDetails.categories,
          totalCount,
        });
        setShowSuccessModal(true);

        // Reset bookings and user info
        const resetState: BhogBookingState = {};
        categories.forEach((cat) => {
          resetState[cat.id] = 0;
        });
        setBookings(resetState);
        setUserInfo(null);
      } else {
        throw new Error('Failed to record free booking');
      }
    } catch (err: any) {
      console.error('Free booking failed:', err);
      alert(`Failed to record free booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handlePaymentSuccess = async (orderId: string, transactionId: string) => {
    if (!userInfo) {
      return;
    }

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

    try {
      // Call backend to record paid booking in Google Sheets
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/bhog/paid-booking`, bookingDetails);

      if (response.data.success) {
        // Store booking details in sessionStorage for receipt generation
        sessionStorage.setItem('bhogReceipt', JSON.stringify(bookingDetails));

        // Navigate to payment success page
        window.location.href = `/payment/success?orderId=${orderId}&transactionId=${transactionId}&amount=${totalAmount}&currency=INR&fromBhog=true`;
      } else {
        throw new Error('Failed to record paid booking');
      }
    } catch (err: any) {
      console.error('Paid booking failed:', err);
      alert(`Failed to record paid booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleDummyPayment = () => {
    if (!userInfo) {
      return;
    }

    // Generate dummy order and transaction IDs
    const orderId = `BHOG-${Date.now()}`;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Call the same success handler as real payment
    handlePaymentSuccess(orderId, transactionId);
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
      <UserInfoForm onSubmit={setUserInfo} disabled={totalCount === 0} />

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
            disabled={totalCount === 0}
            className="min-w-[150px] px-6 py-2.5 bg-primary text-text-on-primary font-semibold rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:hover:scale-100"
          >
            Book Bhog
          </button>
        ) : (
          <button
            onClick={handleDummyPayment}
            disabled={totalCount === 0}
            className="min-w-[150px] px-6 py-2.5 bg-primary text-text-on-primary font-semibold rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:hover:scale-100"
          >
            Book Bhog
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
