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
    <>
      {/* Mobile Counter - Modern segmented design */}
      <div className="inline-flex items-center bg-gray-100 rounded-lg overflow-hidden lg:hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= 0}
          aria-label={ariaLabel ? `Reduce ${ariaLabel}` : 'Reduce count'}
                    className="w-11 h-11 border-0 text-primary text-lg font-bold cursor-pointer transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:text-gray-400 flex items-center justify-center"
        >
          -
        </button>
        <div className="w-12 h-11 flex items-center justify-center bg-gray-100">
          <span className="font-bold text-primary" aria-label={`${label} count`}>
            {value}
          </span>
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={ariaLabel ? `Add ${ariaLabel}` : 'Add count'}
                    className="w-11 h-11 border-0 text-primary text-lg font-bold cursor-pointer transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:text-gray-400 flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Desktop Counter - Original design */}
      <div className="hidden lg:inline-flex lg:items-center lg:flex-0-auto lg:border lg:border-primary/20 lg:rounded-lg lg:overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= 0}
          aria-label={ariaLabel ? `Reduce ${ariaLabel}` : 'Reduce count'}
          className="w-10 h-10 border-0 bg-light-bg text-primary text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-primary-dark hover:text-text-on-primary disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted"
        >
          -
        </button>
        <input
          type="text"
          value={value}
          readOnly
          className="w-16 text-center bg-[oklch(96.2% 0.059 95.617)] border border-[rgb(180,160,130)] rounded-md text-primary font-bold"
          aria-label={`${label} count`}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={ariaLabel ? `Add ${ariaLabel}` : 'Add count'}
          className="w-10 h-10 border-0 bg-light-bg text-primary text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-primary-dark hover:text-text-on-primary disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-muted"
        >
          +
        </button>
      </div>
    </>
  );
};

export default BhogCounter;
