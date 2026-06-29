import { motion } from "framer-motion";

const AboutHero = () => {
  return (
    <section className="relative h-[40vh] md:h-[80vh] overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/img/culture-2.webp')",
        }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 h-full flex items-end justify-center pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-6"
        >
          <h1 className="font-fraunces text-5xl md:text-7xl text-white font-bold">
            About Us
          </h1>

          <p className="text-white/80 mt-4 max-w-xl mx-auto">
            Keeping traditions alive while celebrating faith,
            culture and togetherness.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;