import React from 'react';
import SEO from "../components/ui/SEO";
import PageHero from "../components/common/PageHero";
import AboutSection from "../components/About/AboutSection";
import { FleaMarketSection } from '../components/schedule';

const About = React.memo(() => {
  return (
    <div className="relative">
      <SEO
        title="About Amader Barir Pujo | Bengali Durga Puja Pune"
        description="Discover Amader Barir Pujo 2026 — a free Bengali Durga Puja celebration in Pune. Learn about our traditions, community spirit, and the joy of Durga Puja in Wakad and Hinjewadi."
        keywords="Bengali Durga Puja Pune, Amader Barir Pujo 2026, Bengali community Pune, Durga Puja traditions, Durga Puja in Wakad, Durga Puja near Hinjewadi"
        ogImage="/assets/img/banner/1.webp"
      />

      <PageHero
        title="About Amader Barir Pujo"
        subtitle="Keeping traditions alive while celebrating faith, culture and togetherness."
        height="h-[35vh] md:h-[60vh]"
      />
      <AboutSection />
      <FleaMarketSection />
    </div>
  );
});

export default About;