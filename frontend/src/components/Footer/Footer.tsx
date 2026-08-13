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
              Contact
            </h3>
            <ul className="space-y-3 text-sm list-none p-0 m-0 pt-2">
              <li className="flex items-start gap-2">
                <FaPhoneAlt className="text-accent mt-1 shrink-0" size={12} />
                <a href="tel:+919879879302" className="text-text-on-primary hover:text-accent transition-colors">+91 7798 57 7880</a>
                <span className="mx-2" aria-hidden="true">|</span>
                <a href="tel:+919049008727" className="text-text-on-primary hover:text-accent transition-colors">+91 9049 00 8727</a>
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
                  Wakad, Pimpri-Chinchwad, Pune, <br />Maharashtra 411057
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
                  Be a Bari'r Member
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
              Pujo Venue
            </h3>
            <div className="space-y-3 text-sm">
              <div className="pt-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m19!1m8!1m3!1d1890.7322603623002!2d73.744257!3d18.598165!3m2!1i1024!2i768!4f13.1!4m8!3e0!4m0!4m5!1s0x3bc2bbeb10eb10db%3A0x18c37f8274a71fd!2sSant%20Tukaram%20Garden%20And%20Banquet%20Hall%20%7C%20Dropada%20Lawns%2C%20Dange%20Chowk%20Rd%2C%20Bhatewara%20Nagar%2C%20Hinjawadi%2C%20Wakad%2C%20Pimpri-Chinchwad%2C%20Maharashtra%20411057!3m2!1d18.5985952!2d73.7442186!5e0!3m2!1sen!2sin!4v1785820156064!5m2!1sen!2sin"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="rounded-lg"
                />
                
              <p className="text-text-inverse-muted py-4">
                Sant Tukaram Garden And Banquet Hall, Hinjawadi, Wakad, Pimpri-Chinchwad, Maharashtra 411057
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors text-sm font-semibold"
              >
                <FaMapMarkerAlt size={12} />
                Get Directions
              </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Bottom copyright bar */}
      <div className="py-8 px-6 bg-black/30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright text */}
          <div className="text-sm text-text-inverse-muted text-center md:text-left select-text">
            Copyright &copy; Amader Bari'r Pujo - <span className="text-accent font-bold">2026</span>
          </div>

          {/* Logo brand */}
          <div className="select-none flex justify-center items-center">
            <a href="/" aria-label="Amader Bari'r Pujo Home">
              <img
                src="/assets/img/ABP-LOGO-WHITE.png"
                alt="Amader Bari'r Pujo"
                className="h-16 w-auto object-contain"
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
              />
            </a>

            <a
              href="https://proplusdatafoundation.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ProPlus Data Foundation"
            >
              <img
                src="/assets/img/logo-white.png"
                alt="ProPlus Data Foundation"
                className="h-12 w-auto object-contain ml-6"
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>

          {/* Socials */}
          <ul className="flex items-center gap-4 list-none p-0 m-0 select-none" style={{ minHeight: '32px' }}>
            <li>
              <a
                href="https://www.facebook.com/people/Amader-Barir-Pujo/61571741439510/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Amader Bari'r Pujo on Facebook"
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
                aria-label="Follow Amader Bari'r Pujo on Instagram"
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
