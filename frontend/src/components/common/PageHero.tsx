import React from 'react';

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlay?: string;
  height?: string;
  objectPosition?: string;
}

const DEFAULT_BACKGROUND = "/assets/img/culture-2.webp";
const DEFAULT_OVERLAY = "bg-black/30";
const DEFAULT_HEIGHT = "h-[40vh] md:h-[80vh]";

export const PageHero: React.FC<PageHeroProps> = React.memo(({
  title,
  subtitle,
  backgroundImage = DEFAULT_BACKGROUND,
  overlay = DEFAULT_OVERLAY,
  height = DEFAULT_HEIGHT,
  objectPosition = "center",
}) => {
  return (
    <section className={`relative ${height} overflow-hidden`} style={{ minHeight: '320px' }}>
      <img
        src={backgroundImage}
        srcSet={`
          ${backgroundImage} 1100w,
          ${backgroundImage} 1350w,
          ${backgroundImage} 1920w
        `}
        sizes="(max-width: 768px) 1100px, (max-width: 1200px) 1350px, 1920px"
        alt={`${title} - Background image`}
        className={`absolute inset-0 w-full h-full object-cover`}
        style={{ objectPosition }}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        width={1920}
        height={1080}
      />

      <div className={`absolute inset-0 ${overlay}`} />

      <div className="relative z-10 h-full flex items-end justify-center pb-16 md:pb-24">
        <div className="text-center px-6 animate-fade-in-up">
          <h1 className="font-fraunces text-5xl md:text-7xl text-white font-bold">
            {title}
          </h1>

          {subtitle && (
            <p className="text-text-on-primary mt-4 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

export default PageHero;
