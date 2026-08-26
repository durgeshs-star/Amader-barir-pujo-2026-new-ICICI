import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
} from "../../components/schedule";
import { dashamiIntroParagraph } from "../../assets/data/scheduleShared";

const DashamiPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Dashami 2026 | Bengali Durga Puja Pune | Amader Barir Pujo"
        description="Celebrate Dashami during Amader Barir Pujo 2026, a Bengali Durga Puja celebration in Pune."
        keywords="Dashami 2026, Bengali Durga Puja Pune, Amader Barir Pujo 2026"
        ogImage="/assets/img/dashami.webp"
      />

      <PageHero title="Dashami 2026" height="h-[35vh] md:h-[60vh]" />

      <ScheduleIntro paragraph={dashamiIntroParagraph}>
        <h2 className="font-fraunces font-bold text-3xl md:text-5xl text-primary italic">
          Asche bochor abar hobe
        </h2>
      </ScheduleIntro>

      <ScheduleDetails
        image="/assets/img/dashami.webp"
        imageAlt="Dashami celebration at Amader Bari'r Pujo"
        date="21st October, Wednesday (3rd Kartik)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "08:00 to 09:30 AM — Sri Sri Sharadiya Durga debir Dashami Bihito Pujo",
              "10:00 AM — Aparajita Pujo",
              "11:30 AM to 02:30 PM — Sindoor Khela",
              "04:00 PM — Pratima Niranjan",
            ],
          },
        ]}
      />
    </div>
  );
};

export default DashamiPage;