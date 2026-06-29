import React, { useState } from 'react';

interface ImageItem {
  id: number;
  category: 'murtis' | 'dhunuchi' | 'sindoor' | 'rituals';
  title: string;
  src: string;
  gradient: string;
}

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'murtis' | 'dhunuchi' | 'sindoor' | 'rituals'>('all');

  const galleryImages: ImageItem[] = [
    { id: 1, category: 'murtis', title: 'Maa Durga idol', src: '/assets/img/puja/35.webp', gradient: 'from-primary to-accent' },
    { id: 2, category: 'dhunuchi', title: 'Dhunuchi dance', src: '/assets/img/puja/1.webp', gradient: 'from-orange-700 via-primary to-dark-bg' },
    { id: 3, category: 'sindoor', title: 'Sindoor Boron rituals', src: '/assets/img/puja/2.webp', gradient: 'from-rose-800 to-primary-light' },
    { id: 4, category: 'rituals', title: 'Bodhon prayer', src: '/assets/img/puja/3.webp', gradient: 'from-primary via-accent to-dark-bg' },
    { id: 5, category: 'dhunuchi', title: 'Sandhya aarti dhunuchi', src: '/assets/img/puja/4.webp', gradient: 'from-red-800 to-amber-900' },
    { id: 6, category: 'sindoor', title: 'Bijoya celebrations', src: '/assets/img/puja/5.webp', gradient: 'from-primary-dark to-accent-light' }
  ];

  const filteredImages = filter === 'all' ? galleryImages : galleryImages.filter(img => img.category === filter);

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-light-bg/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-3">
            Pujo Gallery
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Visual memories of spiritual moments and celebrations
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Categories controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 select-none">
          {(['all', 'murtis', 'dhunuchi', 'sindoor', 'rituals'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer capitalize ${
                filter === cat
                  ? 'bg-primary text-white shadow'
                  : 'bg-white text-gray-650 hover:bg-light-bg hover:text-primary border border-gray-150'
              }`}
            >
              {cat === 'all' ? 'All Images' : cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-4/3 rounded-xl overflow-hidden shadow bg-primary/10 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <GalleryImageWithFallback src={img.src} alt={img.title} gradient={img.gradient} />
              
              {/* Overlay Text Details on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10 pointer-events-none">
                <span className="text-[10px] text-accent font-bold uppercase tracking-widest">{img.category}</span>
                <h3 className="text-base font-bold text-white font-fraunces mt-0.5">{img.title}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// Fallback image helper
interface ImageProps {
  src: string;
  alt: string;
  gradient: string;
}
const GalleryImageWithFallback: React.FC<ImageProps> = ({ src, alt, gradient }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col justify-center items-center p-4 text-center select-none`}
      >
        <span className="text-accent text-3xl font-bold font-fraunces leading-none opacity-40">ABP</span>
        <span className="text-white/40 text-[10px] uppercase font-semibold tracking-widest mt-2">{alt}</span>
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
      onError={() => setHasError(true)}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
    />
  );
};

export default Gallery;
