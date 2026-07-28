import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import PujaBookingCard from "../../components/ui/PujaBookingCard";

const AshtamiBhogSandhiPujaPage: React.FC = () => {

  return (
    <>
      <SEO
        title="Ashtami Sandhi Puja Bhog Booking"
        description="Ashtami Sandhi Puja Bhog Booking — Experience the sacred transition through our specially prepared Sandhi Puja Prasad at Amader Barir Pujo."
        keywords="Ashtami Sandhi Puja bhog, Sandhi Puja bhog booking, Durga Puja 2026 bhog, Amader Barir Pujo Ashtami Sandhi Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/bhog-booking/ashtami-sandhi-puja"
      />

      <PageHero
        title="Ashtami Sandhi Puja Bhog"
        subtitle="Durga Pujo 2026 · Sacred Transition Bhog"
        height="h-[45vh] md:h-[70vh]"
      />

      <section className="py-14 md:py-20 bg-light-bg/60">
        <div className="max-w-4xl mx-auto px-6">
          {/* Payment Gateway Disclaimer */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm font-semibold text-center">
              ⚠️ Payment Gateway Integration is in Progress.
            </p>
          </div>

          <div className="text-center">
            <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose">
            Join us in celebrating the sacred <strong>Sandhi Puja</strong>, the holy transition between Ashtami and Navami through blessed Bhog.{' '}
            <strong>Experience the spiritual essence</strong> of this momentous occasion with our specially prepared Prasad.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-4 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <PujaBookingCard
            pujaKey="sandhiPuja"
            title="Ashtami Sandhi Puja Bhog"
            subtitle="Sacred Transition Bhog Booking"
            description="Select the number of bhog."
            paymentUrl="https://www.abp.proplusdatafoundation.com"
            disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
          />
        </div>
      </section>
    </>
  );
};

export default AshtamiBhogSandhiPujaPage;
