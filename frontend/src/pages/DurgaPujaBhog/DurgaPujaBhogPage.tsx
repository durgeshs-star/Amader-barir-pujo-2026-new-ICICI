import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import BhogBookingSection from "../../components/ui/BhogBookingSection";
import FloatingBhogCTA from "../../components/common/FloatingBhogCTA";
// import { ComingSoonPopup } from "../../components/ui/ComingSoonPopup";
import { UNIFIED_BHOG_DAYS } from "../../config/pujaConfig";

const DurgaPujaBhogPage: React.FC = () => {
  return (
    <div className="relative">
      {/* <ComingSoonPopup /> */}
      <SEO
        title="Durga Puja Bhog Schedule | Durga Puja PCMC Pune | Amader Barir Pujo"
        description="Durga Puja Bhog Schedule — Learn about our Durga Puja Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Durga Puja bhog, Durga Puja bhog booking, Amader Barir Pujo Durga Puja Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/durga-puja-bhog"
      />

      <PageHero
        title="Durga Puja Bhog"
        subtitle=" "
        height="h-[35vh] md:h-[60vh]"
      >
        <FloatingBhogCTA />
      </PageHero>

      <section className="content-layer py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-6">


          <div className="text-center">
            <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose">
            Join us in celebrating Durga Pujo through the sacred tradition of Bhog.{' '}
            <strong>Saptami, Ashtami, Navami</strong> three days of soulful offerings, shared with love.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-4">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          {UNIFIED_BHOG_DAYS.map((day) => (
            <BhogBookingSection
              key={day.key}
              title={day.title}
              subtitle={day.subtitle}
              description={day.description}
              categories={day.categories}
              paymentUrl="https://www.abp.proplusdatafoundation.com"
              disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
              menu={day.menu}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DurgaPujaBhogPage;
