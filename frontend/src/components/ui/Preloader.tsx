import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Routes that skip the preloader (payment flow) */
const PAYMENT_ROUTES = ['/mock-payment', '/payment/success', '/payment/failure', '/payment/pending'];

function isPaymentRoute(pathname: string): boolean {
  return PAYMENT_ROUTES.some(route => pathname.startsWith(route));
}

interface PreloaderProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with:
 * 1. A 1-second preloader overlay on every route change (except payment pages)
 * 2. Automatic scroll-to-top on every navigation
 */
const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(() => !isPaymentRoute(pathname));
  const [visible, setVisible] = useState(() => !isPaymentRoute(pathname));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Always scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Skip preloader for payment routes
    if (isPaymentRoute(pathname)) {
      setLoading(false);
      setVisible(false);
      return;
    }

    // Skip if same path (e.g. query-only change)
    if (pathname === prevPathRef.current && !loading) {
      prevPathRef.current = pathname;
      return;
    }
    prevPathRef.current = pathname;

    // Show preloader
    setVisible(true);
    setLoading(true);

    // Clear any pending timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // After 1 second, begin fade-out
    timerRef.current = setTimeout(() => {
      setLoading(false);
      // After the CSS transition completes (300ms), remove from DOM
      setTimeout(() => setVisible(false), 300);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <>
      {visible && (
        <div
          className={`sigma_preloader${!loading ? ' hidden' : ''}`}
          aria-hidden={!loading}
          role="status"
          aria-label="Loading page…"
        >
          <img
            width="414"
            height="414"
            src="/assets/img/maa-1.png"
            alt="Loading"
            loading="eager"
            className="sigma_preloader-img"
          />
        </div>
      )}
      {children}
    </>
  );
};

export default Preloader;
