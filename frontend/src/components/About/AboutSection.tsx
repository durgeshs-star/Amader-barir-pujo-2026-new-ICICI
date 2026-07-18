import AboutCarousel from "./AboutCarousel";
import CarouselContentSection from "../common/CarouselContentSection";

const AboutSection = () => {
  return (
    <>
      {/* Full-width heading section */}
      <div className="w-full px-6 lg:px-10 py-10 lg:py-14 bg-white animate-fade-in-up text-center">
        <p className="uppercase text-secondary text-[11px] font-medium animate-fade-in text-center">
          Keeping Traditions Alive, Celebrating Together
        </p>
        <h2 className="font-fraunces text-3xl lg:text-5xl font-bold leading-tight mt-2 animate-fade-in-up">
          <span className="text-primary">
            A Celebration of
          </span>
          <span className="italic text-secondary font-medium pl-3">
            Faith, Culture & Togetherness
          </span>
        </h2>
      </div>

      {/* Content section with carousel and text */}
      <CarouselContentSection
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
    </>
  );
};

export default AboutSection;