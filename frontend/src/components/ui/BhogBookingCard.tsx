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
    <>
      {/* Mobile Layout - Compact horizontal */}
      <div className="flex items-center justify-between p-4 border-1 rounded-xl bg-white transition-all duration-200 lg:hidden hover:border-primary/30">
        <div className="flex-1 pr-4">
          <h3 className="text-base font-semibold text-primary mb-1">
            {category.title}
          </h3>
          <p className="text-sm text-gray-600">
            {category.price === 0 ? 'Free' : `₹${category.price}/person`}
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

      {/* Desktop Layout - Original */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4 lg:p-4.5 lg:border lg:border-primary/12 lg:rounded-lg lg:bg-white">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-1">
            {category.title}
          </h3>
          <p className="text-sm leading-relaxed text-secondary">
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
    </>
  );
};

export default BhogBookingCard;
