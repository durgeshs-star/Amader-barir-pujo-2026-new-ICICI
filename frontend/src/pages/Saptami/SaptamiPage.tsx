import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,  
} from "../../components/schedule";
import { saptamiIntroParagraph } from "../../assets/data/scheduleShared";

const SaptamiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Saptami 2026 | Bengali Durga Puja Pune | Amader Barir Pujo"
        description="Celebrate Saptami during Amader Barir Pujo 2026, a Bengali Durga Puja celebration in Pune."
        keywords="Saptami 2026, Bengali Durga Puja Pune, Amader Barir Pujo 2026"
        ogImage="/assets/img/saptami.webp"
      />

      <PageHero
        title="Saptami 2026"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={saptamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/saptami.webp"
        imageAlt="Saptami celebration at Amader Bari'r Pujo"
        date="17th October, Saturday (29th Ashwin)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "07:30 AM — Sri Sri Durga debir Mahasaptami Bihito Pujo",
              "07:30 AM — Sri Sri Sharadiya Durga Debir Nobopotrika Probesh Sthapan",
              "07:30 AM — Maha Saptami KolpaArambho & Saptami Pujo",
              "10:30 AM — Pushpanjali",
              "07:00 PM — Shondha kale shitol bhog and Arati",
            ],
          },
        ]}
      />

       
    </div>
  );
};

export default SaptamiPage;
