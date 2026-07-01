import React from 'react';
import Hero from '../components/Hero/Hero';
import SpiritSection from '../components/Sections/SpiritSection';
import TestimonialsSection from '../components/Sections/TestimonialsSection';
import SEO from '../components/ui/SEO';

export const Home: React.FC = () => {
  return (
    <div className="relative animate-fade-in">
      <SEO
        description="Amader Barir Pujo, Pune — A vibrant Bengali community celebration. Devotional services, Bhog, cultural programs, and sacred rituals. Open to everyone."
        keywords="Durga Puja Pune, Bengali community Pune, Amader Barir Pujo, Wakad Durga Puja 2026"
        ogImage="/assets/img/banner/1.webp"
      />
      <Hero />
      <SpiritSection />
      <TestimonialsSection />
    </div>
  );
};

export default Home;
