import React from 'react';

export const HeroWatermark: React.FC = () => {
  return (
    <div
      className="absolute top-1/2 right-[3%] -translate-y-1/2 text-[clamp(12rem,26vw,36rem)] text-accent/5 font-serif leading-none pointer-events-none select-none z-[1] select-none"
      aria-hidden="true"
    >
      ॐ
    </div>
  );
};

export default HeroWatermark;
