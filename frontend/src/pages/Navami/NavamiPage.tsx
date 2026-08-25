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
        title="Navami Puja Schedule 2026"
        description="Navami Puja Schedule for Durga Puja 2026 in Pune. Learn about Maha Navami rituals, Havan ceremony, and spiritual significance at Amader Barir Pujo."
        keywords="Navami Puja, Maha Navami, Durga Puja 2026 Pune, Navami Puja schedule, Amader Barir Pujo Navami"
        ogImage="/assets/img/navami.webp"
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
