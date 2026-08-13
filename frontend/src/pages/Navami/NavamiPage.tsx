import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
  FleaMarketSection,
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
        imageAlt="Navami celebration at Amader Barir Pujo"
        date="19 October 2026"
        blocks={[
          {
            subtitle: "Pujo Schedule (2026)",
            title: "Navami",
            lines: [
              "Morning Pujo Start : 8:00 AM",
              "Pushpaanjali : 10:00 AM",
              "Hawaan : 12:00 PM",
              "Sandhya Aarti : 7 PM",
            ],
          },
          {
            subtitle: "Cultural Schedule",
            sections: [
              {
                title: "Navami Evening",
                lines: [
                  "Dhunuchi : 7:30 PM - 8:15 PM",
                  "Hindi Band - AB Dreams : 8:30 PM - 10:00 PM",
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

export default NavamiPage;
