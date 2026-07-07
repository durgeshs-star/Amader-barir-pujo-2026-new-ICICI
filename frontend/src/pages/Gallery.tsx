import React, { useState } from 'react';
import SEO from '../components/ui/SEO';
import ImageGrid from '../components/ui/ImageGrid';
import { galleryImages } from '../assets/data/galleryData';

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | '2024' | '2025'>('all');

  const filteredImages = filter === 'all' ? galleryImages : galleryImages.filter(img => img.year === filter);

  return (
    <div className="pt-10 md:pt-14 pb-20 bg-light-bg/30 min-h-screen">
      <SEO title="Gallery" description="Browse photos from Amader Barir Pujo celebrations in Wakad, Pune — Durga Puja rituals, Bhog, cultural programs, and community moments." keywords="Durga Puja gallery Pune, Amader Barir Pujo photos, Bengali festival photos Wakad" canonical="https://www.abp.proplusdatafoundation.com/gallery" />
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title - CSS animation instead of framer-motion */}
        <div className="text-center mb-10 animate-fade-in-down">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-3">
            Pujo Gallery
          </h1>
          <p className="text-sm text-muted font-medium text-center">
            Visual memories of spiritual moments and celebrations
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full animate-expand-width" />
        </div>

        {/* Categories controls - CSS animation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 select-none animate-fade-in-up">
          {(['all', '2024', '2025'] as const).map((year) => (
            <button
              key={year}
              onClick={() => setFilter(year)}
              className={`px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                filter === year
                    ? 'bg-primary text-text-on-primary shadow'
                    : 'bg-white text-secondary hover:bg-light-bg hover:text-primary border border-border'
              }`}
            >
              {year === 'all' ? 'All' : year}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <ImageGrid 
          images={filteredImages}
          showYear={true}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        />

      </div>
    </div>
  );
};

export default Gallery;


