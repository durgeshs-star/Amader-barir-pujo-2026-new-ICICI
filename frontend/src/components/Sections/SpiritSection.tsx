import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface Offering {
  title: string;
  description: string;
  imageSrc: string;
  fallbackIcon: React.ReactNode;
  link: string;
  linkText: string;
}

export const SpiritSection: React.FC = () => {
  const offerings: Offering[] = [
    {
      title: 'Cultural Offerings',
      description: "Maa Loves Every Song. We Hope You Do Too. We'd love for you to celebrate with us. Every song, every dance, and every performance is offered to Maa Durga with devotion, bringing our entire community together in joy.",
      imageSrc: '/assets/img/icons/woman.png',
      link: '/gallery?category=cultural',
      linkText: "See Last Year's Highlights",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      )
    },
    {
      title: 'Bhog',
      description: "Calories Don't Count When It's Maa's Bhog. Pull up a chair, meet someone new, catch up with someone familiar, and enjoy a meal that has brought our community together for generations",
      imageSrc: '/assets/img/icons/meal.png',
      link: '/gallery?category=bhog',
      linkText: 'Relive the Bhog Moments',
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="currentColor" aria-hidden="true">
          <path d="M2 19h20v2H2v-2zm12-14.8c0-.66-.54-1.2-1.2-1.2h-.6v-1h-1v1h-.6C10.54 3 10 3.54 10 4.2v2h4v-2zm-5.4 6.8c-.88 0-1.6.72-1.6 1.6V17h14v-4.4c0-.88-.72-1.6-1.6-1.6H8.6z" />
        </svg>
      )
    },
    {
      title: 'Sacred Pujo Rituals',
      description: `Fold Your Hands. Leave the Rest to Maa. Whether you're joining the Pushpanjali for the first time or returning to a tradition you've cherished for years, there's always a place for you before Maa.`,
      imageSrc: '/assets/img/icons/lotus-1.png',
      link: '/gallery?category=pujo',
      linkText: "Step Into Last Year's Pujo",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="currentColor" aria-hidden="true">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-17h2v6h-2V5zm0 8h2v4h-2v-4z" />
        </svg>
      )
    },
    {
      title: 'Community & Volunteer',
      description: "Come Help Us Create Someone Else's Favourite Pujo Memory. Years from now, someone will remember this Pujo as one of their happiest. The best part? You could be one of the reasons why.",
      imageSrc: '/assets/img/icons/volunteer.png',
      link: '/gallery?category=volunteer',
      linkText: 'See the Hearts Behind the Pujo',
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="currentColor" aria-hidden="true">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.48 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      )
    }
  ];

  return (
    <section id="experience-section" className="py-20 bg-white scroll-mt-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Title */}
        <div className="text-center mb-16 mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-wide font-fraunces leading-9 md:leading-[1.4]">
            Blessings Don't Ask for Membership. <br />
            Neither Do We.
          </h2>

          <p className="max-w-4xl mx-auto text-base md:text-lg leading-8 text-gray-700 text-center">
            Perhaps that's the true gift of Maa Durga. <em>Shokti</em> to lift each
            other. <em>Shanti</em> to embrace one another. And a quiet sense of
            Belonging that asks for nothing in return. It's this spirit that has
            touched generations, transcended borders, and earned Durga Puja
            recognition as a <strong>UNESCO</strong> Intangible Cultural Heritage of
            Humanity.
          </p>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 300px' }}>
          {offerings.map((offering, idx) => (
            <div
              key={idx}
              className="group flex flex-col md:flex-row gap-6 p-8 border border-gray-100 rounded-xl hover:border-accent/40 bg-light-bg/30 hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative"
            >
              {/* Icon Container */}
              <div className="shrink-0 flex items-center justify-center w-20 h-20 bg-primary/5 group-hover:bg-primary/10 rounded-full transition-all duration-300">
                {/* Try rendering actual png image first, otherwise show stylized svg vector */}
                <img
                  src={offering.imageSrc}
                  alt={`${offering.title} icon`}
                  width="50"
                  height="50"
                  loading="lazy"
                  decoding="async"
                  className="object-contain w-12 h-12 group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Replace img element with fallback svg wrapper if loading fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && parent.children.length === 1) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-12 h-12 flex items-center justify-center text-primary group-hover:scale-115 transition-transform duration-300';
                      // Inner HTML needs to render the SVG node
                      parent.appendChild(fallback);
                    }
                  }}
                />
                {/* Default inline reference element */}
                <span className="hidden">{offering.fallbackIcon}</span>
              </div>

              {/* Text details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-950 mb-3 group-hover:text-primary transition-colors font-fraunces">
                    {offering.title}
                  </h3>
                  <p className="text-sm md:text-base text-secondary leading-relaxed font-sans mb-4">
                    {offering.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <Link
                  to={offering.link}
                  className="flex items-center text-accent-text group-hover:text-primary transition-colors text-sm font-semibold gap-1 select-none"
                >
                  <span>{offering.linkText}</span>
                  <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SpiritSection;
