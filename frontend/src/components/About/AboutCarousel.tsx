import ImageCarousel from "../ui/ImageCarousel";

const AboutCarousel = () => {
  return (
    <div className="relative min-h-[450px] flex items-center justify-center">
      <ImageCarousel
        image="/assets/img/full-slider.webp"
        height="450px"
        className="w-full"
      />
    </div>
  );
};

export default AboutCarousel;