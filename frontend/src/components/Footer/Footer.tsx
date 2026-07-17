import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaFacebookF, FaInstagram } from 'react-icons/fa';

interface RecentPost {
  title: string;
  date: string;
  image: string;
  route: string;
}

export const Footer: React.FC = () => {
  const recentPosts: RecentPost[] = [
    {
      title: "As we've all discovered by now, the world can change",
      date: 'May 20, 2026',
      image: '/assets/img/blog/sm/1.webp',
      route: '/gallery',
    },
    {
      title: 'Testimony love offering so blessed',
      date: 'May 20, 2026',
      image: '/assets/img/blog/sm/2.webp',
      route: '/gallery',
    },
    {
      title: "As we've all discovered by now, the world can change",
      date: 'May 20, 2026',
      image: '/assets/img/blog/sm/3.webp',
      route: '/gallery',
    },
  ];

  return (
    <footer className="bg-dark-bg text-text-inverse-muted select-text">

      {/* Middle Footer */}
      <div className="border-b border-white/10 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

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
                <a href="mailto:info@abp.proplusdatafoundation.com" className="text-text-on-primary hover:text-accent transition-colors">
                  info@abp.proplusdatafoundation.com
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
                  Be a Bari Member
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
            <h3 className="text-xl font-bold font-fraunces text-white border-b-2 border-accent pb-2 w-14">
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
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-accent transition-colors block py-1 text-text-on-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Recent Posts (Hidden on smaller mobile sizes) */}
          <div className="hidden lg:flex flex-col gap-4">
            <h3 className="text-xl font-bold font-fraunces text-white border-b-2 border-accent pb-2 w-28">
              Recent Posts
            </h3>
            <div className="flex flex-col gap-4">
              {recentPosts.map((post, idx) => (
                <Link key={idx} to={post.route} className="flex gap-3.5 group items-start select-none">
                  {/* Image container */}
                  <div className="shrink-0 w-16 h-12 bg-white/5 rounded overflow-hidden flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                    <PostImageWithFallback src={post.image} alt="post" />
                  </div>

                  {/* Post details */}
                  <div className="flex-1 flex flex-col justify-start">
                    <span className="text-[10px] text-accent flex items-center gap-1.5 uppercase font-semibold">
                      <FaCalendarAlt size={8} />
                      {post.date}
                    </span>
                    <h6 className="text-[13px] text-text-inverse-muted group-hover:text-accent font-bold font-sans transition-colors leading-snug line-clamp-2 mt-1">
                      {post.title}
                    </h6>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Bottom copyright bar */}
      <div className="py-8 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright text */}
          <div className="text-sm text-text-inverse-muted text-center md:text-left select-text">
            Copyright &copy; Amader Barir Pujo - <span className="text-accent font-bold">2026</span>
          </div>

          {/* Logo brand */}
          <div className="select-none flex flex-col items-center gap-1" style={{ minHeight: '48px' }}>
            <div className="flex items-center gap-2.5" style={{ minHeight: '32px' }}>
              <img
                src="/assets/img/Logo-puja-96.webp"
                srcSet="/assets/img/Logo-puja-96.webp 96w, /assets/img/Logo-puja-128.webp 128w"
                sizes="32px"
                alt="Amader Barir Pujo"
                className="h-8 w-8 object-contain shrink-0"
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
              />
              <span className="text-lg font-bold font-fraunces text-white tracking-wide whitespace-nowrap">Amader Barir Pujo</span>
              <span className="text-[10px] bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded shrink-0">2026</span>
            </div>
            <span className="text-[10px] text-text-inverse-muted font-medium whitespace-nowrap">An Initiative by <br /><a href="https://proplusdatafoundation.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">ProPlus Data Foundation</a></span>
          </div>

          {/* Socials */}
          <ul className="flex items-center gap-4 list-none p-0 m-0 select-none" style={{ minHeight: '32px' }}>
            <li>
              <a
                href="https://www.facebook.com/people/Amader-Barir-Pujo/61571741439510/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Amader Barir Pujo on Facebook"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-accent-dark text-text-on-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
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
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-accent-dark text-text-on-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
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

// Fallback image helper for posts
interface PostImageProps {
  src: string;
  alt: string;
}
const PostImageWithFallback: React.FC<PostImageProps> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-accent-text/70 text-xs">
        <FaCalendarAlt size={14} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width="80"
      height="60"
      loading="lazy"
      onError={() => setHasError(true)}
      className="object-cover w-full h-full"
    />
  );
};

export default Footer;
