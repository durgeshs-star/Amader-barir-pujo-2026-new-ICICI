import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Monitor scroll height to show/hide button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[99] flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary-dark text-text-on-primary rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform border-0 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      }`}
      aria-label="Back to top"
      title="Scroll to top"
    >
      <FaChevronUp size={16} />
    </button>
  );
};

export default BackToTop;
