import React from "react";
import SEO from "../../components/ui/SEO";
import PageHero from "../../components/common/PageHero";
import {
  ScheduleIntro,
  ScheduleDetails,
} from "../../components/schedule";

const LakshmiPujaPage: React.FC = () => {
  return (
    <div className="relative">
      <SEO
        title="Lakshmi Puja | Durga Puja Pune | Amader Barir Pujo"
        description="Celebrate Lakshmi Puja during Amader Barir Pujo, a Durga Puja celebration in Pune."
        keywords="Lakshmi Puja, Lakshmi Puja, Durga Puja Pune, Amader Barir Pujo"
        ogImage="/assets/img/banner/1.webp"
      />

      <PageHero
        title="Lakshmi Pujo"
        height="h-[35vh] md:h-[60vh]"
      />

      <ScheduleIntro paragraph="Join us for the sacred Lakshmi Puja, a festival dedicated to Goddess Lakshmi, the deity of wealth and prosperity. Celebrated on the full moon day of Ashwin, this puja is believed to bring blessings of abundance and good fortune to all devotees." />

      <ScheduleDetails
        image="/assets/img/puja/16.webp"
        imageAlt="Lakshmi Puja celebration at Amader Bari'r Pujo"
        date="25th October, Sunday (9th Kartik)"
        blocks={[
          {
            subtitle: "Pujo Schedule",
            lines: [
              "12:30 PM — Lakshmi Puja & Kalparambha",
              "01:00 PM — Pushpanjali & Aarti",
              "01:30 PM — Prasad Distribution",
            ],
          },
        ]}
      />


    </div>
  );
};

export default LakshmiPujaPage;
