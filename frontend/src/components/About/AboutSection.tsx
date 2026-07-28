const AboutSection = () => {
  return (
    <section className="bg-white overflow-hidden">
      {/* Full-width heading section */}
      <div className="w-full px-6 lg:px-10 py-10 lg:py-14 bg-white animate-fade-in-up text-center">
        <p className="uppercase text-secondary text-[14px] font-medium animate-fade-in text-center">
          Keeping Traditions Alive, Celebrating Together
        </p>
        <h2 className="font-fraunces text-3xl lg:text-5xl font-bold leading-tight mt-2 animate-fade-in-up">
          <span className="text-primary">
            A Celebration of
          </span>
          <span className="italic text-secondary font-medium pl-3">
            Faith, Culture & Togetherness
          </span>
        </h2>
      </div>

      {/* Horizontal image section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-6 lg:pb-10">
        <div className="w-full animate-fade-in-up">
          <img
            src="/assets/img/o.webp"
            alt="Durga Puja Celebration"
            className="w-full h-auto rounded-lg shadow-lg object-cover"
          />
        </div>

        {/* Description and items section */}
        <div className="mt-8 lg:mt-12">
          <p className="text-dark-bg text-base lg:text-lg leading-6 lg:leading-7 mb-8 animate-fade-in text-center">
           Amader Barir Pujo® is an initiative of <a href="https://proplusdatafoundation.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary no-underline hover:no-underline">
              ProPlus Data Foundation®
            </a>, created with a simple thought: Pujo should feel like barir pujo, even when you’re miles away from bari. There are no membership fees and no inner circles. Come for Maa, stay for the adda, have another helping of bhog, and somewhere between the dhaak and “aar ektu nebe?”, you’ll realize you were never a guest here.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;