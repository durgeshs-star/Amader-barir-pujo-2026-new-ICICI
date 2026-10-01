import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FloatingBhogCTAProps {
  fixed?: boolean;
}

export const FloatingBhogCTA: React.FC<FloatingBhogCTAProps> = ({ fixed = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/bhog-booking');
  };

  return (
    <div
      className={`lg:hidden ${fixed ? 'fixed bottom-4' : 'absolute bottom-4'} left-1/2 -translate-x-1/2 z-[150] pointer-events-auto`}
    >
      <button
        onClick={handleClick}
        className="bhog-button-pulse bg-primary text-text-on-primary px-5 py-2.5 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wide border-2 border-accent hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent whitespace-nowrap cursor-pointer"
      >
        Book Your Bhog
      </button>
    </div>
  );
};

export default FloatingBhogCTA;
