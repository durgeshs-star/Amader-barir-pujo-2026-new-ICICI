import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface PujoDay {
  name: string;
  image: string;
  route: string;
  gradient: string;
}

export const PujoDaysSection: React.FC = () => {
  const pujoDays: PujoDay[] = [
    {
      name: 'Mahalaya',
      image: '/assets/img/donation/mahalaya.webp',
      route: '/panchami', // or individual sub-pages
      gradient: 'from-amber-700 via-primary to-dark-bg'
    },
    {
      name: 'Maha Shashti',
      image: '/assets/img/donation/sasthi.jpg',
      route: '/shashti',
      gradient: 'from-rose-800 via-primary-dark to-dark-bg'
    },
    {
      name: 'Maha Saptami',
      image: '/assets/img/donation/saptam.jpg',
      route: '/saptami',
      gradient: 'from-burgundy-900 via-primary to-orange-950'
    },
    {
      name: 'Maha Ashtami',
      image: '/assets/img/donation/ashtami.jpg',
      route: '/ashtami',
      gradient: 'from-orange-800 via-primary-light to-dark-bg'
    },
    {
      name: 'Maha Navami',
      image: '/assets/img/donation/navami.jpg',
      route: '/navami',
      gradient: 'from-red-800 via-primary-dark to-yellow-950'
    },
    {
      name: 'Maha Dashami',
      image: '/assets/img/donation/dashami.png',
      route: '/dashami',
      gradient: 'from-yellow-800 via-accent to-dark-bg'
    }
  ];

  return (
    <section className="py-20 bg-light-bg/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-wide font-fraunces">
            Pujo Days
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pujoDays.map((day, idx) => (
            <div
              key={idx}
              className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              {/* Image Thumbnail with Overlay Fallback */}
              <div className="relative aspect-video w-full overflow-hidden bg-primary/10">
                <ImageWithFallback 
                  src={day.image} 
                  alt={day.name} 
                  gradient={day.gradient}
                />
                
                {/* Visual Cover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 z-[2]" />
              </div>

              {/* Card Title Details */}
              <div className="p-6 flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors font-fraunces">
                  {day.name}
                </h3>
                
                <Link
                  to={day.route}
                  className="text-xs font-semibold tracking-wider text-accent-text group-hover:text-primary uppercase transition-colors"
                  aria-label={`View schedule details for ${day.name}`}
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// Sub-component to gracefully render placeholder if file doesn't load
interface FallbackProps {
  src: string;
  alt: string;
  gradient: string;
}
const ImageWithFallback: React.FC<FallbackProps> = ({ src, alt, gradient }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col justify-center items-center p-4 text-center select-none`}
      >
        <span className="text-accent-text text-3xl font-bold font-fraunces leading-none opacity-60">ABP</span>
        <span className="text-text-on-primary/70 text-[10px] uppercase font-semibold tracking-widest mt-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width="414"
      height="171"
      loading="lazy"
      onError={() => setHasError(true)}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
    />
  );
};

export default PujoDaysSection;
