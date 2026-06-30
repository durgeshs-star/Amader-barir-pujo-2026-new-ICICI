import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FleaMarketCard from "./FleaMarketCard";
import type { FleaMarketCarouselProps } from "../../types/schedule";

const FleaMarketCarousel = ({
  images,
  autoPlay = true,
  interval = 4000,
  showDots = true,
  showArrows = true,
  slidesPerView = 3,
  altPrefix = "Flea Market",
}: FleaMarketCarouselProps) => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const pages = Math.ceil(images.length / slidesPerView);

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % pages);
  }, [pages]);

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + pages) % pages);
  }, [pages]);

  useEffect(() => {
    if (!autoPlay || isPaused || pages <= 1) return;

    const timer = setInterval(goNext, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, pages, goNext]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50) goNext();
    if (diff < -50) goPrev();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative mt-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel */}
      <div className="overflow-hidden rounded-3xl">
        <motion.div
          className="flex"
          animate={{
            x: `-${active * 100}%`,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {Array.from({ length: pages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-1"
            >
              {images
                .slice(
                  pageIndex * slidesPerView,
                  pageIndex * slidesPerView + slidesPerView
                )
                .map((image, index) => (
                  <FleaMarketCard
                    key={image}
                    image={image}
                    alt={`${altPrefix} ${
                      pageIndex * slidesPerView + index + 1
                    }`}
                    index={pageIndex * slidesPerView + index}
                  />
                ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Left Arrow */}
      {showArrows && pages > 1 && (
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-0 lg:-left-7 top-1/2 -translate-y-1/2 z-20
          h-14 w-14 rounded-full
          bg-white shadow-xl border border-gray-200
          flex items-center justify-center
          text-primary
          hover:bg-primary hover:text-white
          transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Right Arrow */}
      {showArrows && pages > 1 && (
        <button
          onClick={goNext}
          aria-label="Next"
          className="absolute right-0 lg:-right-7 top-1/2 -translate-y-1/2 z-20
          h-14 w-14 rounded-full
          bg-white shadow-xl border border-gray-200
          flex items-center justify-center
          text-primary
          hover:bg-primary hover:text-white
          transition-all duration-300 hover:scale-110"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Dots */}
      {showDots && pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          {Array.from({ length: pages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setActive(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-500 rounded-full ${
                active === index
                  ? "w-10 h-3 bg-accent"
                  : "w-3 h-3 bg-gray-300 hover:bg-primary"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FleaMarketCarousel;