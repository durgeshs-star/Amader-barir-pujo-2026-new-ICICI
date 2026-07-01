import { useEffect, useState, useRef } from "react";

interface ImageCarouselProps {
  image: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  height?: string;
}

const positions = [
  "left center",
  "center center",
  "right center",
];

const ImageCarousel = ({
  image,
  autoPlay = true,
  interval = 3000,
  className,
  height,
}: ImageCarouselProps) => {
  const [active, setActive] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy initialize when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only run auto-play when in view
  useEffect(() => {
    if (!autoPlay || !isInView) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % positions.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isInView]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl shadow-xl ${className ?? ""}`}
      style={{ height: height ?? "100%" }}
    >
      {/* Panel */}
      <div
        className="w-full h-full transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: positions[active],
        }}
      />

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
        {positions.map((_, index) => (
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