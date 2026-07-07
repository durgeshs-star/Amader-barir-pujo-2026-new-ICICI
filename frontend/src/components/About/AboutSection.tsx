import AboutCarousel from "./AboutCarousel";
import CarouselContentSection from "../common/CarouselContentSection";

const AboutSection = () => {
  return (
    <CarouselContentSection
      label="Keeping Traditions Alive, Celebrating Together"
      headingPrimary="A Celebration of"
      headingSecondary="Faith, Culture & Togetherness"
      description="Welcome to a place where the divine blessings of Maa Durga inspire devotion, strengthen community bonds, and keep our cherished traditions alive. Together, we celebrate the spirit of Durga Pujo with pride, joy, and a shared sense of belonging."
      items={[
        {
          title: "Vision",
          description: "To preserve the cultural and spiritual legacy of Durga Puja, fostering a vibrant and inclusive community for generations to come.",
        },
        {
          title: "Mission",
          description: "To honor Maa Durga through meaningful celebrations, uphold timeless traditions, and create a welcoming environment where everyone can experience the joy of faith, culture, and unity.",
        },
      ]}
      carousel={<AboutCarousel />}
    />
  );
};

export default AboutSection;