import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/ui/SEO';
import { galleryImages } from '../assets/data/galleryData';

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | '2024' | '2025'>('all');

  const filteredImages = filter === 'all' ? galleryImages : galleryImages.filter(img => img.year === filter);

  return (
    <div className="pt-10 md:pt-14 pb-20 bg-light-bg/30 min-h-screen">
      <SEO title="Gallery" description="Browse photos from Amader Barir Pujo celebrations in Wakad, Pune — Durga Puja rituals, Bhog, cultural programs, and community moments." keywords="Durga Puja gallery Pune, Amader Barir Pujo photos, Bengali festival photos Wakad" />
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-3">
            Pujo Gallery
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Visual memories of spiritual moments and celebrations
          </p>
          <motion.div 
            className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          />
        </motion.div>

        {/* Categories controls */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-2 mb-10 select-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          {(['all', '2024', '2025'] as const).map((year) => (
            <motion.button
              key={year}
              onClick={() => setFilter(year)}
              className={`px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === year
                  ? 'bg-primary text-white shadow'
                  : 'bg-white text-gray-650 hover:bg-light-bg hover:text-primary border border-gray-150'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {year === 'all' ? 'All' : year}
            </motion.button>
          ))}
        </motion.div>

        {/* Image Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          {filteredImages.map((img, index) => (
            <motion.div
              key={img.id}
              className="group relative rounded-xl overflow-hidden shadow bg-primary/10 border border-gray-100 hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + (index * 0.05), ease: "easeOut" }}
              whileHover={{ y: -5 }}
            >
              <GalleryImageWithFallback src={img.src} alt={img.alt} />
              
              {/* Overlay Text Details on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10 pointer-events-none">
                <span className="text-[10px] text-accent font-bold uppercase tracking-widest">{img.year}</span>
                <h3 className="text-base font-bold text-white font-fraunces mt-0.5">{img.alt}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

// Fallback image helper
interface ImageProps {
  src: string;
  alt: string;
}
const GalleryImageWithFallback: React.FC<ImageProps> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className="w-full h-full bg-gradient-to-br from-primary to-accent flex flex-col justify-center items-center p-4 text-center select-none"
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


