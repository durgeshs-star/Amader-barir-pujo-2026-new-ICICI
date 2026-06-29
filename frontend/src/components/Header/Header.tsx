import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram } from 'react-icons/fa';
import Navigation from './Navigation';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';

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
}

export const Header: React.FC<HeaderProps> = ({
  phone = '(+123) 123 4567 890',
  email = 'info@abp.proplusdatafoundation.com',
  ctaLabel = 'Volunteer',
  ctaHref = '/volunteer',
  facebookUrl = 'https://www.facebook.com/people/Amader-Barir-Pujo/61571741439510/',
  instagramUrl = 'https://www.instagram.com/abp_pune?igsh=YTZtZHVuODQxNWhj',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header
        className={`w-full transition-all duration-300 ${
          isSticky
            ? 'fixed top-0 left-0 right-0 bg-white/95 shadow-lg backdrop-blur-md z-[999] border-b border-gray-100'
            : 'absolute top-0 left-0 right-0 z-50 bg-transparent'
        }`}
      >
        {/* Top info bar — hidden when sticky or on mobile */}
        {!isSticky && (
          <div className="hidden lg:block border-b border-white/15 py-2.5 text-xs text-white bg-primary/90">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <ul className="flex items-center gap-6 list-none p-0 m-0">
                <li>
                  <a
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
                  >
                    <FaPhoneAlt size={11} aria-hidden="true" />
                    <span>{phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
                  >
                    <FaEnvelope size={11} aria-hidden="true" />
                    <span>{email}</span>
                  </a>
                </li>
              </ul>

              <ul className="flex items-center gap-3 list-none p-0 m-0">
                <li>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Facebook"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/10 hover:bg-accent transition-all text-white"
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
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/10 hover:bg-accent transition-all text-white"
                  >
                    <FaInstagram size={12} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Main header bar */}
        <div className={`transition-all duration-300 ${
          isSticky
            ? ''
            : 'bg-gradient-to-b from-black/55 to-transparent'
        }`}>
          <div className={`max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-300 ${isSticky ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="shrink-0 select-none">
              <Link to="/" aria-label="Amader Barir Pujo — Home">
                <img
                  src="/assets/img/Logo-puja.webp"
                  alt="Amader Barir Pujo logo"
                  className={`object-contain transition-all duration-300 ${isSticky ? 'h-24' : 'h-28'}`}
                />
              </Link>
            </div>

            {/* Desktop nav */}
            <div className={`hidden lg:block ${
              isSticky
                ? ''
                : '[&_.nav-link]:text-white/90 [&_.nav-link:hover]:text-accent [&_.nav-btn]:text-white/90 [&_.nav-btn:hover]:text-accent'
            }`}>
              <Navigation />
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Link
                to={ctaHref}
                className={`inline-block text-sm font-semibold px-6 py-2.5 rounded-md border-2 transition-all duration-300 ${
                  isSticky
                    ? 'bg-primary text-white border-transparent hover:bg-primary-dark hover:shadow-lg'
                    : 'bg-white text-primary border-white hover:bg-transparent hover:text-white'
                }`}
              >
                {ctaLabel}
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-3">
              <Link
                to={ctaHref}
                className="text-xs font-semibold px-3 py-1.5 rounded bg-primary hover:bg-primary-dark text-white shadow-sm shrink-0 transition-colors"
              >
                {ctaLabel}
              </Link>
              <HamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
