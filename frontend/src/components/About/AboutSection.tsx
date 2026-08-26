const AboutSection = () => {
  return (
    <section className="overflow-hidden">
      {/* Constrained text */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 mt-8 lg:mt-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-primary font-fraunces text-center mb-6">
          Bengali Durga Puja in Pune
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
          Amader Barir Pujo 2026 brings the authentic Bengali Durga Puja experience to Pune, celebrating our rich traditions, cultural heritage, and community spirit. Located in Wakad and serving families from Hinjewadi and surrounding areas, we welcome everyone to join this free Bengali Durga Puja celebration. Experience the sacred rituals, devotional music, cultural programs, and the warmth of togetherness that makes Durga Puja special.
        </p>
      </div>

      {/* Full-width image */}
      <div className="mt-8 lg:mt-10 w-full animate-fade-in-up">
        <img
          src="/assets/img/o.png"
          alt="Amader Barir Pujo Bengali Durga Puja celebration in Pune"
          className="block w-full h-auto object-cover"
        />
      </div>
    </section>
  );
};

export default AboutSection;