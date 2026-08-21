import React, { useState, useEffect } from 'react';

export const ComingSoonPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center relative">
        
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close popup"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-5xl mb-4">🪔</div>
        
        <h2 className="text-3xl font-bold text-primary font-fraunces mb-4">
          A little more waiting.
        </h2>

        <p className="text-lg text-gray-700 mb-6 text-center">
          Then, let's Pujo!
        </p>

        <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
          <p className="text-base text-gray-700 font-medium">
            Anudan and Bhog bookings will open soon.
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Closing in 5 seconds...
        </p>
      </div>
    </div>
  );
};