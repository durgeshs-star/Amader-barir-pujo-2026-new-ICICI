import React from 'react';
import Hero from '../components/Hero/Hero';
import SpiritSection from '../components/Sections/SpiritSection';
import PujoDaysSection from '../components/Sections/PujoDaysSection';
import TestimonialsSection from '../components/Sections/TestimonialsSection';

export const Home: React.FC = () => {
  return (
    <div className="relative animate-fade-in">
      <Hero />
      <SpiritSection />
      <PujoDaysSection />
      <TestimonialsSection />
    </div>
  );
};

export default Home;
