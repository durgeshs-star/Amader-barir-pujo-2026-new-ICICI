import { motion } from "framer-motion";

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlay?: string;
  height?: string;
}

const DEFAULT_BACKGROUND = "/assets/img/culture-2.webp";
const DEFAULT_OVERLAY = "bg-black/60";
const DEFAULT_HEIGHT = "h-[40vh] md:h-[80vh]";

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  backgroundImage = DEFAULT_BACKGROUND,
  overlay = DEFAULT_OVERLAY,
  height = DEFAULT_HEIGHT,
}) => {
  return (
    <section className={`relative ${height} overflow-hidden`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      />

      <div className={`absolute inset-0 ${overlay}`} />

      <div className="relative z-10 h-full flex items-end justify-center pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-6"
        >
          <h1 className="font-fraunces text-5xl md:text-7xl text-white font-bold">
            {title}
          </h1>

          {subtitle && (
            <p className="text-text-on-primary mt-4 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
