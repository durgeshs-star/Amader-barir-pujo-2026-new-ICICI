import React, { useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  name: string;
  path: string;
}

const pujoScheduleDays: NavItem[] = [
  { name: 'Panchami', path: '/panchami' },
  { name: 'Soshti', path: '/shashti' },
  { name: 'Saptami', path: '/saptami' },
  { name: 'Ashtami', path: '/ashtami' },
  {name: 'Ashtami Sandhi Puja', path: '/ashtami-sandhi-puja' },
  { name: 'Navami', path: '/navami' },
  { name: 'Dashami', path: '/dashami' },
  { name: 'Saraswati Puja', path: '/saraswati-puja' },
];

const bhogBookingDays: NavItem[] = [
  { name: 'Saptami', path: '/bhog-booking/saptami' },
  { name: 'Ashtami', path: '/bhog-booking/ashtami' },
  { name: 'Ashtami Sandhi Puja', path: '/bhog-booking/ashtami-sandhi-puja' },
  { name: 'Navami', path: '/bhog-booking/navami' },
  { name: 'Lakshmi Puja', path: '/bhog-booking/lakshmi-puja' },
  { name: 'Saraswati Puja', path: '/bhog-booking/saraswati-puja' },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link text-sm font-medium uppercase tracking-wider transition-colors duration-200 py-1 block text-text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm ${isActive ? 'text-primary font-semibold border-b-2 border-primary' : ''
  }`;

const dropdownItemClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-1 text-[13px] font-medium tracking-wide transition-all duration-200 block border-l-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${isActive
    ? 'text-text-on-primary bg-primary border-accent'
    : 'text-text bg-surface hover:text-text-on-primary hover:bg-primary border-transparent'
  }`;

interface DropdownMenuProps {
  label: string;
  items: NavItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Open immediately on button enter
  const handleButtonEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  // Short delay before closing — allows mouse to travel to the panel
  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handleItemClick = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <li className="relative flex items-center">
      {/* Trigger button — hover zone is exactly the button, nothing more */}
      <button
        className="nav-btn flex items-center text-sm font-medium uppercase tracking-wider text-text-secondary hover:text-primary bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm transition-colors duration-200 py-1"
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseEnter={handleButtonEnter}
        onMouseLeave={scheduleClose}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 z-100 min-w-50 pt-2"
          role="listbox"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <ul
            className="rounded-xl shadow-2xl overflow-hidden border border-[rgb(180,160,130)] list-none p-0 m-0 py-1 animate-fade-in"
            style={{ color: '#1f2937' }}
          >
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={dropdownItemClass}
                  onClick={handleItemClick}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export const Navigation: React.FC = () => (
  <nav aria-label="Main navigation">
    <ul className="hidden lg:flex flex-1 items-center justify-center gap-6 list-none p-0 m-0">
      <li>
        <NavLink to="/" className={navLinkClass} end>Home</NavLink>
      </li>
      <li>
        <NavLink to="/about-us" className={navLinkClass}>About</NavLink>
      </li>

      <DropdownMenu label="Pujo Schedule" items={pujoScheduleDays} />

      <li>
        <NavLink to="/anudan" className={navLinkClass}>Anudan</NavLink>
      </li>

      <DropdownMenu label="Bhog Booking" items={bhogBookingDays} />

      <li>
        <NavLink to="/gallery" className={navLinkClass}>Gallery</NavLink>
      </li>
      <li>
        <NavLink to="/contact-us" className={navLinkClass}>Contact</NavLink>
      </li>
    </ul>
  </nav>
);

export default Navigation;
