import React from 'react';
import Button from '../ui/Button';

export const Hero: React.FC = () => {
  const handleScrollToContent = () => {
    const contentEl = document.getElementById('experience-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-[78vh] md:h-[82vh] flex items-end overflow-hidden bg-dark-bg text-white select-none">

      {/* ── LCP Hero Image ─────────────────────────────────────────────────
          Using a real <img> instead of CSS background-image so the browser
          preloader can discover and fetch it at the highest priority via the
          <link rel="preload"> in index.html.
          Visual result is identical: object-cover + object-position matches
          the old backgroundPosition: 'center 20%'. */}
      <img
        src="/assets/img/puja/35-480.webp"
        srcSet="
          /assets/img/puja/35-480.webp   480w,
          /assets/img/puja/35-768.webp   768w,
          /assets/img/puja/35-1280.webp 1280w,
          /assets/img/puja/35-1920.webp 1920w"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, (max-width: 1280px) 1024px, 1280px"
        alt="Amader Barir Pujo celebration with traditional Durga Pujo decorations and festive atmosphere"
        aria-hidden="true"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-[center_20%] z-0"
      />

      {/* Gradient — only at the bottom-left to make text readable, rest of image stays clear */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to right, rgba(42,10,20,0.85) 0%, rgba(42,10,20,0.65) 40%, rgba(0,0,0,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Content — bottom-left, matching reference layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 md:pb-20">
        <div className="max-w-2xl">

          {/* Title — large display, two visual lines */}
          <h1 className="font-fraunces leading-none mb-6 select-text text-4xl sm:text-5xl md:text-6xl font-bold text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            Amader Barir Pujo
          </h1>

          {/* Body text */}
          <p
            className="text-sm md:text-base text-white font-sans leading-relaxed mb-8 max-w-md select-text"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
          >
            A vibrant Bengali community celebration, Amader Barir Pujo has been a cherished home away
            from home — keeping alive the warmth, traditions, and festive spirit of Bengal.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="accent" size="md" onClick={handleScrollToContent}>
              Explore Pujo
            </Button>
            <a href="/volunteer">
              <Button variant="outline" size="md" className="text-white border-white/80 hover:bg-white hover:!text-primary">
                Become a Volunteer
              </Button>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Hero;
