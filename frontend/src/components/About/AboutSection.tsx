import AboutCarousel from "./AboutCarousel";
import VisionMission from "./VisionMission";

const AboutSection = () => {
  return (
    <section className="bg-white py-10 lg:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-stretch">

          <AboutCarousel />

          <VisionMission />

        </div>

      </div>
    </section>
  );
};

export default AboutSection;