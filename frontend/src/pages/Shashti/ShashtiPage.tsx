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
        title="Soshti Pujo Schedule"
        description="Soshti Pujo Schedule — Discover our Soshti Pujo timeline, events, and meaningful traditions at Amader Barir Pujo."
        keywords="Soshti pujo, Durga Puja 2026 day 2, Amader Barir Pujo Soshti"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/shashti"
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
