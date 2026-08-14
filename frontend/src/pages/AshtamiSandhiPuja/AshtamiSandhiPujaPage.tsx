import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,  
} from "../../components/schedule";
import { ashtamiSandhiPujaIntroParagraph } from "../../assets/data/scheduleShared";

const AshtamiSandhiPujaPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Ashtami Sandhi Puja Schedule"
        description="Ashtami Sandhi Puja Schedule — Experience the sacred transition between Ashtami and Navami at Amader Barir Pujo 2026."
        keywords="Ashtami Sandhi Puja, Sandhi Puja schedule, Durga Puja 2026, Amader Barir Pujo Ashtami Sandhi"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/ashtami-sandhi-puja"
      />

      <PageHero
        title="Ashtami Sandhi Pujo"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={ashtamiSandhiPujaIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/ashtami.webp"
        imageAlt="Ashtami Sandhi Puja celebration at Amader Bari'r Pujo"
        date="19th October, Monday (1st Kartik)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "07:26 AM — Shondhi Pujo starts",
              "07:50 AM — Balidaan",
              "08:14 AM — Sondhi Pujo Ends",
              "07:00 PM — Shondha kale shitol bhog and Arati",
            ],
          },
        ]}
      />

       
    </div>
  );
};

export default AshtamiSandhiPujaPage;