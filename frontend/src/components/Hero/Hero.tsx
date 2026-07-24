import React from 'react';
import Button from '../ui/Button';

export const Hero: React.FC = React.memo(() => {
  const handleScrollToContent = () => {
    const contentEl = document.getElementById('experience-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[5vh] lg:h-screen flex items-center overflow-hidden bg-dark-bg text-white">

      <picture>
        <source
          srcSet="/assets/img/hero-image.webp"
          type="image/webp"
        />
        <img
          src="/assets/img/hero-image.webp"
          alt="Amader Barir Pujo celebration with traditional Durga Pujo decorations and festive atmosphere"
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover
object-[50%_0%]
sm:object-[50%_5%]
md:object-[50%_10%]
lg:object-[50%_85%]
z-0"
        />
      </picture>

      {/* Gradient — only at the bottom-left to make text readable, rest of image stays clear */}
      <div
        className="absolute inset-0 z-1"
        style={{
          background: 'linear-gradient(to right, rgba(42,10,20,0.85) 0%, rgba(42,10,20,0.65) 40%, rgba(0,0,0,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Content — bottom-left, matching reference layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto lg:px-8">
        <div className="max-w-2xl mb-2">

          {/* Title — large display, two visual lines */}
          <h1 className="font-fraunces-italic leading-none mb-6 select-text text-4xl sm:text-5xl md:text-5xl font-bold text-white text-left" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            Amader Barir Pujo<sup className="text-2xl md:text-3xl font-normal">&reg;</sup>
          </h1>

          {/* Body text */}
          <div
            className="text-sm md:text-base text-white font-sans leading-relaxed mb-8 max-w-md select-text space-y-4"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
          >
            <p>More than a celebration, it's a feeling we carry with us.</p>
            <p>A place where strangers become friends, children grow up making memories, and with Maa at the heart of it all, the familiar rhythm of dhaak, laughter, and adda reminds us what together feels like.</p>
            <p className="font-bold text-accent">Free for all. Just as Pujo should be.</p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="accent" size="md" onClick={handleScrollToContent}>
              Explore Pujo
            </Button>
            {/* <a href="/gallery?category=bhog">
              <Button variant="outline" size="md" className="text-white border-white/80 hover:bg-white hover:text-primary!">
                View Bhog Gallery
              </Button>
            </a> */}
            <a href="/volunteer">
              <Button variant="outline" size="md" className="text-white border-white/80 hover:bg-white hover:text-primary!">
                Be a Bari Member
              </Button>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
});

export default Hero;
