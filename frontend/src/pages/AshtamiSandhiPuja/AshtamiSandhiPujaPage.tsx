import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
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
        title="Ashtami Sandhi Puja"
        subtitle="Durga Pujo 2026 · Sacred Transition"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={ashtamiSandhiPujaIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/ashtami.webp"
        imageAlt="Ashtami Sandhi Puja celebration at Amader Barir Pujo"
        date="18 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Ashtami Sandhi Puja",
            lines: [
              "Sandhi Pujo Start : 1:21 PM",
              "Boli : 1:45 PM, End : 2:09 PM",
              "Aarti : 2:15 PM",
              "Pushpanjali : 2:30 PM",
            ],
          },
          {
            subtitle: "Spiritual Significance",
            sections: [
              {
                title: "The Sacred Threshold",
                lines: [
                  "Sandhi Puja marks the holy junction between two days",
                  "A moment of profound spiritual connection and devotion",
                  "The transition from Ashtami's warrior energy to Navami's victory",
                ],
              },
            ],
          },
        ]}
      />

      <FleaMarketSection />
    </div>
  );
};

export default AshtamiSandhiPujaPage;
