import React from "react";
import { motion } from "framer-motion";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = "left",
  className = "",
}) => {
  const alignment =
    align === "center"
      ? "text-center items-center"
      : align === "right"
        ? "text-right items-end"
        : "text-left items-start";

  return (
    <motion.header
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col ${alignment} ${className}`}
    >
      {subtitle && (
        <p className="uppercase tracking-[0.4em] text-accent text-xs md:text-sm font-semibold">
          {subtitle}
        </p>
      )}
      <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 leading-tight">
        {title}
      </h2>
    </motion.header>
  );
};

export default SectionHeading;
