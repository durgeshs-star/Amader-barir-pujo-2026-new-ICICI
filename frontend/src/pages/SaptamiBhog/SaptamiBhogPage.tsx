import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import PujaBookingCard from "../../components/ui/PujaBookingCard";
// import { ComingSoonPopup } from "../../components/ui/ComingSoonPopup";

const SaptamiBhogPage: React.FC = () => {

  return (
    <div className="relative">
      {/* <ComingSoonPopup /> */}
      <SEO
        title="Saptami Bhog Schedule"
        description="Saptami Bhog Schedule — Learn about our Saptami Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Saptami bhog, Durga Puja 2026 bhog booking, Amader Barir Pujo Saptami Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/bhog-booking/saptami"
      />

      <PageHero
        title="Saptami Bhog"
        subtitle=" "
        height="h-[35vh] md:h-[60vh]"
      />

      <section className="content-layer py-8">
        <div className="max-w-4xl mx-auto px-6">
            <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose text-center">
            Join us in celebrating Durga Pujo through the sacred tradition of Bhog.{' '}
            <strong>Saptami, Ashtami, Navami</strong> three days of soulful offerings, shared with love.
            </p>
        </div>
      </section>

      <section className="pb-4">
        <div className="max-w-5xl mx-auto px-6">
          <PujaBookingCard
            pujaKey="saptami"
            title="Saptami Bhog"
            subtitle="Bhog Booking"
            description="Select the number of bhog."
            paymentUrl="https://www.abp.proplusdatafoundation.com"
            disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
          />
        </div>
      </section>
    </div>
  );
};

export default SaptamiBhogPage;
