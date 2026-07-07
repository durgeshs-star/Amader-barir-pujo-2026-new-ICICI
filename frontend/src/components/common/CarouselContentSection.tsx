import React from 'react';

export interface CarouselContentItem {
  title: string;
  description: string;
}

export interface CarouselContentSectionProps {
  label: string;
  headingPrimary: string;
  headingSecondary?: string;
  description: string;
  items: CarouselContentItem[];
  carousel: React.ReactNode;
  showDecorativeCorners?: boolean;
}

const CarouselContentSection: React.FC<CarouselContentSectionProps> = ({
  label,
  headingPrimary,
  headingSecondary,
  description,
  items,
  carousel,
  showDecorativeCorners = true,
}) => {
  return (
    <section className="bg-white py-10 lg:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-stretch">
          <div className="relative min-h-112.5 flex items-center justify-center animate-fade-in-up">
            {showDecorativeCorners && (
              <>
                <span className="absolute -top-5 -left-5 z-10 text-4xl  text-primary">
                  ❦
                </span>
                <span className="absolute -top-5 -right-5 z-10 rotate-90 text-4xl text-primary">
                  ❦
                </span>
                <span className="absolute -bottom-5 -left-5 z-10 -rotate-90 text-4xl  text-primary">
                  ❦
                </span>
                <span className="absolute -bottom-5 -right-5 z-10 rotate-180 text-4xl  text-primary">
                  ❦
                </span>
              </>
            )}

            {carousel}
          </div>

          <div className="h-full flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <p className="uppercase tracking-widest text-secondary text-[11px] font-medium animate-fade-in">
              {label}
            </p>
            <h2 className="font-fraunces text-3xl lg:text-4xl font-bold leading-tight mt-2 animate-fade-in-up">
              <span className="text-primary">
                {headingPrimary}
              </span>
              {headingSecondary && (
                <>
                  <br />
                  <span className="italic text-secondary font-medium">
                    {headingSecondary}
                  </span>
                </>
              )}
            </h2>
            <p className="text-dark-bg text-sm leading-6 mt-4 mb-4 animate-fade-in">
              {description}
            </p>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.title}
                  className="border-l-4 border-primary pl-5 py-1.5 transition-all duration-300 hover:border-secondary hover:translate-x-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <h3 className="font-fraunces text-xl text-primary font-bold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-dark-bg text-sm leading-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarouselContentSection;
