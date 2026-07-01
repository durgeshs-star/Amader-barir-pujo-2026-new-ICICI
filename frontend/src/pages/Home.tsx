import React, { Suspense } from 'react';
import Hero from '../components/Hero/Hero';
import SpiritSection from '../components/Sections/SpiritSection';
import SEO from '../components/ui/SEO';

// Lazy load below-fold sections to reduce initial JS bundle
const TestimonialsSection = React.lazy(() => import('../components/Sections/TestimonialsSection'));

const SectionSkeleton: React.FC = () => (
  <div 
    className="bg-white" 
    style={{ minHeight: '400px' }}
    aria-hidden="true"
    role="status"
    aria-label="Loading section…"
  />
);

export const Home: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        description="Amader Barir Pujo, Pune — A vibrant Bengali community celebration. Devotional services, Bhog, cultural programs, and sacred rituals. Open to everyone."
        keywords="Durga Puja Pune, Bengali community Pune, Amader Barir Pujo, Wakad Durga Puja 2026"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/"
      />
      <Hero />
      <SpiritSection />
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>
    </div>
  );
};

export default Home;
