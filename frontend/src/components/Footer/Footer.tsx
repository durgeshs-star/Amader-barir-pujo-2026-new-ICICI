import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { CONTACT_EMAIL } from '../../config/constants';

export const Footer: React.FC = () => {

  return (
    <footer className="bg-dark-bg text-text-inverse-muted select-text">

      {/* Middle Footer */}
      <div className="border-b border-white/10 py-16 px-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: About details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold font-fraunces text-white border-b-2 border-accent pb-2 w-24">
              About Us
            </h3>
            <p className="text-sm leading-relaxed text-text-inverse-muted">
              Join us in the grand celebration of Durga Pujo—experience devotion, joy, and togetherness!
            </p>
            <ul className="space-y-3 text-sm list-none p-0 m-0 pt-2">
              <li className="flex items-start gap-3">
                <FaPhoneAlt className="text-accent mt-1 shrink-0" size={12} />
                <a href="tel:+919879879302" className="text-text-on-primary hover:text-accent transition-colors">987-987-930-302</a>
              </li>
              <li className="flex items-start gap-3">
                <FaEnvelope className="text-accent mt-1 shrink-0" size={12} />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-text-on-primary hover:text-accent transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-accent mt-1 shrink-0" size={14} />
                <span className="leading-relaxed text-text-on-primary">
                  Wakad, Pune, Pimpri-Chinchwad, Maharashtra 411057
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Information Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold font-fraunces text-white border-b-2 border-accent pb-2 w-28">
              Information
            </h3>
            <ul className="space-y-2 text-sm list-none p-0 m-0">
              <li>
                <Link to="/panchami" className="text-text-on-primary hover:text-accent transition-colors block py-1">
                  Pujo Schedule
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Be a Bari Sadasya
                </Link>
              </li>
              <li>
                <Link to="/anudan" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Anudan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Others Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold font-fraunces text-white border-b-2 border-accent pb-2 w-20">
              Others
            </h3>
            <ul className="space-y-2 text-sm list-none p-0 m-0">
              <li>
                <Link to="/gallery" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  News
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Venue Location */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold font-fraunces text-white border-b-2 border-accent pb-2 w-32">
              Venue Location
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-text-on-primary leading-relaxed">
                <strong>Amader Barir Pujo 2026</strong>
              </p>
              <p className="text-text-inverse-muted leading-relaxed">
                Wakad, Pune<br />
                Pimpri-Chinchwad<br />
                Maharashtra 411057
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors text-sm font-semibold"
              >
                <FaMapMarkerAlt size={12} />
                View on Google Maps
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Bottom copyright bar */}
      <div className="py-8 px-6 bg-black/30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright text */}
          <div className="text-sm text-text-inverse-muted text-center md:text-left select-text">
            Copyright &copy; Amader Barir Pujo - <span className="text-accent font-bold">2026</span>
          </div>

          {/* Logo brand */}
          <div className="select-none flex flex-col items-center gap-1" style={{ minHeight: '48px' }}>
            <div className="flex items-center gap-2.5" style={{ minHeight: '32px' }}>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <img
                  src="/assets/img/ABP-Logo.png"
                  alt="Amader Barir Pujo"
                  className="h-10 w-10 object-contain"
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="text-lg font-bold font-fraunces text-white tracking-wide whitespace-nowrap">Amader Barir Pujo</span>
              <span className="text-[10px] bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded shrink-0">2026</span>
            </div>
            <span className="text-[10px] text-text-inverse-muted font-medium whitespace-nowrap">An Initiative by <a href="https://proplusdatafoundation.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">ProPlus Data Foundation</a></span>
          </div>

          {/* Socials */}
          <ul className="flex items-center gap-4 list-none p-0 m-0 select-none" style={{ minHeight: '32px' }}>
            <li>
              <a
                href="https://www.facebook.com/people/Amader-Barir-Pujo/61571741439510/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Amader Barir Pujo on Facebook"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/10 hover:bg-accent-dark text-text-on-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
                style={{ aspectRatio: '1/1' }}
              >
                <FaFacebookF size={12} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/abp_pune?igsh=YTZtZHVuODQxNWhj"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Amader Barir Pujo on Instagram"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/10 hover:bg-accent-dark text-text-on-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
                style={{ aspectRatio: '1/1' }}
              >
                <FaInstagram size={12} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
