import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import BhogBookingSection from "../../components/ui/BhogBookingSection";
import type { BhogBookingCategory } from "../../types/bhog";

const AshtamiBhogPage: React.FC = () => {
  const categories: BhogBookingCategory[] = [
    {
      id: "adult",
      title: "Adult Booking",
      description: "per person",
      price: 315,
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
      price: 315,
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
        title="Ashtami Bhog Schedule"
        description="Ashtami Bhog Schedule — Learn about our Ashtami Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Ashtami bhog, Maha Ashtami bhog booking, Durga Puja 2026 bhog, Amader Barir Pujo Ashtami Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/bhog-booking/ashtami"
      />

      <PageHero
        title="Ashtami Bhog"
        subtitle="Durga Pujo 2026 · Bhog Booking"
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
            Join us in celebrating Durga Pujo through the sacred tradition of Bhog.{' '}
            <strong>Saptami, Ashtami, Navami</strong> three days of soulful offerings, shared with love. First{' '}
            <strong>400 bookings</strong> get <strong>20% off</strong>! Book your{' '}
            <strong> Bhog at ₹200/- </strong> per person per day. Book your Bhog through{' '}
            <a
              href="https://www.abp.proplusdatafoundation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent-text underline"
            >
              www.abp.proplusdatafoundation.com
            </a>{' '}
            till <strong>20<sup>th</sup> October.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="pb-4 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <BhogBookingSection
            title="Ashtami Bhog"
            subtitle="Bhog Booking"
            description="Select the number of bhog."
            categories={categories}
            paymentUrl="https://www.abp.proplusdatafoundation.com"
            disclaimer="ID card verification is mandatory for children aged 0 to 5 years and senior citizens."
          />
        </div>
      </section>
    </>
  );
};

export default AshtamiBhogPage;
