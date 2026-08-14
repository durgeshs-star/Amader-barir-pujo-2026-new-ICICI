import React from "react";
import SectionHeading from "../common/SectionHeading";
import FleaMarketCarousel from "../ui/FleaMarketCarousel";
import { fleaMarketImages } from "../../assets/data/scheduleShared";

export const FleaMarketSection: React.FC = () => {
  return (
    <section className="py-14 md:py-10 bg-linear-to-b">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-20 xl:px-10 pt-8 pb-4 lg:py-8 xl:py-0">
        <SectionHeading
          title="Flea Market Bonanza"
          subtitle="Shop, Snack & Celebrate"
          align="left"
        />
        <div className="w-12 h-1 bg-accent mt-4 rounded-full" />

        <p
          className="text-base md:text-lg text-secondary leading-relaxed mt-6 mb-6 max-w-3xl animate-fade-in-up"
        >
          Explore handcrafted art, decor, and treasures from local creators.
          Shop, snack, and soak in the spirit of Bangaliana with every step.
        </p>

        <FleaMarketCarousel
          images={fleaMarketImages}
          autoPlay
          interval={4500}
        />
      </div>
    </section>
  );
};

export default FleaMarketSection;
