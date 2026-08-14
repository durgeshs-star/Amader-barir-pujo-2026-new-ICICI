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
        title="Saptami Pujo Schedule"
        description="Saptami Pujo Schedule — Learn about our Saptami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Saptami pujo, Maha Saptami, Durga Puja 2026 schedule, Amader Barir Pujo Saptami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/saptami"
      />

      <PageHero
        title="Saptami"
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
