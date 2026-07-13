import React, { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';

export interface ImageGridItem {
  id: string | number;
  src: string;
  alt: string;
  year?: string;
  className?: string;
}

export interface ImageGridProps {
  images: ImageGridItem[];
  showYear?: boolean;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    xl?: number;
  };
}

// Fallback image helper
interface ImageProps {
  src: string;
  alt: string;
}

const GalleryImageWithFallback: React.FC<ImageProps> = React.memo(({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="w-full h-full bg-linear-to-br from-primary to-accent flex flex-col justify-center items-center p-4 text-center select-none"
      >
        <span className="text-accent-text text-3xl font-bold font-fraunces leading-none opacity-60">ABP</span>
        <span className="text-text-on-primary/70 text-[10px] uppercase font-semibold tracking-widest mt-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width="300"
      height="225"
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
    />
  );
});

const ImageGrid: React.FC<ImageGridProps> = React.memo(({
  images,
  showYear = true,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}) => {
  const gridCols = `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}${columns.xl ? ` xl:grid-cols-${columns.xl}` : ''}`;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={`grid ${gridCols} gap-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {images.map((img, index) => (
          <m.div
            key={img.id}
            className={`group relative rounded-xl overflow-hidden shadow bg-primary/10 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${img.className || ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5), ease: "easeOut" }}
          >
            <GalleryImageWithFallback src={img.src} alt={img.alt} />

            {/* Overlay Text Details on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10 pointer-events-none">
              {showYear && img.year && (
                <span className="text-[10px] text-accent-text font-bold uppercase tracking-widest">{img.year}</span>
              )}
              <h3 className="text-base font-bold text-white font-fraunces mt-0.5">{img.alt}</h3>
            </div>
          </m.div>
        ))}
      </m.div>
    </LazyMotion>
  );
});

export default ImageGrid;
