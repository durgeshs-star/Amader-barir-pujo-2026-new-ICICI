import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,  
} from "../../components/schedule";
import { panchamiIntroParagraph } from "../../assets/data/scheduleShared";

const PanchamiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Panchami 2026 | Bengali Durga Puja Pune | Amader Barir Pujo"
        description="Celebrate Panchami during Amader Barir Pujo 2026, a Bengali Durga Puja celebration in Pune."
        keywords="Panchami 2026, Bengali Durga Puja Pune, Amader Barir Pujo 2026"
        ogImage="/assets/img/panchami-photo.webp"
      />

      <PageHero
        title="Panchami 2026"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={panchamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/panchami-photo.webp"
        imageAlt="Panchami celebration at Amader Bari'r Pujo"
        subtitle="Pujo Schedule"
        date="15th October, Friday (27th Ashwin)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "05:30 PM — Maa Boron",
            ],
          },
        ]}
      />

       
    </div>
  );
};

export default PanchamiPage;
