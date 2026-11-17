const aboutImages = [
  "SJP_6903.webp",
  "SJP_4142.webp",
  "SJP_5345.webp",
  "SJP_3676.webp",
  "SJP_4509.webp",
  "SJP_0381.webp",
  "SJP_4013.webp",
  "SJP_3943.webp",
  "SJP_3870.webp",
  "SJP_5343.webp",
  "SJP_6835.webp",
  "SJP_3957.webp",
  "SJP_4041.webp",
  "SJP_5344.webp",
  "SJP_4388.webp",
  "SJP_3961.webp",
  "SJP_0132.webp",
];

const AboutSection = () => {
  return (
    <section className="overflow-hidden">
      {/* Constrained text */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 mt-8 lg:mt-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-primary font-fraunces text-center mb-6">
          Durga Puja in Pune
        </h2>
        <p className="text-dark-bg text-base lg:text-xl leading-7 font-fraunces lg:leading-8 text-center animate-fade-in mb-6">
          Amader Bari'r Pujo<sup className="align-middle">®</sup> is an initiative of{" "}
          <a
            href="https://proplusdatafoundation.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-secondary no-underline"
          >
            ProPlus Data Foundation<sup className="align-middle">®</sup>
          </a>
          , created with a simple thought: Pujo should feel like bari'r pujo,
          even when you're miles away from bari. There are no membership fees
          and no inner circles. Come for Maa, stay for the adda, have another
          helping of bhog, and somewhere between the dhaak and "aar ektu
          nebe?", you'll realize you were never a guest here.
        </p>
        <p className="text-dark-bg text-base lg:text-lg leading-7 font-sans lg:leading-8 text-center animate-fade-in">
          Amader Barir Pujo brings the authentic Durga Puja experience to Pune, celebrating our rich traditions, cultural heritage, and community spirit. Located in Wakad and serving families from Hinjewadi and surrounding areas, we welcome everyone to join this free Durga Puja celebration. Experience the sacred rituals, devotional music, cultural programs, and the warmth of togetherness that makes Durga Puja special.
        </p>
      </div>

      {/* Community photo gallery */}
      <div className="mt-8 lg:mt-10 space-y-3 animate-fade-in-up">
        {[aboutImages.slice(0, 8), aboutImages.slice(8)].map((strip, stripIndex) => (
          <div
            key={stripIndex}
            className="overflow-x-auto px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className={`about-marquee-track flex w-max ${stripIndex === 0 ? "about-marquee-left" : "about-marquee-right"}`}>
              {[0, 1].map((copyIndex) => (
                <div key={copyIndex} className="flex shrink-0 gap-3 pr-3">
                  {strip.map((image, index) => (
                    <figure
                      key={`${copyIndex}-${image}`}
                      className="h-44 w-auto shrink-0 overflow-hidden rounded-sm sm:h-52 lg:h-56"
                    >
                      <img
                        src={`/assets/img26/${image === "SJP_0132.webp" ? "img26" : "aboutus"}/${image}`}
                        alt={copyIndex === 0 ? `Amader Barir Pujo celebration, photo ${stripIndex * 8 + index + 1}` : ""}
                        aria-hidden={copyIndex === 1}
                        className="block h-full w-auto max-w-none object-contain transition-transform duration-500 hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;
