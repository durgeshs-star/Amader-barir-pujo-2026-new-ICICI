import React from 'react';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  ariaControls?: string;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  ariaControls = 'mobile-nav',
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col justify-center items-center gap-[4px] w-9 h-9 bg-primary hover:bg-primary-dark border-0 rounded-md cursor-pointer p-1.5 z-[1003] shrink-0 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 pointer-events-auto"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls={ariaControls}
    >
      <span
        className={`block w-4 h-[2px] bg-text-on-primary rounded-sm transition-all duration-300 ${
          isOpen ? 'translate-y-[6px] rotate-45' : ''
        }`}
      />
      <span
        className={`block h-[2px] bg-text-on-primary rounded-sm transition-all duration-300 ${
          isOpen ? 'opacity-0 w-0' : 'w-4'
        }`}
      />
      <span
        className={`block w-4 h-[2px] bg-text-on-primary rounded-sm transition-all duration-300 ${
          isOpen ? '-translate-y-[6px] -rotate-45' : ''
        }`}
      />
    </button>
  );
};

export default HamburgerButton;
