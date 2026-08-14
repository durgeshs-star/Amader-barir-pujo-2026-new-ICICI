import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,  
} from "../../components/schedule";
import { navamiIntroParagraph } from "../../assets/data/scheduleShared";

const NavamiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Navami Pujo Schedule"
        description="Navami Pujo Schedule — Learn about our Navami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Navami pujo, Maha Navami, Durga Puja 2026 schedule, Amader Barir Pujo Navami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/navami"
      />

      <PageHero
        title="Navami"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={navamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/navami.webp"
        imageAlt="Navami celebration at Amader Bari'r Pujo"
        date="20th October, Tuesday (2nd Kartik)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "07:30 AM — Sri Sri Sharadiya Durga debir MahaNavami Bihito Pujo",
              "10:30 AM — Pushpanjali",
              "11:30 AM — Havan",
              "07:00 PM — Shondha kale shitol bhog and Arati",
            ],
          },
        ]}
      />

       
    </div>
  );
};

export default NavamiPage;
