import React, { useState } from 'react';
import { m } from 'framer-motion';
import type { AnudanCard as AnudanCardType } from '../../types/anudan.types';

interface AnudanCardProps {
  card: AnudanCardType;
  remainingAmount?: number;
  isLoading?: boolean;
  onAddToBasket?: (card: AnudanCardType, amount: number) => void;
  onBookingSoon?: () => void;
}

export const AnudanCard: React.FC<AnudanCardProps> = ({ card, isLoading = false, onAddToBasket, onBookingSoon }) => {
  // Calculate total sum of all items in this section
  const totalCost = card.items.reduce((acc, item) => {
    const num = parseInt(item.cost.replace(/\D/g, ''), 10) || 0;
    return acc + num;
  }, 0);

  const isFullySponsored = false;

  const [inputAmount, setInputAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleOfferAnudan = () => {
    const amount = parseInt(inputAmount, 10);

    if (!inputAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > totalCost) {
      setError(`Amount cannot exceed total amount of ₹${totalCost.toLocaleString('en-IN')}`);
      return;
    }

    setError('');
    onAddToBasket?.(card, amount);
    setInputAmount('');
  };

  return (
    <div className={`border rounded-2xl p-6 md:p-8 transition-all duration-300 shadow-sm relative overflow-hidden group ${
      isLoading
        ? 'border-[rgb(180,160,130)]'
        : isFullySponsored
        ? 'border-green-200 opacity-75 cursor-not-allowed'
        : 'border-[rgb(180,160,130)] hover:shadow-xl'
    }`}>
      {/* Accent border effect */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${
        isLoading
          ? 'bg-gray-300'
          : isFullySponsored
          ? 'bg-green-500 w-2'
          : 'bg-accent group-hover:w-2'
      }`}></div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(180,160,130)]"></div>
          <span className="ml-3 text-gray-500 text-sm">Loading amount...</span>
        </div>
      ) : (
        <>
          {/* Fully Sponsored banner */}
          {isFullySponsored && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Offering Fulfilled
            </div>
          )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left: Day & Items */}
        <div className="flex-1">
          <h3 className={`text-2xl md:text-3xl font-bold font-fraunces mb-4 ${
            isFullySponsored ? 'text-gray-400' : 'text-primary'
          }`}>
            {card.day}
          </h3>
          <div className="flex flex-wrap gap-2">
            {card.items.map((item, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                  isFullySponsored
                    ? 'bg-gray-50 text-gray-400 border-gray-100'
                    : 'bg-light-bg text-secondary border-[rgb(180,160,130)]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isFullySponsored ? 'bg-gray-300' : 'bg-accent'}`}></span>
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Amount & Button */}
        <div className="shrink-0 flex flex-col items-start md:items-end md:pl-8 md:border-l border-[rgb(180,160,130)] mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 w-full md:w-auto">
          {isFullySponsored ? (
            <>
              <span className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">
                Offering Fulfilled 🎉
              </span>
              <m.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-green-600 font-fraunces mb-1"
              >
                ₹{totalCost.toLocaleString('en-IN')}
              </m.span>
            </>
          ) : (
            <>
              <span className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">
                Total Amount
              </span>
              <m.span
                key={totalCost}
                initial={{ opacity: 0.7, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-amber-600 font-fraunces mb-2"
              >
                ₹{totalCost.toLocaleString('en-IN')}
              </m.span>
              <div className="mt-2 md:mt-4 w-full md:w-auto">
                <div className="relative">
                  <span className="absolute left-4 top-1.5 text-gray-500">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    value={inputAmount}
                    onChange={(e) => {
                      // Only allow digits
                      const val = e.target.value.replace(/\D/g, '');
                      setInputAmount(val);
                    }}
                    disabled={isFullySponsored}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm mb-2 bg-[oklch(96.2% 0.059 95.617)] ${
                      error ? 'border-red-500' : 'border-[rgb(180,160,130)]'
                    } ${isFullySponsored ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                <button
                  onClick={() => {
                    if (onBookingSoon) {
                      onBookingSoon();
                      return;
                    }
                    handleOfferAnudan();
                  }}
                  aria-disabled={Boolean(onBookingSoon)}
                  className={`w-full px-6 py-2 text-sm font-semibold rounded-lg shadow-md text-center border-0 transition-all ${
                    onBookingSoon || isFullySponsored || !inputAmount
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                      : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                  }`}
                >
                  {isFullySponsored ? 'Offering Fulfilled' : 'Offer Anudan'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
    )}
    </div>
  );
};
