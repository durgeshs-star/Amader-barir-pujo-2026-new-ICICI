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

      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover z-0"
        style={{
          backgroundImage: "url('/assets/img/puja/35.webp')",
          backgroundPosition: 'center 20%',
        }}
        aria-hidden="true"
      />

      {/* Gradient — only at the bottom-left to make text readable, rest of image stays clear */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(105deg, rgba(42,10,20,0.80) 0%, rgba(42,10,20,0.60) 35%, rgba(0,0,0,0.0) 65%)',
        }}
        aria-hidden="true"
      />

      {/* Content — bottom-left, matching reference layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 md:pb-20">
        <div className="max-w-2xl">

          {/* Title — large display, two visual lines */}
          <h1 className="font-fraunces leading-none mb-6 select-text" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-white">
              Amader Barir Pujo.
            </span>
          </h1>

          {/* Body text */}
          <p
            className="text-sm md:text-base text-white/90 font-sans leading-relaxed mb-8 max-w-md select-text"
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
              <Button variant="outline" size="md" className="text-white border-white/70 hover:bg-white hover:!text-primary">
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
