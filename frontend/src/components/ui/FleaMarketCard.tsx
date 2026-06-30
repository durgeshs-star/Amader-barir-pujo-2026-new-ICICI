import { motion } from "framer-motion";
import type { FleaMarketCardProps } from "../../types/schedule";

const FleaMarketCard = ({ image, alt, index = 0 }: FleaMarketCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div className="overflow-hidden">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          width={370}
          height={280}
          className="block w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </div>
    </motion.article>
  );
};

export default FleaMarketCard;
