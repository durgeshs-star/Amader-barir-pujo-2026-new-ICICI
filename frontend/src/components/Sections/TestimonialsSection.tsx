import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Testimonial {
  name: string;
  quote: string;
  image: string;
}

export const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const testimonials: Testimonial[] = [
    {
      name: 'Rajesh Singh',
      quote: 'The daily aartis were breathtaking! The devotion and energy were palpable, making me feel so connected to Maa Durga.',
      image: '/assets/img/testimonials/boy.png',
    },
    {
      name: 'Sneha Gupta',
      quote: "A truly divine experience! The atmosphere during Durga Pujo was magical, and the rituals were performed beautifully. Can't wait for next year!",
      image: '/assets/img/testimonials/girl.png',
    },
    {
      name: 'Mukesh Singh',
      quote: 'The sense of community here is unmatched. Celebrating with family and friends made it all the more special. Thank you for a wonderful celebration!',
      image: '/assets/img/testimonials/boy.png',
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  // Auto-play slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Lazy initialize auto-play when section is in view
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only run auto-play when in view
  useEffect(() => {
    if (!isInView) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="content-layer pb-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-wide font-fraunces">
            The Smiles We Carried Home
          </h2>
        </div>

        {/* Testimonials Slider Window */}
        <div
className="relative overflow-hidden bg-light-bg border border-[rgb(180,160,130)] rounded-2xl p-6 md:p-12 shadow-inner"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
        >
          {/* Flex Carousel Track */}
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
                className="w-full shrink-0 flex flex-col md:flex-row items-center gap-8 select-text"
              >
                {/* Author Thumbnail with fallback block */}
                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-primary/10 border-2 border-accent">
                  <img
                    src={item.image}
                    alt={item.name}
                    width="128"
                    height="128"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && parent.children.length === 1) {
                        const avatar = document.createElement('div');
                        avatar.className = 'w-full h-full flex items-center justify-center bg-primary text-text-on-primary text-3xl font-bold font-fraunces';
                        avatar.innerText = item.name.charAt(0);
                        parent.appendChild(avatar);
                      }
                    }}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Testimonial Quote details */}
                <div className="flex-1 text-center md:text-left flex flex-col justify-center">

                  {/* Body Quote */}
                  <blockquote className="text-base md:text-lg text-secondary italic font-sans leading-relaxed mb-4">
                    "{item.quote}"
                  </blockquote>

                  {/* Author Name */}
                  <cite className="not-italic text-sm font-bold tracking-wider text-primary uppercase font-fraunces">
                    — {item.name}
                  </cite>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Carousel Control Arrows */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-11 h-11 hover:bg-primary-dark text-primary hover:text-text-on-primary border border-border rounded-full cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            aria-label="Previous testimonial slide"
          >
            <FaChevronLeft size={12} />
          </button>
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-11 h-11 hover:bg-primary-dark text-primary hover:text-text-on-primary border border-border rounded-full cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            aria-label="Next testimonial slide"
          >
            <FaChevronRight size={12} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
