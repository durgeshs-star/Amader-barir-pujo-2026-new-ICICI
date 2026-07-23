import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stickyFooterVisible, setStickyFooterVisible] = useState(false);

  // Monitor scroll height to show/hide button
  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsVisible(scrollY > 300);
          
          // Check if sticky footer is visible on mobile (look for any element with fixed bottom positioning)
          const stickyFooter = document.querySelector('[class*="fixed"][class*="bottom-0"]');
          if (stickyFooter && window.innerWidth < 1024) {
            const rect = stickyFooter.getBoundingClientRect();
            setStickyFooterVisible(rect.top < window.innerHeight);
          } else {
            setStickyFooterVisible(false);
          }
          
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    // Also check on resize
    window.addEventListener('resize', toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Position above sticky footer on mobile, regular position on desktop
  const shouldShow = isVisible;
  const bottomPosition = stickyFooterVisible ? 'bottom-20' : 'bottom-6';

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${bottomPosition} right-6 z-[99] flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary-dark text-text-on-primary rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform border-0 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${
        shouldShow ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      } lg:bottom-6`}
      aria-label="Back to top"
      title="Scroll to top"
    >
      <FaChevronUp size={16} />
    </button>
  );
};

export default BackToTop;
