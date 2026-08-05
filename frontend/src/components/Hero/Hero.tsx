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
    <div data-hero className="relative min-h-0 lg:h-screen lg:min-h-0 flex flex-col lg:flex-row lg:items-center overflow-hidden bg-dark-bg text-white">

      <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[60vh] lg:absolute lg:inset-0 lg:h-full z-0">
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
            className="w-full h-full object-cover
object-[50%_0%]
sm:object-[50%_5%]
md:object-[50%_10%]
lg:object-[50%_85%]"
          />
        </picture>

        {/* Gradient — left-side only on larger screens */}
        <div
          className="hidden lg:block absolute inset-0 z-1"
          style={{
            background: 'linear-gradient(to right, rgba(42,10,20,0.85) 0%, rgba(42,10,20,0.65) 40%, rgba(0,0,0,0) 70%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content — below image on mobile, overlaid on left on desktop */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 pb-4 lg:py-0 flex-1 flex flex-col justify-center text-center lg:text-left">
        <div className="max-w-2xl mb-2 mx-auto lg:mx-0">

          {/* Title — large display, two visual lines */}
          <h1
            className="font-fraunces-italic leading-tight mb-4 sm:mb-6 select-text text-3xl xs:text-4xl sm:text-5xl md:text-5xl font-bold text-white text-center lg:text-left break-words"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            আমাদের বাড়ির পূজো
            <sup className="relative -top-4 sm:-top-8 text-lg sm:text-2xl md:text-3xl font-normal">
              &reg;
            </sup>
          </h1>

          {/* Body text */}
          <div
            className="text-sm md:text-base text-white font-sans leading-relaxed mb-4 sm:mb-6 max-w-md select-text space-y-3 sm:space-y-4 text-center lg:text-left mx-auto lg:mx-0"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
          >
            <p>More than a celebration, it's a feeling we carry with us.</p>
            <p>A place where strangers become friends, children grow up making memories, and with Maa at the heart of it all, the familiar rhythm of dhaak, laughter, and adda reminds us what together feels like.</p>
            <p className="font-bold text-accent text-center">Free for all. Just as Pujo should be.</p>
          </div>

          {/* Bengali content */}
          <div
            className="text-sm sm:text-base md:text-lg text-white font-sans leading-relaxed mb-6 sm:mb-8 max-w-md select-text space-y-2 sm:space-y-3 text-center lg:text-left mx-auto lg:mx-0"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
          >
            <p>আমাদের বাড়ী,শুধু চারটে দেওয়াল নয়, আমাদের বাড়ী একটা যৌথ পরিবার যা দাঁড়িয়ে আছে বন্ধুত্ব ,সৌজন্য আর নিয়মের ব্ন্ধনের স্তম্ভের উপর ।</p>
            <p>এখানে পূজোর অনুদানের কোনও শৃঙ্খল নেই , নেই কোনও গরিমার প্রকাশ , আছে শুধু ঢাকের বাদ্যি‌ ,পূজোর আনন্দ, উচ্ছ্বাস আর নতুন সৃষ্ঠির বহমানতা ।</p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-6 sm:pb-0 justify-center lg:justify-start items-center lg:items-stretch">
  <Button
    variant="primary"
    size="md"
    onClick={handleScrollToContent}
    className="w-full sm:w-auto transition-all duration-300"
  >
    Explore Pujo
  </Button>

  <a href="/volunteer" className="w-full sm:w-auto">
    <Button
      variant="accent"
      size="md"
      className="w-full sm:w-auto transition-all duration-300"
    >
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
