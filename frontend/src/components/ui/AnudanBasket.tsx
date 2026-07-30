import React from 'react';
import type { AnudanCard as AnudanCardType } from '../../types/anudan.types';

interface BasketItem {
  card: AnudanCardType;
  amount: number;
}

interface AnudanBasketProps {
  items: BasketItem[];
  onRemove: (cardDay: string) => void;
  onCheckout: () => void;
}

export const AnudanBasket: React.FC<AnudanBasketProps> = ({ items, onRemove, onCheckout }) => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  if (items.length === 0) {
    return (
      <div className="border border-[rgb(180,160,130)] rounded-xl p-6 shadow-lg sticky top-40 mt-6">
        <h3 className="text-xl font-bold text-primary font-fraunces mb-4 flex items-center gap-2">
          🛒 Anudan Basket
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          Your Anudan will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[rgb(180,160,130)] rounded-xl p-6 shadow-lg sticky top-32 mt-6">
      <h3 className="text-xl font-bold text-primary font-fraunces mb-4 flex items-center gap-2">
        🛒 Anudan Basket
        <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
          {items.length}
        </span>
      </h3>

      <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
        {items.map((item) => (
          <div
            key={item.card.day}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold text-primary text-sm">{item.card.day}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-primary">₹{item.amount.toLocaleString('en-IN')}</span>
              <button
                onClick={() => onRemove(item.card.day)}
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

      <div className="border-t border-[rgb(180,160,130)] pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-primary">Total</span>
          <span className="text-2xl font-bold text-primary font-fraunces">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md"
        >
          Offer Anudan
        </button>
      </div>
    </div>
  );
};

export default AnudanBasket;
