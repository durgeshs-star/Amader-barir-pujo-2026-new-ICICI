import React from 'react';
import HeroParticles from './HeroParticles';
import HeroWatermark from './HeroWatermark';
import Button from '../ui/Button';

export const Hero: React.FC = () => {
  // Navigation helper to scroll down or navigate to details
  const handleScrollToContent = () => {
    const contentEl = document.getElementById('experience-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[85vh] md:min-h-[100vh] flex items-center justify-center overflow-hidden bg-dark-bg text-white select-none">
      {/* Background Image Overlay with Fallback Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat bg-[center_top] opacity-40 md:opacity-50 transition-opacity duration-500 z-0"
        style={{
          backgroundImage: "url('/assets/img/puja/35.webp'), linear-gradient(135deg, #1e1115 0%, #7E4555 50%, #643441 100%)",
        }}
        aria-hidden="true"
      />
      
      {/* Dark Vignette Overlay for Premium Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-black/30 z-[1]" aria-hidden="true" />

      {/* Floating Spark Particles */}
      <HeroParticles />

      {/* Sanskrit OM Watermark Graphic */}
      <HeroWatermark />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24 text-center">
        {/* Subtitle */}
        <p className="text-accent text-sm md:text-base font-semibold tracking-[0.25em] uppercase mb-4 animate-fade-in">
          Amader Barir Pujo, Wakad (Pune)
        </p>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-fraunces leading-tight mb-6 text-white drop-shadow-xl select-text">
          Experience The Divine Spirit Of <span className="text-accent">Durga Pujo</span>
        </h1>

        {/* Description */}
        <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto font-sans leading-relaxed mb-10 select-text">
          Discover devotional services, sacred rituals, community meals, and spiritual programs in our alternate home layout. Open to everyone.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="accent" 
            size="lg" 
            onClick={handleScrollToContent}
            className="w-full sm:w-auto shadow-accent/20 hover:shadow-accent/40"
          >
            Explore Pujo
          </Button>
          <a href="/volunteer" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full text-white border-white hover:bg-white hover:text-primary transition-all duration-300"
            >
              Become a Volunteer
            </Button>
          </a>
        </div>
      </div>

      {/* Decorative Bottom Wave/Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <button
          onClick={handleScrollToContent}
          className="flex flex-col items-center gap-1.5 text-white/50 hover:text-white transition-colors duration-300 bg-transparent border-0 cursor-pointer focus:outline-none"
          aria-label="Scroll to main content"
        >
          <span className="text-xs uppercase tracking-widest font-semibold">Scroll</span>
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Hero;
