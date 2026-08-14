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
        title="Panchami Pujo Schedule"
        description="Panchami Pujo Schedule — Learn about our Panchami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Panchami pujo, Durga Puja 2026 schedule, Amader Barir Pujo Panchami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/panchami"
      />

      <PageHero
        title="Panchami"
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
