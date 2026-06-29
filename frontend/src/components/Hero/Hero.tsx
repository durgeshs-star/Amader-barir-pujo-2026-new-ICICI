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
    <div className="relative min-h-[95vh] md:min-h-screen flex items-end overflow-hidden bg-dark-bg text-white select-none">

      {/* Full-bleed background image — position shifted down so the goddess face clears the navbar */}
      <div
        className="absolute inset-0 bg-cover z-0"
        style={{
          backgroundImage: "url('/assets/img/puja/35.webp')",
          backgroundPosition: 'center 30%',
        }}
        aria-hidden="true"
      />

      {/* Gradient: strong at bottom for text, subtle dark band at top for navbar, clear in the middle */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: [
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.0) 22%)',
            'linear-gradient(to top,    rgba(42,10,20,0.88) 0%, rgba(42,10,20,0.30) 42%, rgba(0,0,0,0.0) 100%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Content — sits at the bottom left, leaving the image centre open */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pb-16 md:pb-20">
        <div className="max-w-xl">

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-fraunces leading-snug mb-4 text-white drop-shadow-lg select-text">
            Experience The Divine Spirit Of{' '}
            <span className="text-accent">Durga Pujo</span>
          </h1>

          {/* Sub-text */}
          <p className="text-sm md:text-base text-white/75 font-sans leading-relaxed mb-8 select-text max-w-md">
            Devotion, community meals, cultural programs, and sacred rituals — open to everyone.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="accent"
              size="md"
              onClick={handleScrollToContent}
            >
              Explore Pujo
            </Button>
            <a href="/volunteer">
              <Button
                variant="outline"
                size="md"
                className="text-white border-white/70 hover:bg-white hover:text-primary"
              >
                Become a Volunteer
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator — bottom right, unobtrusive */}
      <div className="absolute bottom-6 right-8 z-10 hidden md:flex flex-col items-center gap-1.5">
        <button
          onClick={handleScrollToContent}
          className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors duration-300 bg-transparent border-0 cursor-pointer focus:outline-none"
          aria-label="Scroll to main content"
        >
          <div className="w-[1px] h-10 bg-white/30" />
          <span className="text-[10px] uppercase tracking-widest rotate-90 origin-center translate-y-4">Scroll</span>
        </button>
      </div>

    </div>
  );
};

export default Hero;
