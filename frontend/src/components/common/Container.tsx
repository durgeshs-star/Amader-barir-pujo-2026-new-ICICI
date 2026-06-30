import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  as: Tag = "div",
}) => {
  return (
    <Tag className={`max-w-7xl mx-auto px-6 md:px-10 ${className}`}>
      {children}
    </Tag>
  );
};

export default Container;
