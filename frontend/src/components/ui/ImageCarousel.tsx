import { useEffect, useState } from "react";

interface ImageCarouselProps {
  image: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  height?: string;
}

const ImageCarousel = ({
  image,
  autoPlay = true,
  interval = 3000,
  className,
  height,
}: ImageCarouselProps) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % 3);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-xl h-full ${className ?? ""}`}>

      {/* Viewport */}
      <div
        className="w-full h-full overflow-hidden"
        style={{ height: height ?? "100%" }}
      >

        {/* Panoramic Image */}
        <img
          src={image}
          alt="About"
          className="h-full w-full object-cover transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${active * 33.3333}%)`,
          }}
        />

      </div>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">

        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`h-3 w-3 rounded-full transition-colors ${
              active === index
                ? "bg-accent"
                : "bg-white/70"
            }`}
          />
        ))}

      </div>

    </div>
  );
};

export default ImageCarousel;