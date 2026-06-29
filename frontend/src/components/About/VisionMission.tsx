import { motion } from "framer-motion";

const items = [
  {
    title: "Vision",
    description:
      "To preserve the cultural and spiritual legacy of Durga Puja, fostering a vibrant and inclusive community for generations to come.",
  },
  {
    title: "Mission",
    description:
      "To honor Maa Durga through meaningful celebrations, uphold timeless traditions, and create a welcoming environment where everyone can experience the joy of faith, culture, and unity.",
  },
];

const VisionMission = () => {
  return (
    <section className="h-full flex flex-col justify-center">

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="uppercase tracking-[0.45em] text-accent text-sm font-semibold"
      >
        Keeping Traditions Alive, Celebrating Together
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-fraunces text-5xl lg:text-6xl font-bold leading-tight mt-5"
      >
        <span className="text-primary">
          A Celebration of
        </span>

        <br />

        <span className="italic text-accent font-medium">
          Faith, Culture & Togetherness
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-gray-600 text-lg leading-9 mt-10 mb-14"
      >
        Welcome to a place where the divine blessings of Maa Durga inspire
        devotion, strengthen community bonds, and keep our cherished
        traditions alive. Together, we celebrate the spirit of Durga Pujo
        with pride, joy, and a shared sense of belonging.
      </motion.p>

      <div className="space-y-8">

        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.2,
              duration: 0.5,
            }}
            whileHover={{
              x: 8,
            }}
            className="border-l-4 border-accent pl-8 py-2 transition-all duration-300"
          >

            <h3 className="font-fraunces text-3xl text-primary font-bold mb-4">
              {item.title}
            </h3>

            <p className="text-gray-600 leading-8">
              {item.description}
            </p>

          </motion.div>
        ))}

      </div>

    </section>
  );
};

export default VisionMission;