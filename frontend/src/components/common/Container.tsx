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
    <Tag className={`max-w-7xl mx-auto px-6 md:px-10 ${className}`}>
      {children}
    </Tag>
  );
}