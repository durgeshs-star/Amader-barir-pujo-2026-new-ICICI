import React from 'react';
import type { AnudanCard as AnudanCardType } from '../../types/anudan.types';

interface AnudanCardProps {
  card: AnudanCardType;
}

export const AnudanCard: React.FC<AnudanCardProps> = ({ card }) => {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[150px] shadow-md">
      <div>
        <h5 className="text-xl font-bold text-gray-900 font-fraunces mb-4">{card.day}</h5>
        <ul className="space-y-3 text-sm text-gray-800">
          {card.items.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-gray-600 mr-2 mt-0.5">•</span>
              <span className="leading-relaxed">{item.name} - <span className="font-bold text-gray-900">{item.cost}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
