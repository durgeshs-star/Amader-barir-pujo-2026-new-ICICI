import React from "react";
import { motion } from "framer-motion";
import type { ScheduleIntroProps } from "../../types/schedule";

export const ScheduleIntro: React.FC<ScheduleIntroProps> = ({ paragraph }) => {
  return (
    <section className="py-14 md:py-20 bg-light-bg/60">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-fraunces text-5xl md:text-6xl text-primary/20 leading-none select-none">
            &ldquo;
          </span>
          <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose -mt-4 md:-mt-6">
            {paragraph}
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="h-px w-12 bg-accent/60" />
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="h-px w-12 bg-accent/60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScheduleIntro;
