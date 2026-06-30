import React from "react";
import { motion } from "framer-motion";

export interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  overlay?: string;
  height?: string;
}

const DEFAULT_OVERLAY =
  "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.05) 100%)";

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  overlay = DEFAULT_OVERLAY,
  height = "h-[40vh] md:h-[60vh]",
}) => {
  return (
    <section
      className={`relative w-full overflow-hidden ${height}`}
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ background: overlay }}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full flex items-end justify-center pb-12 md:pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl"
        >
          {subtitle && (
            <p className="uppercase tracking-[0.35em] text-accent text-xs md:text-sm font-semibold mb-4 drop-shadow-sm">
              {subtitle}
            </p>
          )}
          <h1 className="font-fraunces text-4xl md:text-6xl lg:text-7xl text-white font-bold drop-shadow-lg">
            {title}
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-5 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
