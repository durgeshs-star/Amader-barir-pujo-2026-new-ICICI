import React from 'react';

interface Particle {
  left: string;
  dur: string;
  delay: string;
  size: number;
  bg: string;
  drift: string;
}

export const HeroParticles: React.FC = () => {
  const particles: Particle[] = [
    { left: '10%', dur: '9s', delay: '0s', size: 4, bg: 'rgba(201,150,58,.6)', drift: '30px' },
    { left: '25%', dur: '7s', delay: '1.5s', size: 3, bg: 'rgba(201,150,58,.6)', drift: '-20px' },
    { left: '40%', dur: '11s', delay: '0.5s', size: 4, bg: 'rgba(201,150,58,.6)', drift: '30px' },
    { left: '55%', dur: '8s', delay: '2s', size: 5, bg: 'rgba(219,66,66,.5)', drift: '-20px' },
    { left: '70%', dur: '10s', delay: '1s', size: 4, bg: 'rgba(201,150,58,.6)', drift: '30px' },
    { left: '85%', dur: '6s', delay: '3s', size: 3, bg: 'rgba(201,150,58,.6)', drift: '-20px' },
    { left: '92%', dur: '9s', delay: '0.8s', size: 4, bg: 'rgba(247,79,34,.4)', drift: '30px' },
    { left: '5%', dur: '12s', delay: '2.5s', size: 4, bg: 'rgba(201,150,58,.6)', drift: '-20px' },
  ];

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-[2]" 
      aria-hidden="true"
    >
      {particles.map((p, idx) => (
        <span
          key={idx}
          className="absolute bottom-[-10px] rounded-full animate-rise"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.bg,
            // Cast to standard style record for React/TS compilation
            ['--dur' as any]: p.dur,
            ['--delay' as any]: p.delay,
            ['--drift' as any]: p.drift,
          }}
        />
      ))}
    </div>
  );
};

export default HeroParticles;
