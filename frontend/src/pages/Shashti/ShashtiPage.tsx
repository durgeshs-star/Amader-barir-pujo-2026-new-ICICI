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
        title="Shashti Pujo Schedule"
        description="Shashti Pujo Schedule — Discover our Shashti Pujo timeline, events, and meaningful traditions at Amader Barir Pujo."
        keywords="Shashti pujo, Durga Puja 2026 day 2, Amader Barir Pujo Shashti"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/shashti"
      />

      <PageHero
        title="Shashti"
        subtitle="Durga Pujo 2026 · Day Two"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={shashthiIntroParagraph} />

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
    </div>
  );
};

export default ShashtiPage;
