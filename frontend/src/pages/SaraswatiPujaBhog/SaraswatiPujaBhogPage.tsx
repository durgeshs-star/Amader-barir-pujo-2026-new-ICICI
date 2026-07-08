import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import BhogBookingSection from "../../components/ui/BhogBookingSection";
import type { BhogBookingCategory } from "../../types/bhog";

const SaraswatiPujaBhogPage: React.FC = () => {
  const categories: BhogBookingCategory[] = [
    {
      id: "adult",
      title: "Adult Booking",
      description: "per person",
      price: 150,
      max: 10,
    },
    {
      id: "children-0-5",
      title: "Children aged 0 to 5",
      description: "",
      price: 0,
      max: 2,
    },
    {
      id: "children-5-plus",
      title: "Children aged 5 and Above",
      description: "per child",
      price: 150,
      max: 5,
    },
    {
      id: "senior-citizens",
      title: "Senior Citizens",
      description: "per person",
      price: 100,
      max: 10,
    },
  ];

  return (
    <>
      <SEO
        title="Saraswati Puja Bhog Schedule"
        description="Saraswati Puja Bhog Schedule — Learn about our Saraswati Puja Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Saraswati Puja bhog, Saraswati Puja 2026 bhog booking, Amader Barir Pujo Saraswati Puja Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/saraswati-puja-bhog"
      />

      <PageHero
        title="Saraswati Puja Bhog"
        subtitle="Saraswati Puja 2026 · Bhog Booking"
        height="h-[45vh] md:h-[70vh]"
      />

      <section className="py-14 md:py-20 bg-light-bg/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-base md:text-lg text-secondary leading-relaxed md:leading-loose">
            Join us in celebrating Saraswati Puja through the sacred tradition of Bhog.{' '}
            <strong>Book your Bhog</strong> and partake in the sacred prasadam. First{' '}
            <strong>100 bookings</strong> get <strong>15% off</strong>! Book your{' '}
            <strong> Bhog at ₹150/- </strong> per person. Book your Bhog through{' '}
            <a
              href="https://www.abp.proplusdatafoundation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent-text underline"
            >
              www.abp.proplusdatafoundation.com
            </a>{' '}
            till the event day.
          </p>
        </div>
      </section>

      <section className="py-4 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <BhogBookingSection
            title="Book Saraswati Puja Bhog"
            subtitle="Bhog Booking"
            description="Select the number of bhog plate."
            categories={categories}
            paymentUrl="https://www.abp.proplusdatafoundation.com"
            disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
          />
        </div>
      </section>
    </>
  );
};

export default SaraswatiPujaBhogPage;
