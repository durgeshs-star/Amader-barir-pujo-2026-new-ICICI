import React, { useState } from 'react';
import type { AnudanCard as AnudanCardType } from '../../types/anudan.types';

interface AnudanCardProps {
  card: AnudanCardType;
  paidAmount?: number;
  onAddToBasket?: (card: AnudanCardType, amount: number) => void;
}

export const AnudanCard: React.FC<AnudanCardProps> = ({ card, paidAmount = 0, onAddToBasket }) => {
  // Calculate total sum of all items in this section
  const totalCost = card.items.reduce((acc, item) => {
    const num = parseInt(item.cost.replace(/\D/g, ''), 10) || 0;
    return acc + num;
  }, 0);

  const remainingAmount = Math.max(0, totalCost - paidAmount);
  const isFullyFunded = remainingAmount <= 0;
  const progressPercent = totalCost > 0 ? Math.min(100, (paidAmount / totalCost) * 100) : 0;

  const [inputAmount, setInputAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleOfferAnudan = () => {
    const amount = parseInt(inputAmount, 10);

    if (!inputAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > remainingAmount) {
      setError(`Amount cannot exceed remaining amount of ₹${remainingAmount.toLocaleString('en-IN')}`);
      return;
    }

    setError('');
    onAddToBasket?.(card, amount);
    setInputAmount('');
  };

  return (
    <div className={`bg-white border rounded-2xl p-6 md:p-8 transition-all duration-300 shadow-sm relative overflow-hidden group ${
      isFullyFunded
        ? 'border-green-200 opacity-75 cursor-not-allowed'
        : 'border-gray-100 hover:shadow-xl'
    }`}>
      {/* Accent border effect */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${
        isFullyFunded ? 'bg-green-500 w-2' : 'bg-accent group-hover:w-2'
      }`}></div>

      {/* Fully Funded banner */}
      {isFullyFunded && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Fully Funded
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left: Day & Items */}
        <div className="flex-1">
          <h3 className={`text-2xl md:text-3xl font-bold font-fraunces mb-4 ${
            isFullyFunded ? 'text-gray-400' : 'text-primary'
          }`}>
            {card.day}
          </h3>
          <div className="flex flex-wrap gap-2">
            {card.items.map((item, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                  isFullyFunded
                    ? 'bg-gray-50 text-gray-400 border-gray-100'
                    : 'bg-light-bg text-secondary border-gray-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isFullyFunded ? 'bg-gray-300' : 'bg-accent'}`}></span>
                {item.name}
              </span>
            ))}
          </div>

          {/* Progress bar — only show if some amount has been paid */}
          {paidAmount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Collected: ₹{paidAmount.toLocaleString('en-IN')}</span>
                <span>{Math.round(progressPercent)}% funded</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    isFullyFunded ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Amount & Button */}
        <div className="shrink-0 flex flex-col items-start md:items-end md:pl-8 md:border-l border-gray-100 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 w-full md:w-auto">
          {isFullyFunded ? (
            <>
              <span className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">
                Fully Funded 🎉
              </span>
              <span className="text-3xl font-bold text-gray-300 font-fraunces line-through mb-1">
                ₹ {totalCost.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-green-600 font-semibold">
                ₹{paidAmount.toLocaleString('en-IN')} raised
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">
                {paidAmount > 0 ? 'Remaining Amount' : 'Total Offering Value'}
              </span>
              <span className="text-3xl font-bold text-gray-950 font-fraunces mb-4 md:mb-0">
                ₹ {remainingAmount.toLocaleString('en-IN')}
              </span>
              {paidAmount > 0 && (
                <span className="text-xs text-gray-400 line-through mb-2 md:mb-0 mt-1">
                  Total: ₹{totalCost.toLocaleString('en-IN')}
                </span>
              )}
              <div className="mt-2 md:mt-4 w-full md:w-auto">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  disabled={isFullyFunded}
                  className={`w-full px-4 py-2 border rounded-lg text-sm mb-2 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } ${isFullyFunded ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  max={remainingAmount}
                  min="1"
                />
                {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                <button
                  onClick={handleOfferAnudan}
                  disabled={isFullyFunded || !inputAmount}
                  className={`w-full px-6 py-2 text-sm font-semibold rounded-lg shadow-md text-center border-0 transition-all ${
                    isFullyFunded || !inputAmount
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                  }`}
                >
                  {isFullyFunded ? 'Fully Funded' : 'Offer Anudan'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
