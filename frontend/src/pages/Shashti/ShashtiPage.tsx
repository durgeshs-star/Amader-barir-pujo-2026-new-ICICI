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
        title="Shashti Puja Schedule 2026"
        description="Shashti Puja Schedule for Durga Puja 2026 in Pune. Discover the timeline, events, and meaningful traditions of Shashti at Amader Barir Pujo."
        keywords="Shashti Puja, Durga Puja 2026 Pune, Shashti Puja schedule, Amader Barir Pujo Shashti"
        ogImage="/assets/img/shashthi.webp"
      />

      <PageHero
        title="Soshti"
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
