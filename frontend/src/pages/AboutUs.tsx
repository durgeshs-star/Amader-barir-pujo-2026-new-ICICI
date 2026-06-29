import React from 'react';

export const AboutUs: React.FC = () => {
  return (
    <div className="pt-24 md:pt-32 pb-20 bg-light-bg/30 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Banner Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 font-fraunces mb-4">
            About Us
          </h1>
          <p className="text-sm uppercase tracking-widest text-accent font-semibold font-sans">
            Preserving Devotion &amp; Heritage in Wakad, Pune
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Content Details */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-md border border-gray-100 space-y-8 select-text">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-primary">
              Our Story
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-sans">
              "Amader Barir Pujo" (which translates to "Our Home Durga Puja") was founded by a passionate community of spiritual devotees in Wakad, Pune. Seeking to create a warm, inclusive, and traditional atmosphere reminiscent of celebrating Pujo back home, we set out to build an alternate home layout where everyone feels like family.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-primary">
              Our Vision
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-sans">
              We believe Durga Pujo is not just a festival, but a sacred bond of togetherness. Our mission is to keep pujo rituals, cultural activities, and devotional services completely free and accessible to all devotees, ensuring that the blessing of Maa Durga reaches every household.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 bg-light-bg/50 rounded-xl border border-gray-150">
              <h3 className="text-lg font-bold text-primary font-fraunces mb-2">Devoted Seva</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                From morning pushpanjali to sandhya aarti, every ritual is performed with strict compliance to traditions and deep devotion.
              </p>
            </div>
            <div className="p-6 bg-light-bg/50 rounded-xl border border-gray-150">
              <h3 className="text-lg font-bold text-primary font-fraunces mb-2">Community Kitchen</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Our daily Bhog distribution is served with love, making sure no guest leaves hungry.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
