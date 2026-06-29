import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [bhogOpen, setBhogOpen] = useState(false);

  // Esc key closes menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('body-scroll-lock');
    } else {
      document.body.classList.remove('body-scroll-lock');
    }
    return () => {
      document.body.classList.remove('body-scroll-lock');
    };
  }, [isOpen]);

  const pujoScheduleDays = [
    { name: 'Panchami', path: '/pujo-schedule/panchami' },
    { name: 'Shashti', path: '/pujo-schedule/shashti' },
    { name: 'Saptami', path: '/pujo-schedule/saptami' },
    { name: 'Ashtami', path: '/pujo-schedule/ashtami' },
    { name: 'Navami', path: '/pujo-schedule/navami' },
    { name: 'Dashami', path: '/pujo-schedule/dashami' },
    { name: 'Lakshmi Puja', path: '/pujo-schedule/lakshmi-puja' },
  ];

  const bhogBookingDays = [
    { name: 'Saptami', path: '/bhog-booking/saptami' },
    { name: 'Ashtami', path: '/bhog-booking/ashtami' },
    { name: 'Navami', path: '/bhog-booking/navami' },
    { name: 'Lakshmi Puja', path: '/bhog-booking/lakshmi-puja' },
  ];

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 z-[1000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Panel */}
      <aside
        id="mobile-nav"
        className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[1002] shadow-2xl transition-transform duration-300 transform flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation menu"
        aria-hidden={!isOpen}
      >
        {/* Mobile Header (Logo + Close button) */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-150">
          <Link to="/" onClick={handleLinkClick} className="block select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm p-0.5 shrink-0">
                <img
                  src="/assets/img/Logo-puja.webp"
                  alt="Amader Barir Pujo logo"
                  className="w-full h-full object-contain"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold font-fraunces text-primary tracking-wide">Amader Barir Pujo</span>
                <span className="text-[10px] text-accent font-semibold tracking-wider">2026</span>
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-primary hover:text-white text-primary border-0 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close navigation menu"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Menu Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1.5 list-none p-0 m-0">
            {/* Home */}
            <li className="border-b border-gray-100 pb-1">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="block py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>

            {/* About */}
            <li className="border-b border-gray-100 pb-1">
              <Link
                to="/about-us"
                onClick={handleLinkClick}
                className="block py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
              >
                About
              </Link>
            </li>

            {/* Pujo Schedule Dropdown */}
            <li className="border-b border-gray-100 pb-1">
              <button
                onClick={() => setScheduleOpen(!scheduleOpen)}
                className="w-full flex justify-between items-center py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors text-left bg-transparent border-0 cursor-pointer"
                aria-expanded={scheduleOpen}
              >
                <span>Pujo Schedule</span>
                {scheduleOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </button>
              <ul
                className={`list-none pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                  scheduleOpen ? 'max-h-[300px] mt-1 mb-2 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {pujoScheduleDays.map((day) => (
                  <li key={day.path}>
                    <Link
                      to={day.path}
                      onClick={handleLinkClick}
                      className="block py-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
                    >
                      {day.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Anudan */}
            <li className="border-b border-gray-100 pb-1">
              <Link
                to="/anudan"
                onClick={handleLinkClick}
                className="block py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Anudan
              </Link>
            </li>

            {/* Bhog Booking Dropdown */}
            <li className="border-b border-gray-100 pb-1">
              <button
                onClick={() => setBhogOpen(!bhogOpen)}
                className="w-full flex justify-between items-center py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors text-left bg-transparent border-0 cursor-pointer"
                aria-expanded={bhogOpen}
              >
                <span>Bhog Booking</span>
                {bhogOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </button>
              <ul
                className={`list-none pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                  bhogOpen ? 'max-h-[200px] mt-1 mb-2 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {bhogBookingDays.map((day) => (
                  <li key={day.path}>
                    <Link
                      to={day.path}
                      onClick={handleLinkClick}
                      className="block py-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
                    >
                      {day.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Gallery */}
            <li className="border-b border-gray-100 pb-1">
              <Link
                to="/gallery"
                onClick={handleLinkClick}
                className="block py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Gallery
              </Link>
            </li>

            {/* Contact */}
            <li className="border-b border-gray-100 pb-1">
              <Link
                to="/contact-us"
                onClick={handleLinkClick}
                className="block py-2 text-[15px] font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>

            {/* Volunteer Link (Sidebar primary button) */}
            <li className="pt-4">
              <Link
                to="/volunteer"
                onClick={handleLinkClick}
                className="block text-center py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-md transition-colors shadow-sm"
              >
                Become a Volunteer
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default MobileMenu;
