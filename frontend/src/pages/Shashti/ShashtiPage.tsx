import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,  
} from "../../components/schedule";
import { shashthiIntroParagraph } from "../../assets/data/scheduleShared";

const ShashtiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Shashti 2026 | Bengali Durga Puja Pune | Amader Barir Pujo"
        description="Celebrate Shashti during Amader Barir Pujo 2026, a Bengali Durga Puja celebration in Pune."
        keywords="Shashti 2026, Bengali Durga Puja Pune, Amader Barir Pujo 2026"
        ogImage="/assets/img/shashthi.webp"
      />

      <PageHero
        title="Shashti 2026"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={shashthiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/shashthi.webp"
        imageAlt="Soshti celebration at Amader Bari'r Pujo"
        date="16th October, Friday (28th Ashwin)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "09:30 AM — Durga Shashthi Pujo",
              "10:30 AM — Pushpanjali",
              "07:00 PM — Shondha kale Devibodhan, Amantran and Adhivaas",
            ],
          },
        ]}
      />

       
    </div>
  );
};

export default ShashtiPage;
