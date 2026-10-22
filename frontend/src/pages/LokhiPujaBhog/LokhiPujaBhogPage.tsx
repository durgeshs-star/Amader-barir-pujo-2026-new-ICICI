import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import BhogBookingSection from "../../components/ui/BhogBookingSection";
import FloatingBhogCTA from "../../components/common/FloatingBhogCTA";
import { LOKHI_PUJA_BHOG_BOOKING_CATEGORIES } from "../../config/pujaConfig";

const LokhiPujaBhogPage: React.FC = () => {

  return (
    <div className="relative">
      <SEO
        title="Lokhi Puja Bhog Schedule | Durga Puja PCMC Pune"
        description="Lokhi Puja Bhog Schedule — Learn about our Lokhi Puja Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Lokhi Puja bhog, Lokhi Puja bhog booking, Amader Barir Pujo Lokhi Puja Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/lokhi-puja-bhog"
      />

      <PageHero
        title="Lokhi Pujo Bhog"
        height="h-[35vh] md:h-[60vh]"
      >
        <FloatingBhogCTA />
      </PageHero>

      <section className="content-layer py-8">
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center">
            <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose text-center">
            Join us in celebrating Lokhi Pujo through the sacred tradition of Bhog.{' '}
            <strong>Book your Bhog</strong> and partake in the sacred prasadam.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-4">
        <div className="max-w-5xl mx-auto px-6">
          <BhogBookingSection
            title="Lokhi Pujo Bhog"
            subtitle="Bhog Booking"
            description="Select the number of bhog."
            categories={LOKHI_PUJA_BHOG_BOOKING_CATEGORIES}
            paymentUrl="https://www.abp.proplusdatafoundation.com"
            disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
            menu="Khichuri | Labra | Chutney | Papad | Rasogolla"
          />
        </div>
      </section>
    </div>
  );
};

export default LokhiPujaBhogPage;
