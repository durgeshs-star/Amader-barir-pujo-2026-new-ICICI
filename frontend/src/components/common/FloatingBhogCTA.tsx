import React from 'react';
import { NavLink } from 'react-router-dom';
import { bhogBookingDays } from '../../config/navData';

interface FloatingBhogCTAProps {
  fixed?: boolean;
}

export const FloatingBhogCTA: React.FC<FloatingBhogCTAProps> = ({ fixed = false }) => {
  const [bhogOpen, setBhogOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  return (
    <div className={`lg:hidden ${fixed ? 'fixed bottom-4' : 'absolute bottom-4'} left-1/2 -translate-x-1/2 z-[150] pointer-events-auto`} ref={containerRef}>
      <div className="relative">
        <button
          onClick={() => setBhogOpen(!bhogOpen)}
          className="bhog-button-pulse bg-primary text-text-on-primary px-5 py-2.5 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wide border-2 border-accent hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent whitespace-nowrap"
          aria-haspopup="listbox"
          aria-expanded={bhogOpen}
        >
          Book Your Bhog
        </button>

        {/* Dropdown panel */}
        {bhogOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 z-[200] min-w-[200px] pt-2 mt-1 pointer-events-auto"
            role="listbox"
          >
            <ul
              className="rounded-xl shadow-2xl overflow-hidden border-2 border-[rgb(180,160,130)] list-none p-0 m-0 py-2 animate-fade-in bg-white"
            >
              {bhogBookingDays.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="px-4 py-2.5 text-[14px] font-medium tracking-wide transition-all duration-200 block border-l-[3px] hover:text-white hover:bg-primary border-transparent text-gray-800 cursor-pointer"
                    onClick={() => setBhogOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingBhogCTA;
