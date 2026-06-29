import SEO from "../components/ui/SEO";
import AboutHero from "../components/About/AboutHero";
import AboutSection from "../components/About/AboutSection";

const About = () => {
  return (
    <>
      <SEO
        title="About Us | Amader Barir Pujo"
        description="Learn about our journey, vision, mission and the spirit of Amader Barir Pujo."
        keywords="About Amader Barir Pujo, Durga Puja Pune, Bengali Community Pune"
        ogImage="/assets/img/banner/1.webp"
      />

      <AboutHero />
      <AboutSection />
    </>
  );
};

export default About;