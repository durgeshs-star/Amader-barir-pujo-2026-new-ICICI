import React from "react";
import type { ScheduleBlock, ScheduleDetailsProps } from "../../types/schedule";

const ScheduleBlockContent: React.FC<{ block: ScheduleBlock }> = ({ block }) => (
  <div className="mt-10 first:mt-0">
    <p className="uppercase tracking-[0.35em] text-accent-text text-xs md:text-sm font-semibold">
      {block.subtitle}
    </p>
    {block.title && (
      <h4 className="font-fraunces text-2xl md:text-3xl font-bold text-primary mt-2 leading-tight">
        {block.title}
      </h4>
    )}
    {block.lines && block.lines.length > 0 && (
      <ul className="mt-4 space-y-2">
        {block.lines.map((line) => (
          <li
            key={line}
            className="flex items-start gap-3 text-secondary text-base md:text-lg leading-relaxed"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    )}
    {block.sections && block.sections.length > 0 && (
      <div className="mt-4 space-y-6">
        {block.sections.map((section) => (
          <div key={section.title}>
            <h4 className="font-fraunces text-xl md:text-2xl font-bold text-primary leading-tight">
              {section.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {section.lines.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-secondary text-base md:text-lg leading-relaxed"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({
  image,
  imageAlt,
  subtitle,
  title,
  timing,
  date,
  blocks,
}) => {
  const hasSimpleLayout = Boolean(subtitle && title && timing);

  return (
    <section className="py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative group animate-fade-in-up">
            <div className="absolute -inset-3 rounded-2xl bg-linear-to-br from-primary/20 via-accent/10 to-primary-light/20 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5">
              <img
                src={image}
                alt={imageAlt}
                loading="lazy"
                width={570}
                height={400}
                className="block w-full h-64 sm:h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="md:pl-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {hasSimpleLayout && (
              <>
                <p className="uppercase tracking-[0.4em] text-accent-text text-xs md:text-sm font-semibold">
                  {subtitle}
                </p>
                <h3 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 leading-tight">
                  {title}
                </h3>
                <div className="w-12 h-1 bg-accent mt-5 rounded-full" />
              </>
            )}

            {date && (
              <span
                className={`inline-block px-4 py-2 bg-light-bg border border-accent/25 rounded-full text-sm font-semibold text-primary ${
                  hasSimpleLayout ? "mt-6" : ""
                }`}
              >
                {date}
              </span>
            )}

            {/* {hasSimpleLayout && timing && (
              <div className="mt-8 flex items-start gap-4 p-5 rounded-xl bg-light-bg/80 border border-primary/10">
                <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary">
                  <Clock size={20} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Ceremony Timing
                  </p>
                  <p className="text-secondary text-base md:text-lg font-medium mt-1">
                    {timing}
                  </p>
                </div>
              </div>
            )} */}

            {blocks?.map((block) => (
              <ScheduleBlockContent key={block.subtitle} block={block} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleDetails;
