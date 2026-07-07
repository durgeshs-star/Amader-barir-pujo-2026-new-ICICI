import { useCallback, useEffect, useRef, useState } from "react";
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
  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(slidesPerView);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive slides per view
  useEffect(() => {
    const handleResize = () => {
      if (slidesPerView === 1) {
        setCurrentSlidesPerView(1);
      } else if (window.innerWidth < 640) {
        setCurrentSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setCurrentSlidesPerView(2);
      } else {
        setCurrentSlidesPerView(slidesPerView);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesPerView]);

  const pages = Math.ceil(images.length / currentSlidesPerView);

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
      className="relative h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel */}
      <div className="overflow-hidden rounded-3xl h-full">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {Array.from({ length: pages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className={`min-w-full grid gap-8 px-1 h-full ${
                currentSlidesPerView === 1
                  ? 'grid-cols-1'
                  : currentSlidesPerView === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {images
                .slice(
                  pageIndex * currentSlidesPerView,
                  pageIndex * currentSlidesPerView + currentSlidesPerView
                )
                .map((image, index) => (
                  <FleaMarketCard
                    key={image}
                    image={image}
                    alt={`${altPrefix} ${
                      pageIndex * currentSlidesPerView + index + 1
                    }`}
                    index={pageIndex * currentSlidesPerView + index}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

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