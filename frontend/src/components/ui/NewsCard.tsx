import React, { useState } from 'react';
import { FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';

export interface NewsCardProps {
  title: string;
  source: string;
  date: string;
  url: string;
  image?: string;
  index?: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  source,
  date,
  url,
  image,
  index = 0
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Preview Image */}
      {image && !hasImageError && (
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setHasImageError(true)}
          />
        </div>
      )}

      <div className="p-6">
        {/* Source and Date */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            {source}
          </span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <FaCalendarAlt size={10} />
            {date}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-fraunces text-lg md:text-xl font-bold text-primary leading-tight mb-4 group-hover:text-accent-dark transition-colors line-clamp-2">
          {title}
        </h3>

        {/* External Link Indicator */}
        <div className="flex items-center gap-2 text-sm font-semibold text-accent-text group-hover:text-accent transition-colors">
          <span>Read More</span>
          <FaExternalLinkAlt size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
