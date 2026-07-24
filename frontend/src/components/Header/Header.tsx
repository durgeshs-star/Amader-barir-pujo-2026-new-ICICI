import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram } from 'react-icons/fa';
import Navigation from './Navigation';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';
import CountdownTimer from '../ui/CountdownTimer';
import { CONTACT_EMAIL } from '../../config/constants';

export interface HeaderProps {
  /** Override the top-bar phone number */
  phone?: string;
  /** Override the top-bar email */
  email?: string;
  /** Override the CTA button label (supports JSX with <br />) */
  ctaLabel?: React.ReactNode;
  /** Override the CTA button link */
  ctaHref?: string;
  /** Facebook URL */
  facebookUrl?: string;
  /** Instagram URL */
  instagramUrl?: string;
  /** Show full desktop navigation (hide for minimal header) */
  showNavigation?: boolean;
  /** Show the top info bar containing phone/email */
  showTopInfo?: boolean;
  /** Show the CTA button on desktop */
  showCTA?: boolean;
  /** If provided and CTA hidden, show this brand content in CTA area */
  brandText?: React.ReactNode;
  /** Disable sticky behavior on small screens (mobile) */
  disableStickyOnMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  phone = '(+123) 123 4567 890',
  email = CONTACT_EMAIL,
  ctaLabel = "BE A BARI MEMBER",
  ctaHref = '/volunteer',
  facebookUrl = 'https://www.facebook.com/people/Amader-Barir-Pujo/61571741439510/',
  instagramUrl = 'https://www.instagram.com/abp_pune?igsh=YTZtZHVuODQxNWhj',
  showNavigation = true,
  showTopInfo = true,
  showCTA = true,
  brandText,
  disableStickyOnMobile = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const scrollRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);

  // Handle scroll events with RAF throttling
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      scrollRafRef.current = requestAnimationFrame(() => {
        const shouldBeSticky = disableStickyOnMobile && window.innerWidth < 1024
          ? false
          : window.scrollY > 80;
        setIsSticky(shouldBeSticky);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [disableStickyOnMobile]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }
      resizeRafRef.current = requestAnimationFrame(() => {
        if (window.innerWidth >= 1024) {
          setIsMobileMenuOpen(false);
        }
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }
    };
  }, []);

  const handlePhoneClick = useCallback(() => {
    if (phone) {
      window.location.href = `tel:${phone.replace(/\D/g, '')}`;
    }
  }, [phone]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const headerClassName = `w-full transition-all duration-300 bg-white border-b border-gray-100 ${
    isSticky
      ? 'fixed top-0 left-0 right-0 shadow-md z-[999]'
      : 'relative z-50'
  }`;

  return (
    <>
      <header className={headerClassName}>
        {/* Top info bar */}
        {!isSticky && showTopInfo && (
          <div className="hidden lg:block border-b border-primary-bright/30 py-2.5 text-xs text-text-on-primary font-bold bg-primary">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <ul className="flex items-center gap-6 list-none p-0 m-0">
                {phone && (
                  <li>
                    <button
                      onClick={handlePhoneClick}
                      aria-label={`Call us at ${phone}`}
                      className="flex items-center gap-2 text-text-on-primary hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm bg-transparent border-none cursor-pointer p-0"
                    >
                      <FaPhoneAlt size={11} aria-hidden="true" />
                      <span>{phone}</span>
                    </button>
                  </li>
                )}
                <li>
                  <a
                    href={`mailto:${email}`}
                    aria-label={`Email us at ${email}`}
                    className="flex items-center gap-2 text-text-on-primary hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm"
                  >
                    <FaEnvelope size={11} aria-hidden="true" />
                    <span>{email}</span>
                  </a>
                </li>
              </ul>
              <ul className="flex items-center gap-3 list-none p-0 m-0">
                <li>
                  <CountdownTimer />
                </li>
                <li>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Facebook"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/20 hover:bg-accent-dark transition-all text-text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <FaFacebookF size={12} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/20 hover:bg-accent-dark transition-all text-text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <FaInstagram size={12} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Main header bar */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2 transition-all duration-300 relative">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="shrink-0 select-none">
              <Link to="/" aria-label="Amader Barir Pujo — Home">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-white flex items-center justify-center w-24 h-24 transition-all duration-300">
                    <img
                      src="/assets/img/Logo-puja-160.webp"
                      srcSet="
                        /assets/img/Logo-puja-96.webp   96w,
                        /assets/img/Logo-puja-160.webp 160w,
                        /assets/img/Logo-puja-180.webp 180w,
                        /assets/img/Logo-puja-256.webp 256w
                      "
                      sizes="(max-width: 768px) 180px, 96px"
                      alt="Amader Barir Pujo logo"
                      className="w-full h-full object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <p className="text-[10px] text-primary font-semibold mt-1 text-center leading-tight">
                    An Initiative by <br />
                    <a 
                      href="https://proplusdatafoundation.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline transition-colors duration-200"
                    >
                      ProPlus Data Foundation
                    </a>
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop navigation */}
            {showNavigation ? (
              <div className="hidden lg:block flex-1">
                <Navigation />
              </div>
            ) : brandText ? (
              <div className="hidden lg:flex flex-1 justify-center">
                <div className="text-4xl font-extrabold text-primary select-none">
                  {brandText}
                </div>
              </div>
            ) : (
              <div className="hidden lg:block flex-1" />
            )}

            {/* Desktop CTA button */}
            <div className="hidden lg:block shrink-0">
              {showCTA && (
                <Link
                  to={ctaHref}
                  className="inline-block text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-md bg-primary text-text-on-primary border-2 border-transparent hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-center"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-3">
              {showCTA && (
                <Link
                  to={ctaHref}
                  className="text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded bg-primary hover:bg-primary-dark text-text-on-primary shadow-sm shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {ctaLabel}
                </Link>
              )}
              {showNavigation && (
                <HamburgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={handleMobileMenuToggle}
                />
              )}
            </div>
          </div>

          {/* Darpan ID - positioned inside container */}
          <div className="absolute bottom-1 right-4 lg:right-6 text-[9px] lg:text-[10px] text-primary font-semibold select-none pointer-events-none">
            Darpan ID : MH/2025/0627499
          </div>
        </div>
      </header>

      {/* Mobile menu - only render when navigation is shown */}
      {showNavigation && (
        <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />
      )}
    </>
  );
};

export default Header;
