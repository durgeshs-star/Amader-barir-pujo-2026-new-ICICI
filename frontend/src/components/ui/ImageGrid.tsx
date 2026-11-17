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
        className="min-h-48 w-full bg-linear-to-br from-primary to-accent flex flex-col justify-center items-center p-4 text-center select-none"
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
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className="block h-auto w-full object-contain"
    />
  );
});

const ImageGrid: React.FC<ImageGridProps> = React.memo(({
  images,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}) => {
  const columnClassesByBreakpoint: Record<string, Record<number, string>> = {
    mobile: { 1: 'columns-1', 2: 'columns-2', 3: 'columns-3', 4: 'columns-4' },
    tablet: { 1: 'md:columns-1', 2: 'md:columns-2', 3: 'md:columns-3', 4: 'md:columns-4' },
    desktop: { 1: 'lg:columns-1', 2: 'lg:columns-2', 3: 'lg:columns-3', 4: 'lg:columns-4' },
    xl: { 1: 'xl:columns-1', 2: 'xl:columns-2', 3: 'xl:columns-3', 4: 'xl:columns-4' },
  };
  const columnClasses = [
    columns.mobile ? columnClassesByBreakpoint.mobile[columns.mobile] : '',
    columns.tablet ? columnClassesByBreakpoint.tablet[columns.tablet] : '',
    columns.desktop ? columnClassesByBreakpoint.desktop[columns.desktop] : '',
    columns.xl ? columnClassesByBreakpoint.xl[columns.xl] : '',
  ].filter(Boolean).join(' ');

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={`${columnClasses} gap-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {images.map((img, index) => (
          <m.div
            key={img.id}
            className={`group relative mb-6 inline-block w-full break-inside-avoid rounded-xl overflow-hidden shadow bg-primary/10 border border-[rgb(180,160,130)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${img.className || ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5), ease: "easeOut" }}
          >
            <GalleryImageWithFallback src={img.src} alt={img.alt} />
          </m.div>
        ))}
      </m.div>
    </LazyMotion>
  );
});

export default ImageGrid;
