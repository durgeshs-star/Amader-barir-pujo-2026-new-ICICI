import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
} from "../../components/schedule";
import { dashamiIntroParagraph } from "../../assets/data/scheduleShared";

const DashamiPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Dashami Pujo Schedule"
        description="Dashami Pujo Schedule — Learn about our Dashami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Dashami pujo, Vijaya Dashami, Sindoor Khela, Durga Puja 2026 schedule, Amader Barir Pujo Dashami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/dashami"
      />

      <PageHero
        title="Dashami"
        subtitle="Durga Pujo 2026 · Day Six"
        height="h-[45vh] md:h-[70vh]"
      />

      <ScheduleIntro paragraph={dashamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/dashami.webp"
        imageAlt="Dashami celebration at Amader Barir Pujo"
        date="20 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Dashami",
            lines: [
              "Morning Pujo Start : 9:00 AM",
              "Pushpaanjali & Aporajita Pujo : 10:00 AM",
              "Ghot Bishorjon : 10:30 AM",
              "Sindoor Khela : 11:00 AM to 2:30 PM",
              "Pratima Niranjan : 4:00 PM",
            ],
          },
          {
            subtitle: "Cultural Schedule",
            sections: [
              {
                title: "Dashami Noon",
                lines: [
                  "Bijoya Flute : 11:00 AM - 3:00 PM",
                ],
              },
            ],
          },
        ]}
      />

      <FleaMarketSection />
    </>
  );
};

export default DashamiPage;
