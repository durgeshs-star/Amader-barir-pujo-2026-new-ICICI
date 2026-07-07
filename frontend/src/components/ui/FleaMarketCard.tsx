import type { FleaMarketCardProps } from "../../types/schedule";

const FleaMarketCard = ({ image, alt, index = 0 }: FleaMarketCardProps) => {
  return (
    <article
      className="overflow-hidden h-full"
      style={{ animationDelay: `${(index % 3) * 0.1}s` }}
    >
      <div className="overflow-hidden h-full">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          width={370}
          height={280}
          className="w-full h-full object-cover object-[center_25%]"
        />
      </div>
    </article>
  );
};

export default FleaMarketCard;
