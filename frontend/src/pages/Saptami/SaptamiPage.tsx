import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
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
        subtitle="Durga Pujo 2026 · Day Three"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph={saptamiIntroParagraph} />

      <ScheduleDetails
        image="/assets/img/saptami.webp"
        imageAlt="Saptami celebration at Amader Barir Pujo"
        date="17 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Saptami",
            lines: [
              "Morning Pujo Start : 8:00 AM",
              "Pushpaanjali : 10:00 AM",
              "Sandhya Aarti : 7 PM",
            ],
          },
          {
            subtitle: "Cultural Schedule",
            sections: [
              {
                title: "Saptami Evening (8:00 PM - 10:00 PM)",
                lines: [
                  "Kathak and Bharatnatyam Fusion (Navaras) Dance Group - Shilpi"
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

export default SaptamiPage;
