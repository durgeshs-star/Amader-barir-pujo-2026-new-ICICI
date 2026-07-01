import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import BhogBookingSection from "../../components/ui/BhogBookingSection";
import type { BhogBookingCategory } from "../../types/bhog";

const NavamiBhogPage: React.FC = () => {
  const categories: BhogBookingCategory[] = [
    {
      id: "adult",
      title: "Adult Booking",
      description: "per person",
      price: 200,
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
      price: 200,
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
        title="Navami Bhog Schedule"
        description="Navami Bhog Schedule — Learn about our Navami Bhog offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Navami bhog, Maha Navami bhog booking, Durga Puja 2026 bhog, Amader Barir Pujo Navami Bhog"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/bhog-booking/navami"
      />

      <PageHero
        title="Navami Bhog"
        subtitle="Durga Pujo 2026 · Bhog Booking"
        height="h-[45vh] md:h-[70vh]"
      />

      <section className="py-14 md:py-20 bg-light-bg/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
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
      </section>

      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <BhogBookingSection
            title="Book Navami Bhog"
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

export default NavamiBhogPage;
