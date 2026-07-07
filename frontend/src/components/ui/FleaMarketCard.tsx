import type { FleaMarketCardProps } from "../../types/schedule";

const FleaMarketCard = ({ image, alt, index = 0 }: FleaMarketCardProps) => {
  return (
    <article
      className="overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in-up h-full"
      style={{ animationDelay: `${(index % 3) * 0.1}s` }}
    >
      <div className="overflow-hidden h-full">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          width={370}
          height={280}
          className="block w-full h-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </div>
    </article>
  );
};

export default FleaMarketCard;
