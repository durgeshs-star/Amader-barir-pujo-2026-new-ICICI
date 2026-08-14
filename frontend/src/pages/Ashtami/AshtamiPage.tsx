import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
} from "../../components/schedule";
import { ashtamiIntroParagraph } from "../../assets/data/scheduleShared";

const AshtamiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Ashtami Pujo Schedule"
        description="Ashtami Pujo Schedule — Learn about our Ashtami Pujo offerings, procedures, and their spiritual significance at Amader Barir Pujo."
        keywords="Ashtami pujo, Maha Ashtami, Sandhi Puja, Durga Puja 2026 schedule, Amader Barir Pujo Ashtami"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/ashtami"
      />

      <PageHero
        title="Ashtami"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={ashtamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/ashtami.webp"
        imageAlt="Ashtami celebration at Amader Bari'r Pujo"
        date="18th October, Sunday (30th Ashwin)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "07:30 AM — Sri Sri Durga debir Sharadiya MahaAshtami",
              "07:30 AM — Ashtami KolpaArambho & Bihito Pujo",
              "10:30 AM — Pushpanjali and Maa er Bhog",
              "07:00 PM — Shondha kale shitol bhog and Arati",
            ],
          },
        ]}
      />
    </div>
  );
};

export default AshtamiPage;