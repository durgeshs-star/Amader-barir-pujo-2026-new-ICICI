import React from "react";
import { motion } from "framer-motion";
import Hero from "../common/Hero";
import type { ScheduleHeroProps } from "../../types/schedule";

export const ScheduleHero: React.FC<ScheduleHeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  overlay,
  height,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Hero
        title={title}
        subtitle={subtitle}
        backgroundImage={backgroundImage}
        overlay={overlay}
        height={height}
      />
    </motion.div>
  );
};

export default ScheduleHero;
