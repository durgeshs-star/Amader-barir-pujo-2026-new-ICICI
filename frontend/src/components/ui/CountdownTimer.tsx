import React, { useState, useEffect, useRef } from 'react';

const DURGA_PUJO_DATE = new Date('2026-10-15T00:00:00+05:30'); // October 15, 2026, IST

export const CountdownTimer: React.FC = () => {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const lottieRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const createLottie = () => {
      if (lottieRef.current && !lottieRef.current.querySelector('dotlottie-wc')) {
        const dotlottie = document.createElement('dotlottie-wc');
        dotlottie.setAttribute('src', 'https://lottie.host/4d14d24e-7e4e-45e5-9ca5-3227eee99f77/5Z4sWa8aVN.json');
        dotlottie.style.width = '25px';
        dotlottie.style.height = '25px';
        dotlottie.setAttribute('autoplay', '');
        dotlottie.setAttribute('loop', '');
        lottieRef.current.appendChild(dotlottie);
      }
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js"]');

    if (existingScript) {
      createLottie();
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js';
    script.type = 'module';
    script.onload = () => {
      createLottie();
      setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (!existingScript && !isLoaded) {
        const script = document.querySelector('script[src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js"]');
        if (script) {
          document.head.removeChild(script);
        }
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    const calculateDaysRemaining = () => {
      const now = new Date();
      const diff = DURGA_PUJO_DATE.getTime() - now.getTime();   
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      if (days <= 0) {
        setDaysRemaining(null); // Hide on or after the date
      } else {
        setDaysRemaining(days);
      }
    };

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (daysRemaining === null) return null;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 text-primary lg:text-primary px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105" style={{ backgroundColor: 'oklch(98.7% 0.022 95.277)' }}>
        <span className="text-xs font-bold tracking-wide">
          {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} to Go
        </span>
        <div ref={lottieRef} className="w-6 h-6" />
      </div>
    </div>
  );  
};

export default CountdownTimer;
