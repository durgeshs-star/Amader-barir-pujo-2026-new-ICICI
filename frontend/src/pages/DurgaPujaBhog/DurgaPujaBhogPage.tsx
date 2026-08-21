import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import BhogBookingSection from "../../components/ui/BhogBookingSection";
import { ComingSoonPopup } from "../../components/ui/ComingSoonPopup";
import { BHOG_BOOKING_CATEGORIES } from "../../config/pujaConfig";
import type { BhogBookingCategory } from "../../types/bhog";

const DurgaPujaBhogPage: React.FC = () => {
  const categories: BhogBookingCategory[] = BHOG_BOOKING_CATEGORIES;

  return (
    <div className="relative">
      <ComingSoonPopup />
      <SEO
        title="Durga Puja Bhog Schedule"
        description="Durga Puja Bhog Schedule — Learn about our Durga Puja Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Durga Puja bhog, Durga Puja 2026 bhog booking, Amader Barir Pujo Durga Puja Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/durga-puja-bhog"
      />

      <PageHero
        title="Durga Puja Bhog"
        subtitle=" "
        height="h-[35vh] md:h-[60vh]"
      />

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
        <div className="max-w-5xl mx-auto px-6">
          <BhogBookingSection
            title="Durga Puja Bhog"
            subtitle="Bhog Booking"
            description="Select the number of bhog."
            categories={categories}
            paymentUrl="https://www.abp.proplusdatafoundation.com"
            disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
          />
        </div>
      </section>
    </div>
  );
};

export default DurgaPujaBhogPage;
