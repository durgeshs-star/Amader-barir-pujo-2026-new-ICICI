import React, { useState } from 'react';
import BhogBookingCard from './BhogBookingCard';
import type { BhogBookingSectionProps, BhogBookingState } from '../../types/bhog';

export const BhogBookingSection: React.FC<BhogBookingSectionProps> = ({
  title,
  subtitle,
  description,
  categories,
  paymentUrl,
  disclaimer,
}) => {
  const [bookings, setBookings] = useState<BhogBookingState>(() => {
    const initialState: BhogBookingState = {};
    categories.forEach((cat) => {
      initialState[cat.id] = 0;
    });
    return initialState;
  });

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

  const handlePayNow = () => {
    if (totalCount > 0) {
      window.open(paymentUrl, '_blank');
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
        <button
          type="button"
          onClick={handlePayNow}
          disabled={totalCount === 0}
          className="min-w-[150px] px-6 py-2.5 bg-primary text-text-on-primary font-semibold rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted disabled:hover:scale-100"
        >
          Pay Now
        </button>
      </div>
    </section>
  );
};

export default BhogBookingSection;
