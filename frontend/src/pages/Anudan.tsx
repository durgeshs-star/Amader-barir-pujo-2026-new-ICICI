import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import SEO from '../components/ui/SEO';
import { AnudanCard } from '../components/ui/AnudanCard';
import { anudanCards } from '../assets/data/anudanData';
import { PageHero } from '../components/common/PageHero';

export const Anudan: React.FC = () => {
  return (
    <LazyMotion features={domAnimation} strict>
      <SEO
        title="Anudan"
        description="Offer Your Anudan (অনুদান) – Support the Spirit of Amader Barir Pujo. Browse our list of Pujo items and select an offering that resonates with you."
        keywords="Anudan, Durga Puja donation, Amader Barir Pujo contribution, Puja items sponsorship"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/anudan"
      />
      <PageHero
        title="Anudan"
        subtitle="Durga Pujo 2026 · Offer Your Contribution"
        backgroundImage="/assets/img/culture-2.webp"
        height="h-[45vh] md:h-[70vh]"
      />

      {/* Intro Section */}
      <section className="py-14 md:py-20 bg-light-bg/60">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8 animate-fade-in-down">
            <p className="text-lg md:text-xl text-secondary leading-relaxed md:leading-loose font-medium">
              🙏 Offer Your Anudan (অনুদান) – Support the Spirit of Amader Barir Pujo
            </p>
          </div>
          <m.div
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:scale-[1.02] transition-transform duration-300"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-base text-secondary leading-relaxed mb-6">
              Durga Pujo is a celebration of devotion, tradition, and togetherness. We warmly invite you to participate in our Pujo by making an Anudan (অনুদান) towards the various items and arrangements that make this sacred festival possible.
            </p>
            <div className="space-y-6">
              <p className="text-base text-secondary leading-relaxed">
                Whether you choose to contribute towards flowers, bhog, sarees, chandmala, decorations, or other Pujo essentials, your offering becomes a meaningful part of the rituals and celebrations.
              </p>
              <m.div
                className="pt-4 bg-linear-to-r from-primary/5 to-accent/5 rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h5 className="text-xl font-bold text-primary font-fraunces mb-3 flex items-center gap-2">
                  <m.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🪔
                  </m.span>
                  How You Can Participate
                </h5>
                <p className="text-base text-secondary leading-relaxed">
                  Browse our list of Pujo items and select an offering that resonates with you. Every contribution, regardless of its value, helps us preserve and celebrate our cherished traditions with devotion and joy.
                </p>
              </m.div>
            </div>
          </m.div>
        </div>
      </section>

      {/* Anudan Cards Section */}
      <section className="py-14 md:py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950 font-fraunces mb-3">
              Contribution Categories
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full animate-expand-width" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anudanCards && anudanCards?.map((card) => (
              <div key={card.day}>
                <AnudanCard card={card} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Anudan;


