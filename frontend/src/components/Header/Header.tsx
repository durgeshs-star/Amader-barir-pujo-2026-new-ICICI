import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram } from 'react-icons/fa';
import Navigation from './Navigation';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';
import CountdownTimer from '../ui/CountdownTimer';

export interface HeaderProps {
  /** Override the top-bar phone number */
  phone?: string;
  /** Override the top-bar email */
  email?: string;
  /** Override the CTA button label */
  ctaLabel?: string;
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
  email = 'info@abp.proplusdatafoundation.com',
  ctaLabel = 'Volunteer',
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

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (disableStickyOnMobile && window.innerWidth < 1024) {
            setIsSticky(false);
          } else {
            setIsSticky(window.scrollY > 80);
          }
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disableStickyOnMobile]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    let ticking = false;
    const handleResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
          ticking = false;
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header
        className={`w-full transition-all duration-300 bg-white border-b border-gray-100 ${
          isSticky
            ? 'fixed top-0 left-0 right-0 shadow-md z-999'
            : 'relative z-50'
        }`}
      >
        {/* Top info bar */}
        {!isSticky && showTopInfo && (
          <div className="hidden lg:block border-b border-primary-bright/30 py-2.5 text-xs text-text-on-primary font-bold bg-primary">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <ul className="flex items-center gap-6 list-none p-0 m-0">
                <li>
                  <a
                    href={phone ? `tel:${phone.replace(/\D/g, '')}` : '#'}
                    aria-label={phone ? `Call us at ${phone}` : undefined}
                    className="flex items-center gap-2 text-text-on-primary hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm"
                  >
                    {phone ? <FaPhoneAlt size={11} aria-hidden="true" /> : null}
                    <span>{phone}</span>
                  </a>
                </li>
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
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/20 hover:bg-accent-dark transition-all text-text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <FaFacebookF size={12} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/20 hover:bg-accent-dark transition-all text-text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <FaInstagram size={12} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Main header bar — always white */}
        <div className={`max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-300 ${isSticky ? 'py-2' : 'py-2'}`}>
          <div className="flex items-center justify-between gap-6">

            {/* Logo */}
            <div className="shrink-0 select-none">
              <Link to="/" aria-label="Amader Barir Pujo — Home">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full bg-white flex items-center justify-center transition-all duration-300 ${isSticky ? 'w-24 h-24' : 'w-24 h-24'}`}>
                    <img
                      src="/assets/img/Logo-puja-160.webp"
                      srcSet="
                        /assets/img/Logo-puja-96.webp   96w,
                        /assets/img/Logo-puja-160.webp 160w,
                        /assets/img/Logo-puja-180.webp 180w,
                        /assets/img/Logo-puja-256.webp 256w"
                      sizes="(max-width: 768px) 180px, 96px"
                      alt="Amader Barir Pujo logo"
                      className="w-full h-full object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <p className="text-[10px] text-primary font-semibold mt-1 text-center leading-tight">
                    An Initiative by <br />ProPlus Data Foundation
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop nav — dark text on white */}
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

            {/* Desktop CTA or brand text */}
            <div className="hidden lg:block shrink-0">
              {showCTA ? (
                <Link
                  to={ctaHref}
                  className="inline-block text-sm font-semibold px-6 py-2.5 rounded-md bg-primary text-text-on-primary border-2 border-transparent hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {ctaLabel}
                </Link>
              ) : null}
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-3">
              {showCTA ? (
                <Link
                  to={ctaHref}
                  className="text-xs font-semibold px-3 py-1.5 rounded bg-primary hover:bg-primary-dark text-text-on-primary shadow-sm shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {ctaLabel}
                </Link>
              ) : null}
              {showNavigation ? (
                <HamburgerButton
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Darpan ID */}
        <div className="absolute bottom-1 right-3 lg:right-6 text-[9px] lg:text-[10px] text-primary font-semibold select-none pointer-events-none">
          Darpan ID : MH/2025/0627499
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
