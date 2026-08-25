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
        title="Dashami Puja Schedule 2026"
        description="Dashami Puja Schedule for Durga Puja 2026 in Pune. Learn about Vijaya Dashami rituals, Sindoor Khela, immersion procession, and spiritual significance at Amader Barir Pujo."
        keywords="Dashami Puja, Vijaya Dashami, Sindoor Khela Pune, Durga Puja 2026 Pune, Dashami Puja schedule"
        ogImage="/assets/img/dashami.webp"
      />

      <PageHero title="Dashami" height="h-[35vh] md:h-[60vh]" />

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