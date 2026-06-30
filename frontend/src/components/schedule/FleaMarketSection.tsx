import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "../common/SectionHeading";
import FleaMarketCarousel from "../ui/FleaMarketCarousel";
import { fleaMarketImages } from "../../assets/data/scheduleShared";

export const FleaMarketSection: React.FC = () => {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-light-bg/40 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionHeading
          title="Flea Market Bonanza"
          subtitle="Shop, Snack & Celebrate"
          align="left"
        />
        <div className="w-12 h-1 bg-accent mt-4 rounded-full" />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base md:text-lg text-gray-700 leading-relaxed mt-6 max-w-3xl"
        >
          Explore handcrafted art, decor, and treasures from local creators.
          Shop, snack, and soak in the spirit of Bangaliana with every step.
        </motion.p>

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
