import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram } from 'react-icons/fa';
import Navigation from './Navigation';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';
import CountdownTimer from '../ui/CountdownTimer';
import { CONTACT_EMAIL } from '../../config/constants';

export interface HeaderProps {
  phone?: string;
  email?: string;
  ctaLabel?: React.ReactNode;
  ctaHref?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  showNavigation?: boolean;
  showTopInfo?: boolean;
  showCTA?: boolean;
  brandText?: React.ReactNode;
  disableStickyOnMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  phone = '(+91) 7798 57 7880',
  email = CONTACT_EMAIL,
  ctaLabel = "Be a Bari Member",
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

  const headerClassName = `w-full transition-all duration-300 bg-light-bg border-b border-[rgb(180,160,130)] ${
    isSticky
      ? 'fixed top-0 left-0 right-0 shadow-md z-[999]'
      : 'relative z-50'
  }`;

  return (
    <>
      <header className={headerClassName}>
        {!isSticky && showTopInfo && (
          <div className="hidden lg:block border-b border-primary-bright/30 py-2.5 text-xs text-text-on-primary font-bold bg-primary">
            <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
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
                    className="flex items-center justify-center w-6 h-6 rounded bg-gray-500/20 hover:bg-accent-dark transition-all text-text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    className="flex items-center justify-center w-6 h-6 rounded bg-gray-500/20 hover:bg-accent-dark transition-all text-text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <FaInstagram size={12} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-2 transition-all duration-300 relative">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 flex-nowrap">
           <div className="flex-shrink min-w-0 select-none">
              <Link to="/" aria-label="Amader Barir Pujo — Home">
                <div className="flex flex-col items-center">
                  <div className="rounded-full flex items-center justify-center w-36 h-20 lg:w-40 lg:h-20 transition-all duration-300">
                    <img
                      src="/assets/img/ABP-Logo.png"
                      alt="Amader Barir Pujo logo"
                      className="w-full h-full object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>
              </Link>
            </div>

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

            <div className="hidden lg:flex items-center gap-24 shrink-0">
              {showCTA && (
                <Link
                  to={ctaHref}
                  className="inline-block text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-md bg-primary text-text-on-primary border-2 border-transparent hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-center whitespace-nowrap"
                >
                  {ctaLabel}
                </Link>
              )}
              <a
                href="https://proplusdatafoundation.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src="/assets/img/PPD-Foundation.png"
                  alt="PPD Foundation"
                  className="h-10 w-auto max-w-[160px] object-contain"
                  loading="eager"
                  decoding="async"
                />
              </a>
            </div>

          <div className="flex lg:hidden items-center gap-2.5 ml-auto shrink-0">
            <a
              href="https://proplusdatafoundation.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <img
                src="/assets/img/PPD-Foundation.png"
                alt="ProPlus Data Foundation"
                className="w-35 sm:w-16 h-auto object-contain"
                loading="eager"
                decoding="async"
              />
            </a>
            {showNavigation && (
              <HamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={handleMobileMenuToggle}
              />
            )}
          </div>
          </div>

          <div className="hidden lg:block absolute bottom-1 right-4 lg:right-6 text-[9px] lg:text-[10px] text-primary font-semibold select-none pointer-events-none">
            Darpan ID : MH/2025/0627499
          </div>
        </div>
      </header>

      {showNavigation && (
        <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />
      )}
    </>
  );
};

export default Header;