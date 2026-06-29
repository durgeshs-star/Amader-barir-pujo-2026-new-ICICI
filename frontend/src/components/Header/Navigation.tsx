import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

export const Navigation: React.FC = () => {
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

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium uppercase tracking-wider transition-colors duration-250 py-4 block hover:text-secondary ${
      isActive ? 'text-secondary font-semibold' : 'text-gray-700'
    }`;

  const dropdownLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2.5 text-[13.5px] font-medium tracking-wide text-gray-700 hover:text-white hover:bg-primary transition-all duration-200 block ${
      isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : ''
    }`;

  return (
    <nav className="hidden lg:flex items-center gap-6">
      <ul className="flex items-center gap-7 list-none p-0 m-0">
        {/* Home */}
        <li>
          <NavLink to="/" className={linkStyle}>
            Home
          </NavLink>
        </li>

        {/* About */}
        <li>
          <NavLink to="/about-us" className={linkStyle}>
            About
          </NavLink>
        </li>

        {/* Pujo Schedule Dropdown */}
        <li className="relative group py-4">
          <button className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-gray-700 group-hover:text-secondary bg-transparent border-0 cursor-pointer focus:outline-none">
            <span>Pujo Schedule</span>
            <FaChevronDown size={10} className="transition-transform duration-300 group-hover:rotate-180" />
          </button>
          
          <ul className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white border border-gray-150 shadow-2xl rounded-md min-w-[210px] z-[100] py-2 list-none p-0 m-0">
            {pujoScheduleDays.map((day) => (
              <li key={day.path}>
                <NavLink to={day.path} className={dropdownLinkStyle}>
                  {day.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </li>

        {/* Anudan */}
        <li>
          <NavLink to="/anudan" className={linkStyle}>
            Anudan
          </NavLink>
        </li>

        {/* Bhog Booking Dropdown */}
        <li className="relative group py-4">
          <button className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-gray-700 group-hover:text-secondary bg-transparent border-0 cursor-pointer focus:outline-none">
            <span>Bhog Booking</span>
            <FaChevronDown size={10} className="transition-transform duration-300 group-hover:rotate-180" />
          </button>
          
          <ul className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white border border-gray-150 shadow-2xl rounded-md min-w-[210px] z-[100] py-2 list-none p-0 m-0">
            {bhogBookingDays.map((day) => (
              <li key={day.path}>
                <NavLink to={day.path} className={dropdownLinkStyle}>
                  {day.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </li>

        {/* Gallery */}
        <li>
          <NavLink to="/gallery" className={linkStyle}>
            Gallery
          </NavLink>
        </li>

        {/* Contact */}
        <li>
          <NavLink to="/contact-us" className={linkStyle}>
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
