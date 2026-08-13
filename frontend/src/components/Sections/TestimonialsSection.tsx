import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

interface Testimonial {
  name: string;
  quote: string;
}

const transition: Transition = {
  type: 'spring',
  duration: 0.8,
};

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const testimonials: Testimonial[] = [
    {
      name: 'Rahul Kale',
      quote:
        'This was my first Durga Pujo ever. The energy was infectious, the bhog was unforgettable, and everyone made us feel so welcome. Ekdum family jaisa feel aaya. Definitely coming back next year!',
    },
    {
      name: 'Sneha Gupta',
      quote:
        'A truly divine experience! The atmosphere during Durga Pujo was magical, and the rituals were performed beautifully.',
    },
    {
      name: 'Ananya Dutta',
      quote: `I honestly didn't expect to feel so emotional. The moment the dhaak started, it reminded me of home. We came for a few hours and ended up spending almost the whole day. For those few moments, Pune felt a little more like Kolkata. Khub bhalo legechilo.`,
    },
    {
      name: 'Arindam Chaudhuri',
      quote:
        'Some memories stay with us long after the celebrations end. Amader Bari Durga Pujo 2025 was one such experience. Dhaak, dhunuchi naach, prayers, warm khichuri, laughter, and genuine connections made it feel like family. Heartfelt thanks to the organizers for creating such a beautiful, unforgettable experience. Asche bochor abar hobe!',
    },
  ];

  const goTo = (index: number) => {
    const total = testimonials.length;
    setActiveIndex(((index % total) + total) % total);
  };

  const handlePrev = () => goTo(activeIndex - 1);
  const handleNext = () => goTo(activeIndex + 1);

  // Swipe Support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();

    touchStartX.current = null;
  };

  // Lazy load autoplay
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

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const timer = setInterval(handleNext, 5000);

    return () => clearInterval(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, isInView]);

  const active = testimonials[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="content-layer py-8 md:py-8"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 500px',
      }}
    >
      {/* Section Heading */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center font-fraunces text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
          The Smiles We Carried Home
        </h2>

        <div className="flex flex-col items-center gap-10">
          <figure
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="
              w-full
              max-w-md
              sm:max-w-xl
              md:max-w-3xl
              lg:max-w-5xl
              xl:max-w-6xl
              rounded-3xl
              border
              border-primary/20
              bg-white/70
              backdrop-blur-sm
              px-6
              py-8
              sm:px-8
              sm:py-10
              lg:px-12
              lg:py-12
              shadow-md
              text-center
              select-text
            "
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.blockquote
                key={`${activeIndex}-quote`}
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    ...transition,
                    delay: 0.15,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  y: -20,
                  transition: {
                    ...transition,
                    delay: 0,
                  },
                }}
                className="
  origin-bottom
  italic
  font-sans
  font-normal
  text-secondary
  text-[5px]
  sm:text-base
  md:text-md
  lg:text-lg
  xl:text-[22px]
  leading-[1.45]
  tracking-normal
  text-balance
  will-change-transform
"
              >
                "{active.quote}"
              </motion.blockquote>

              <motion.figcaption
                key={`${activeIndex}-author`}
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    ...transition,
                    delay: 0.25,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  y: -20,
                  transition,
                }}
                className="mt-8 origin-bottom will-change-transform"
              >
                <cite
                  className="
                    not-italic
                    text-sm
                    font-bold
                    tracking-[0.18em]
                    uppercase
                    text-primary
                    font-fraunces
                  "
                >
                 {active.name}
                </cite>
              </motion.figcaption>
            </AnimatePresence>
          </figure>

          {/* Pagination */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                  activeIndex === idx
                    ? 'w-8 bg-primary'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;