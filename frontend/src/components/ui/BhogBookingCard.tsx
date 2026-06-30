import React from 'react';
import BhogCounter from './BhogCounter';
import type { BhogBookingCategory } from '../../types/bhog';

interface BhogBookingCardProps {
  category: BhogBookingCategory;
  value: number;
  onValueChange: (value: number) => void;
}

export const BhogBookingCard: React.FC<BhogBookingCardProps> = ({
  category,
  value,
  onValueChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4.5 border border-primary/12 rounded-lg bg-white">
      <div>
        <h5 className="text-lg font-semibold text-gray-900 mb-1">
          {category.title}
        </h5>
        <p className="text-sm leading-relaxed text-gray-600">
          {category.price === 0 ? 'Free of cost' : `₹${category.price} ${category.description}`}
        </p>
      </div>
      <BhogCounter
        max={category.max}
        value={value}
        onValueChange={onValueChange}
        label={category.title}
        ariaLabel={category.title}
      />
    </div>
  );
};

export default BhogBookingCard;
