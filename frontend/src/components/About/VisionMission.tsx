const items = [
  {
    title: "Vision",
    description:
      "To preserve the cultural and spiritual legacy of Durga Pujo, fostering a vibrant and inclusive community for generations to come.",
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

      <p
        className="uppercase tracking-widest text-secondary text-[11px] font-medium animate-fade-in"
      >
        Keeping Traditions Alive, Celebrating Together
      </p>

      <h2
        className="font-fraunces text-3xl lg:text-4xl font-bold leading-tight mt-2 animate-fade-in-up"
      >
        <span className="text-primary">
          A Celebration of
        </span>

        <br />

        <span className="italic text-secondary font-medium">
          Faith, Culture & Togetherness
        </span>
      </h2>

      <p
        className="text-dark-bg text-sm leading-6 mt-4 mb-4 animate-fade-in"
      >
        Welcome to a place where the divine blessings of Maa Durga inspire
        devotion, strengthen community bonds, and keep our cherished
        traditions alive. Together, we celebrate the spirit of Durga Pujo
        with pride, joy, and a shared sense of belonging.
      </p>

      <div className="space-y-4">

        {items.map((item, index) => (
          <div
            key={item.title}
            className="border-l-4 border-primary pl-5 py-1.5 transition-all duration-300 hover:border-secondary hover:translate-x-2 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.2}s` }}
          >

            <h3 className="font-fraunces text-xl text-primary font-bold mb-2">
              {item.title}
            </h3>

            <p className="text-dark-bg text-sm leading-6">
              {item.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
};

export default VisionMission;