import React from 'react';
import type { BhogCounterProps } from '../../types/bhog';

export const BhogCounter: React.FC<BhogCounterProps> = ({
  max,
  value,
  onValueChange,
  label,
  ariaLabel,
}) => {
  const handleDecrement = () => {
    onValueChange(Math.max(0, value - 1));
  };

  const handleIncrement = () => {
    onValueChange(Math.min(max, value + 1));
  };

  return (
    <div className="inline-flex items-center flex-0-auto border border-primary/20 rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= 0}
        aria-label={ariaLabel ? `Reduce ${ariaLabel}` : 'Reduce count'}
        className="w-10 h-10 border-0 bg-light-bg text-primary text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        -
      </button>
      <input
        type="text"
        value={value}
        readOnly
        aria-label={`${label} count`}
        className="w-12 h-10 border-0 text-gray-900 font-bold text-center bg-white"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={ariaLabel ? `Add ${ariaLabel}` : 'Add count'}
        className="w-10 h-10 border-0 bg-light-bg text-primary text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        +
      </button>
    </div>
  );
};

export default BhogCounter;
