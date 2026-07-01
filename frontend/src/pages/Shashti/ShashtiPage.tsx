import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
} from "../../components/schedule";
import { scheduleIntroParagraph } from "../../assets/data/scheduleShared";

const ShashtiPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Shashti Pujo Schedule"
        description="Shashti Pujo Schedule — Learn about our Shashti Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Shashti pujo, Maha Shashti, Durga Puja 2026 schedule, Amader Barir Pujo Shashti"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/shashti"
      />

      <PageHero
        title="Shashti"
        subtitle="Durga Pujo 2026 · Day Two"
        height="h-[45vh] md:h-[70vh]"
      />

      <ScheduleIntro paragraph={scheduleIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/shashthi.webp"
        imageAlt="Shashti celebration at Amader Barir Pujo"
        date="16 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Shashti",
            lines: [
              "Morning Pujo Start : 9:30 AM",
              "Pushpaanjali : 10:30 AM",
              "Sandhya Aarti : 7 PM",
            ],
          },
          {
            subtitle: "Cultural Schedule",
            sections: [
              {
                title: "Shashti Noon",
                lines: ["Children's Event : 12:00 PM - 2:00 PM"],
              },
              {
                title: "Shashti Evening",
                lines: [
                  "In-house cultural program (Song & Dance) : 7:00 PM - 10:00 PM",
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

export default ShashtiPage;
