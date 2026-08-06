import React from 'react';

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  srcset?: string;
  sizes?: string;
  overlay?: string;
  height?: string;
  objectPosition?: string;
}

const DEFAULT_BACKGROUND = "/assets/img/new-hero-image.webp";
const DEFAULT_HEIGHT = "h-[30vh] md:h-[70vh]";

export const PageHero: React.FC<PageHeroProps> = React.memo(({
  title,
  subtitle,
  backgroundImage = DEFAULT_BACKGROUND,
  srcset,
  sizes,
  overlay = "", // Overlay is now handled by the inline style gradient
  height = DEFAULT_HEIGHT,
  objectPosition = "center",
}) => {
  return (
    <>
      <section className={`relative ${height} overflow-hidden`} style={{ minHeight: '320px' }}>
        <img
          src={backgroundImage}
          srcSet={srcset}
          sizes={sizes}
          alt={`${title} - Background image`}
          className={`absolute inset-0 w-full h-full object-cover`}
          style={{ objectPosition }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={1080}
        />

        <div 
          className={`absolute inset-0 ${overlay}`} 
          style={{
            background: 'linear-gradient(to right, rgba(42, 10, 20, 0.85) 0%, rgba(42, 10, 20, 0.65) 5%, rgba(0, 0, 0, 0) 15%), linear-gradient(to left, rgba(42, 10, 20, 0.85) 0%, rgba(42, 10, 20, 0.65) 5%, rgba(0, 0, 0, 0) 15%)'
          }}
        />
      </section>

      <section className="relative z-10 pt-8 md:pt-4">
        <div className="text-center px-6 animate-fade-in-up">
          <h1 className="font-fraunces text-4xl md:text-6xl text-primary font-bold">
            {title}
          </h1>

          {subtitle && (
            <p className="text-text-secondary mt-4 max-w-4xl mx-auto text-center text-md">
              {subtitle}
            </p>
          )}
        </div>
      </section>
    </>
  );
});

export default PageHero;
