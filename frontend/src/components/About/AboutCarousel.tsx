import ImageCarousel from "../ui/ImageCarousel";

const AboutCarousel = () => {
  return (
    <div className="relative h-full flex items-center justify-center">

      {/* Decorative Corners */}
      <span className="absolute -top-5 -left-5 z-10 text-4xl text-accent-text">
        ❦
      </span>

      <span className="absolute -top-5 -right-5 z-10 rotate-90 text-4xl text-accent-text">
        ❦
      </span>

      <span className="absolute -bottom-5 -left-5 z-10 -rotate-90 text-4xl text-accent-text">
        ❦
      </span>

      <span className="absolute -bottom-5 -right-5 z-10 rotate-180 text-4xl text-accent-text">
        ❦
      </span>

      <ImageCarousel
        image="/assets/img/full-slider.webp"
        height="450px"
      />
    </div>
  );
};

export default AboutCarousel;