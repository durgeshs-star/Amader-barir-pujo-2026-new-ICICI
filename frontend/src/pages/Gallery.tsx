import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/ui/SEO';
import ImageGrid from '../components/ui/ImageGrid';
import { galleryImages, type GalleryImage } from '../assets/data/galleryData';

type CategoryFilter = 'all' | 'pujo' | 'cultural' | 'bhog' | 'volunteer';
type YearFilter = '2024' | '2025';

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
  const [yearFilter, setYearFilter] = useState<YearFilter>('2025');

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
    if (cat === 'pujo') {
      setYearFilter('2025');
    }
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleYearChange = (year: YearFilter) => {
    setYearFilter(year);
  };

  const filteredImages: GalleryImage[] = categoryFilter === 'all'
    ? shuffledAllImages
    : categoryFilter === 'pujo'
    ? galleryImages.filter(img => img.category === categoryFilter && img.year === yearFilter)
    : galleryImages.filter(img => img.category === categoryFilter);

  return (
    <div className="relative pt-10 md:pt-14 pb-20 min-h-screen">
      <SEO 
        title="Bengali Durga Puja Pune | Puja Pandal & Celebration Gallery"
        description="Explore the Amader Barir Pujo gallery — Bengali Durga Puja pandal and celebration photos from Pune. View Durga Puja rituals, cultural programs, and community moments."
        keywords="Bengali Durga Puja Pune, Durga Puja pandal Pune, Amader Barir Pujo gallery, Durga Puja celebrations Pune, Puja pandal photos"
      />
      <div className="max-w-6xl mx-auto px-3 sm:px-2 lg:px-16 xl:px-0 pb-4 lg:py-8 xl:py-0">

        {/* Title - CSS animation instead of framer-motion */}
        <div className="text-center mb-10 animate-fade-in-down">
          <h1 className="text-4xl md:text-6xl font-bold text-primary font-fraunces mb-3">
            Durga Puja Gallery
          </h1>
          <p className="text-sm text-muted font-medium text-center">
            Explore our Durga Pujo pandal and celebration photos from Pune
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

        {/* Year Filter - Only show when Pujo category is selected */}
        {categoryFilter === 'pujo' && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 select-none animate-fade-in-up">
            {([
              { key: '2024' as YearFilter, label: '2024' },
              { key: '2025' as YearFilter, label: '2025' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleYearChange(key)}
                className={`px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${yearFilter === key
                  ? 'bg-primary text-text-on-primary shadow'
                  : 'bg-light-bg text-secondary hover:bg-light-bg hover:text-primary border border-border'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

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
