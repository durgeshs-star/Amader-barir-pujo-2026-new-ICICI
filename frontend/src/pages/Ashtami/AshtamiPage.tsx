import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
} from "../../components/schedule";
import { ashtamiIntroParagraph } from "../../assets/data/scheduleShared";

const AshtamiPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Ashtami Pujo Schedule"
        description="Ashtami Pujo Schedule — Learn about our Ashtami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Ashtami pujo, Maha Ashtami, Sandhi Puja, Durga Puja 2026 schedule, Amader Barir Pujo Ashtami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/ashtami"
      />

      <PageHero
        title="Ashtami"
        subtitle="Durga Pujo 2026 · Day Four"
        height="h-[45vh] md:h-[70vh]"
      />

      <ScheduleIntro paragraph={ashtamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/ashtami.webp"
        imageAlt="Ashtami celebration at Amader Barir Pujo"
        date="18 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Ashtami",
            lines: [
              "Morning Pujo Start : 8:00 AM",
              "Pushpaanjali : 10:00 AM",
              "Sandhi Pujo Start : 1:21 PM",
              "Boli : 1:45 PM, End : 2:09 PM",
              "Sandhya Aarti : 7 PM",
            ],
          },
          {
            subtitle: "Cultural Schedule",
            sections: [
              {
                title: "Ashtami Evening",
                lines: [
                  "Antarang An Artist Abode (Kathak Dance) : 7:30 PM - 8:30 PM",
                  "Semi classical song : 8:30 PM - 9:30 PM",
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

export default AshtamiPage;
