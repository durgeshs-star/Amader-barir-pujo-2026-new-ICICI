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
        title="Free Bengali Durga Puja in Pune 2026 | Amader Barir Pujo"
        description="Amader Barir Pujo 2026 is a free Bengali Durga Puja celebration in Pune, welcoming families and visitors from Wakad, Hinjewadi and surrounding areas."
        keywords="Free Durga Puja Pune, Bengali Durga Puja Pune, Durga Puja Pune 2026, Durga Puja in Wakad, Durga Puja near Hinjewadi, Durga Puja pandal Pune, Amader Barir Pujo"
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
