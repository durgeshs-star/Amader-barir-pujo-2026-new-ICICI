import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
} from "../../components/schedule";
import { shashthiIntroParagraph } from "../../assets/data/scheduleShared";

const ShashtiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Soshti Pujo Schedule"
        description="Soshti Pujo Schedule — Discover our Soshti Pujo timeline, events, and meaningful traditions at Amader Barir Pujo."
        keywords="Soshti pujo, Durga Puja 2026 day 2, Amader Barir Pujo Soshti"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/shashti"
      />

      <PageHero
        title="Soshti"
        subtitle="Durga Pujo 2026 · Day Two"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={shashthiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/shashthi.webp"
        imageAlt="Soshti celebration at Amader Barir Pujo"
        date="16 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Soshti",
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
                title: "Soshti Noon",
                lines: ["Children's Event : 12:00 PM - 2:00 PM"],
              },
              {
                title: "Soshti Evening",
                lines: [
                  "In-house cultural program (Song & Dance) : 7:00 PM - 10:00 PM",
                ],
              },
            ],
          },
        ]}
      />

      <FleaMarketSection />
    </div>
  );
};

export default ShashtiPage;
