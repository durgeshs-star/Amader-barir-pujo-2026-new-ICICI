import { type ElementType, type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export default function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={`max-w-7xl mx-auto px-5 sm:px-6 lg:px-20 xl:px-10 pt-8 pb-4 lg:py-8 xl:py-0 ${className}`}>
      {children}
    </Tag>
  );
}