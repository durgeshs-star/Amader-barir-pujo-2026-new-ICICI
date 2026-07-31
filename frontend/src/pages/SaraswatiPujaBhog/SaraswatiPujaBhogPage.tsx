import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import PujaBookingCard from "../../components/ui/PujaBookingCard";

const SaraswatiPujaBhogPage: React.FC = () => {

  return (
    <div className="relative">
      <SEO
        title="Saraswati Puja Bhog Schedule"
        description="Saraswati Puja Bhog Schedule — Learn about our Saraswati Puja Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Saraswati Puja bhog, Saraswati Puja 2026 bhog booking, Amader Barir Pujo Saraswati Puja Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/saraswati-puja-bhog"
      />

      <PageHero
        title="Saraswati Puja Bhog"
        height="h-[35vh] md:h-[60vh]"
      />

      <section className="content-layer py-8">
        <div className="max-w-4xl mx-auto px-6">
            <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose text-center">
            Join us in celebrating Saraswati Puja through the sacred tradition of Bhog.{' '}
            <strong>Book your Bhog</strong> and partake in the sacred prasadam.
            </p>
        </div>
      </section>

      <section className="pb-4">
        <div className="max-w-5xl mx-auto px-6">
          <PujaBookingCard
            pujaKey="saraswatiPuja"
            title="Saraswati Puja Bhog"
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

export default SaraswatiPujaBhogPage;
