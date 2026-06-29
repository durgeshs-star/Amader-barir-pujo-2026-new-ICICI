import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram } from 'react-icons/fa';
import Navigation from './Navigation';
import HamburgerButton from './HamburgerButton';
import MobileMenu from './MobileMenu';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Monitor scroll height to trigger sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
        {/* Top Info Bar (Hidden in sticky mode and on mobile) */}
        {!isSticky && (
          <div className="hidden lg:block border-b border-white/15 py-2.5 text-xs text-white bg-primary/90">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <ul className="flex items-center gap-6 list-none p-0 m-0">
                <li>
                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
                  >
                    <FaPhoneAlt size={11} />
                    <span>(+123) 123 4567 890</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@abp.proplusdatafoundation.com"
                    className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
                  >
                    <FaEnvelope size={11} />
                    <span>info@abp.proplusdatafoundation.com</span>
                  </a>
                </li>
              </ul>
              
              <ul className="flex items-center gap-4 list-none p-0 m-0">
                <li>
                  <a
                    href="https://www.facebook.com/people/Amader-Barir-Pujo/61571741439510/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/10 hover:bg-accent hover:text-white transition-all text-white"
                  >
                    <FaFacebookF size={12} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/abp_pune?igsh=YTZtZHVuODQxNWhj"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center justify-center w-6 h-6 rounded bg-white/10 hover:bg-accent hover:text-white transition-all text-white"
                  >
                    <FaInstagram size={12} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Middle Header Bar */}
        <div className={`max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-300 ${isSticky ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center justify-between">
            {/* Logo Wrapper */}
            <div className="shrink-0 select-none">
              <Link to="/" className="block">
                <div className="flex items-center gap-2.5">
                  {/* Fallback stylized logo text */}
                  <span className={`text-2xl font-bold font-fraunces tracking-wider ${isSticky ? 'text-primary' : 'text-primary lg:text-white'}`}>
                    Amader Barir Pujo
                  </span>
                  <span className="text-xs bg-accent text-white font-semibold px-2 py-0.5 rounded">2026</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className={`hidden lg:block ${isSticky ? '' : '[&_a]:text-white/90 [&_a:hover]:text-accent [&_button]:text-white/90 [&_button:hover]:text-accent'}`}>
              <Navigation />
            </div>

            {/* Desktop Controls (Volunteer) */}
            <div className="hidden lg:block">
              <Link
                to="/volunteer"
                className={`inline-block text-sm font-semibold px-6 py-2.5 rounded-md border-2 transition-all duration-300 ${
                  isSticky
                    ? 'bg-primary text-white border-transparent hover:bg-primary-dark hover:shadow-lg'
                    : 'bg-white text-primary border-white hover:bg-transparent hover:text-white'
                }`}
              >
                Volunteer
              </Link>
            </div>

            {/* Mobile Controls (Visible only below lg breakpoint) */}
            <div className="flex lg:hidden items-center gap-3">
              <Link
                to="/volunteer"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-primary hover:bg-primary-dark text-white shadow-sm shrink-0 transition-colors"
              >
                Volunteer
              </Link>
              <HamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

export default Header;
