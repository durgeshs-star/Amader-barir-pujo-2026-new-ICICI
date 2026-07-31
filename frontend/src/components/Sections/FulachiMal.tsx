import React from 'react';

interface FulachiMalProps {
  className?: string;
}

export const FulachiMal: React.FC<FulachiMalProps> = ({ className = '' }) => {
  return (
    <>
      {/* Left side fulachi-mal */}
      <div
        className={`absolute left-1 sm:left-4 md:left-6 lg:left-8 xl:left-10 bottom-4 top-0 pointer-events-none z-[60] w-4 sm:w-6 md:w-10 lg:w-12 ${className}`}
        style={{
          backgroundImage: 'url("/assets/img/fulachi-mal.png")',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top',
          backgroundSize: '100% auto',
        }}
        aria-hidden="true"
      />

      {/* Right side fulachi-mal */}
      <div
        className={`absolute right-1 sm:right-4 md:right-6 lg:right-8 xl:right-10 top-0 bottom-4 pointer-events-none z-[60] w-4 sm:w-6 md:w-10 lg:w-12 ${className}`}
        style={{
          backgroundImage: 'url("/assets/img/fulachi-mal.png")',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top',
          backgroundSize: '100% auto',
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default FulachiMal;
