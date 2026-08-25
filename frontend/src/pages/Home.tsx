import React, { Suspense } from 'react';
import Hero from '../components/Hero/Hero';
import SEO from '../components/ui/SEO';

// Lazy load below-fold sections to reduce initial JS bundle
const SpiritSection = React.lazy(() => import('../components/Sections/SpiritSection'));
const TestimonialsSection = React.lazy(() => import('../components/Sections/TestimonialsSection'));

const SectionSkeleton: React.FC = () => (
  <div
    style={{ minHeight: '400px', backgroundColor: 'oklch(98.7% 0.022 95.277)' }}
    aria-hidden="true"
    role="status"
    aria-label="Loading section…"
  />
);

export const Home: React.FC = React.memo(() => {
  return (
    <div className="relative">
      <SEO
        title="Durga Puja in Pune 2026"
        description="Amader Barir Pujo — A vibrant Bengali community celebration in Pune. Join us for Durga Puja 2026 with devotional services, Bhog, cultural programs, and sacred rituals. Open to everyone."
        keywords="Durga Puja Pune, Durga Puja 2026 Pune, Bengali community Pune, Amader Barir Pujo, Wakad Durga Puja"
        ogImage="/assets/img/banner/1.webp"
      />
      <Hero />
      <Suspense fallback={<SectionSkeleton />}>
        <div className="content-layer">
          <SpiritSection />
        </div>
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <div className="content-layer">
          <TestimonialsSection />
        </div>
      </Suspense>
    </div>
  );
});

export default Home;
