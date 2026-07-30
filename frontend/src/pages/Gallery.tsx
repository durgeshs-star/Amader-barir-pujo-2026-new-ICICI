import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/ui/SEO';
import ImageGrid from '../components/ui/ImageGrid';
import { galleryImages, type GalleryImage } from '../assets/data/galleryData';

type CategoryFilter = 'all' | 'pujo' | 'cultural' | 'bhog' | 'volunteer';

/** Fisher-Yates shuffle (returns a new array) */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const VALID_CATEGORIES: CategoryFilter[] = ['all', 'pujo', 'cultural', 'bhog', 'volunteer'];

export const Gallery: React.FC = React.memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as CategoryFilter) || 'all';

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    VALID_CATEGORIES.includes(initialCategory) ? initialCategory : 'all'
  );

  // Shuffle all images once per page mount for the "All" view
  const shuffledAllImages = useMemo(() => shuffleArray(galleryImages), []);

  // Sync category filter from URL on mount
  useEffect(() => {
    const cat = searchParams.get('category') as CategoryFilter;
    if (cat && VALID_CATEGORIES.includes(cat)) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: CategoryFilter) => {
    setCategoryFilter(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filteredImages: GalleryImage[] = categoryFilter === 'all'
    ? shuffledAllImages
    : galleryImages.filter(img => img.category === categoryFilter);

  return (
    <div className="relative pt-10 md:pt-14 pb-20 min-h-screen">
      <SEO title="Gallery | Amader Barir Pujo" description="Browse photos from Amader Barir Pujo celebrations in Wakad, Pune — Durga Puja rituals, Bhog distribution, cultural programs, and community moments captured during our vibrant Bengali festival." keywords="Durga Puja gallery Pune, Amader Barir Pujo photos, Bengali festival photos Wakad, Puja celebration images, Bhog photos Pune" canonical="https://www.abp.proplusdatafoundation.com/gallery" />
      <div className="max-w-6xl mx-auto px-6">

        {/* Title - CSS animation instead of framer-motion */}
        <div className="text-center mb-10 animate-fade-in-down">
          <h1 className="text-4xl md:text-6xl font-bold text-primary font-fraunces mb-3">
            Pujo Gallery
          </h1>
          <p className="text-sm text-muted font-medium text-center">
            Memories of spiritual moments and celebrations
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full animate-expand-width" />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 select-none animate-fade-in-up">
          {([
            { key: 'all' as CategoryFilter, label: 'All' },
            { key: 'pujo' as CategoryFilter, label: 'Pujo' },
            { key: 'cultural' as CategoryFilter, label: 'Cultural' },
            { key: 'bhog' as CategoryFilter, label: 'Bhog' },
            { key: 'volunteer' as CategoryFilter, label: 'Volunteer' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${categoryFilter === key
                ? 'bg-primary text-text-on-primary shadow'
                : 'bg-light-bg text-secondary hover:bg-light-bg hover:text-primary border border-border'
                }`}
            >
              {label}
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
});

export default Gallery;
