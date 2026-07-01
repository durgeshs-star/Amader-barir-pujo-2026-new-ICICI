import React from "react";

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
    <header
      className={`flex flex-col ${alignment} ${className} animate-fade-in-up`}
    >
      {subtitle && (
        <p className="uppercase tracking-[0.4em] text-accent-text text-xs md:text-sm font-semibold">
          {subtitle}
        </p>
      )}
      <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 leading-tight">
        {title}
      </h2>
    </header>
  );
};

export default SectionHeading;
