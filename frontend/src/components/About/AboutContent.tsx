import AboutCarousel from "./AboutCarousel";
import VisionMission from "./VisionMission";

const AboutContent = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-full"><AboutCarousel />
</div>
          <VisionMission />

        </div>
      </div>
    </section>
  );
};

export default AboutContent;