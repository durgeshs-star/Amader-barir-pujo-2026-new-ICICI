import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import { bhogBookingDays } from '../../config/navData';

interface FloatingBhogCTAProps {
  fixed?: boolean;
}

export const FloatingBhogCTA: React.FC<FloatingBhogCTAProps> = ({ fixed = false }) => {
  const [bhogOpen, setBhogOpen] = React.useState(false);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Calculate dropdown position from button's bounding rect
  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
    setBhogOpen(true);
  };

  const handleToggle = () => {
    if (bhogOpen) {
      setBhogOpen(false);
    } else {
      openDropdown();
    }
  };

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setBhogOpen(false);
      }
    };
    if (bhogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [bhogOpen]);

  // Reposition on scroll/resize so it tracks the button
  React.useEffect(() => {
    if (!bhogOpen) return;
    const reposition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
      }
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [bhogOpen]);

  const dropdown =
    bhogOpen && dropdownPos
      ? ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              transform: 'translateX(-50%)',
              zIndex: 99999,
              minWidth: '220px',
              pointerEvents: 'auto',
            }}
          >
            <ul
              className="rounded-xl overflow-hidden list-none p-0 m-0 py-2 animate-fade-in"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 2px rgba(120,80,40,0.35)',
                border: '2px solid rgb(180,160,130)',
              }}
            >
              {bhogBookingDays.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="px-5 py-1.75 text-[14px] font-semibold tracking-wide transition-all duration-200 block border-l-[3px] border-transparent hover:border-primary hover:bg-primary hover:text-white text-gray-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setBhogOpen(false);
                      window.location.href = item.path;
                    }}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        className={`lg:hidden ${fixed ? 'fixed bottom-4' : 'absolute bottom-4'} left-1/2 -translate-x-1/2 z-[150] pointer-events-auto`}
      >
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="bhog-button-pulse bg-primary text-text-on-primary px-5 py-2.5 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wide border-2 border-accent hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent whitespace-nowrap"
          aria-haspopup="listbox"
          aria-expanded={bhogOpen}
        >
          Book Your Bhog
        </button>
      </div>
      {dropdown}
    </>
  );
};

export default FloatingBhogCTA;
