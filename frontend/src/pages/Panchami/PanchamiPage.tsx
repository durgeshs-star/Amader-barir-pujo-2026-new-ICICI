import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
} from "../../components/schedule";
import { scheduleIntroParagraph } from "../../assets/data/scheduleShared";

const PanchamiPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Panchami Pujo Schedule"
        description="Panchami Pujo Schedule — Learn about our Panchami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Panchami pujo, Durga Puja 2026 schedule, Amader Barir Pujo Panchami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/panchami"
      />

      <PageHero
        title="Panchami"
        subtitle="Durga Pujo 2026 · Day One"
        height="h-[45vh] md:h-[70vh]"
      />

      <ScheduleIntro paragraph={scheduleIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/panchami-photo.webp"
        imageAlt="Panchami celebration at Amader Barir Pujo"
        subtitle="Pujo Schedule"
        title="Panchami"
        date="15 October 2026"
        timing="Maa Boron : 5:30 PM"
      />

      <FleaMarketSection />
    </>
  );
};

export default PanchamiPage;
