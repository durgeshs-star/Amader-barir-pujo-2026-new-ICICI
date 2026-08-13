import React from 'react';
import SEO from "../components/ui/SEO";
import PageHero from "../components/common/PageHero";
import AboutSection from "../components/About/AboutSection";
import { FleaMarketSection } from '../components/schedule';

const About = React.memo(() => {
  return (
    <div className="relative">
      <SEO
        title="About Us | Amader Barir Pujo"
        description="Learn about our journey, vision, mission and the spirit of Amader Barir Pujo - a vibrant Bengali community celebration in Pune organized by Pro Plus Data Foundation."
        keywords="About Amader Barir Pujo, Durga Puja Pune, Bengali Community Pune, Pro Plus Data Foundation, Wakad Pune"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/about-us"
      />

      <PageHero
        title="About Us"
        subtitle="Keeping traditions alive while celebrating faith, culture and togetherness."
        height="h-[35vh] md:h-[60vh]"
      />
      <AboutSection />
      <FleaMarketSection />
    </div>
  );
});

export default About;