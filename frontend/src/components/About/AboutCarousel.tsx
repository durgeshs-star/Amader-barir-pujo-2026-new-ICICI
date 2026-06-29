import ImageCarousel from "../ui/ImageCarousel";

const AboutCarousel = () => {
  return (
    <div className="relative h-full">

      {/* Decorative Corners */}
      <span className="absolute -top-5 -left-5 z-10 text-4xl text-accent">
        ❦
      </span>

      <span className="absolute -top-5 -right-5 z-10 rotate-90 text-4xl text-accent">
        ❦
      </span>

      <span className="absolute -bottom-5 -left-5 z-10 -rotate-90 text-4xl text-accent">
        ❦
      </span>

      <span className="absolute -bottom-5 -right-5 z-10 rotate-180 text-4xl text-accent">
        ❦
      </span>

      <ImageCarousel
        images={[
          "/assets/img/full-slider.webp",
          "/assets/img/culture-1.webp",
          "/assets/img/culture-2.webp",
        ]}
      />
    </div>
  );
};

export default AboutCarousel;