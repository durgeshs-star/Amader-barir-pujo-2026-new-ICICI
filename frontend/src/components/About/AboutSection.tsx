const AboutSection = () => {
  return (
    <section className="overflow-hidden">
      {/* Constrained text */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 mt-8 lg:mt-12">
        <p className="text-dark-bg text-base lg:text-xl leading-7 font-fraunces lg:leading-8 text-center animate-fade-in">
          Amader Barir Pujo<sup className="align-middle">®</sup> is an initiative of{" "}
          <a
            href="https://proplusdatafoundation.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-secondary no-underline"
          >
            ProPlus Data Foundation<sup className="align-middle">®</sup>
          </a>
          , created with a simple thought: Pujo should feel like barir pujo,
          even when you’re miles away from bari. There are no membership fees
          and no inner circles. Come for Maa, stay for the adda, have another
          helping of bhog, and somewhere between the dhaak and “aar ektu
          nebe?”, you’ll realize you were never a guest here.
        </p>
      </div>

      {/* Full-width image */}
      <div className="mt-8 lg:mt-10 w-full animate-fade-in-up">
        <img
          src="/assets/img/o.png"
          alt="Durga Puja Celebration"
          className="block w-full h-auto object-cover"
        />
      </div>
    </section>
  );
};

export default AboutSection;