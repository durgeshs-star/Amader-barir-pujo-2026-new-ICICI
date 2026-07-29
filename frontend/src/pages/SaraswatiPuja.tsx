import React from "react";
import SEO from "../components/ui/SEO";
import PageHero from "../components/common/PageHero";
import { FleaMarketSection } from "../components/schedule";
import FleaMarketCarousel from "../components/ui/FleaMarketCarousel";
import ImageGrid from "../components/ui/ImageGrid";
import CarouselContentSection from "../components/common/CarouselContentSection";

const SaraswatiPuja: React.FC = () => {

  return (
    <>
      <SEO
        title="Saraswati Puja - Celebration of Knowledge & Learning"
        description="Join us in celebrating Saraswati Puja, the festival of knowledge, wisdom, music, and arts. Experience Hathe Khori, traditional rituals, and community worship at Amader Barir Pujo."
        keywords="Saraswati Puja, Hathe Khori, Vidyarambham, Bengali festival, Goddess Saraswati, Basant Panchami, Amader Barir Pujo"
        ogImage="/assets/img/Saraswati-Pujo.jpg"
        canonical="https://www.abp.proplusdatafoundation.com/saraswati-puja"
      />

      <PageHero
        title="Saraswati Puja"
        subtitle="Celebration of Knowledge, Wisdom & Learning"
        backgroundImage="/assets/img/saraswati-puja16.webp"
        height="h-[45vh] md:h-[70vh]"
        objectPosition="center top"
      />

      {/* Introduction Section */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="font-fraunces text-3xl md:text-4xl font-bold text-primary leading-tight mb-6">
              Divine Embodiment of Knowledge
            </h2>
            <div className="w-16 h-1 bg-accent mb-8 rounded-full" />
            <p className="text-secondary text-lg md:text-xl leading-relaxed mb-6">
              Saraswati Puja is one of the most cherished festivals in the Bengali community, celebrating Goddess Saraswati as the divine embodiment of knowledge, wisdom, music, arts, and learning. The images beautifully capture a traditional Bengali-style celebration, where the elegantly decorated idol of Maa Saraswati is adorned with fresh flower garlands and worshipped with devotion through rituals such as aarti, pushpanjali, and sacred offerings.
            </p>
            <p className="text-secondary text-lg md:text-xl leading-relaxed">
              The vibrant decorations, colorful kites, floral arrangements, and traditional attire create a festive atmosphere that reflects Bengal's rich cultural heritage while inspiring devotees to seek the goddess's blessings for education, creativity, and spiritual growth.
            </p>
          </div>
        </div>
      </section>

      {/* Hathe Khori Section */}
      <CarouselContentSection
        label="Sacred Tradition of Learning"
        headingPrimary="Hathe Khori"
        headingSecondary="(Vidyarambham)"
        description="The sacred initiation of young children into the world of learning, where they are guided by the priest or elders to write their first letters on a slate under the blessings of Maa Saraswati."
        items={[
          {
            title: "Sacred Tradition",
            description: "The sacred initiation of young children into the world of learning, symbolizing the beginning of their educational journey under the blessings of Maa Saraswati."
          },
          {
            title: "Sacred Offerings",
            description: "Students place their books, notebooks, musical instruments, and educational tools before the goddess, praying for wisdom, success, and excellence in academics and the arts."
          }
        ]}
        carousel={
          <div className="relative overflow-hidden rounded-xl shadow-xl w-full h-[450px]">
            <FleaMarketCarousel
              images={[
                "/assets/img/saraswati-puja15.webp",
                "/assets/img/saraswati-puja10.webp",
                "/assets/img/saraswati-puja14.webp",
              ]}
              autoPlay={true}
              interval={2500}
              slidesPerView={1}
              altPrefix="Saraswati Puja"
              showDots={true}
            />
          </div>
        }
      />

      {/* Gallery Section */}
      <section className="content-layer py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-fraunces text-3xl md:text-4xl font-bold text-primary leading-tight mb-4">
              Celebration Highlights
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto mb-6 rounded-full" />
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              Experience the vibrant traditions and spiritual essence of Saraswati Puja
            </p>
          </div>

          <ImageGrid
            images={[

              { id: "1", src: "/assets/img/saraswati-puja10.webp", alt: "Saraswati Puja ceremony" },
              { id: "2", src: "/assets/img/saraswati-puja9.webp", alt: "Devotional offerings" },
              { id: "11", src: "/assets/img/saraswati-puja14.webp", alt: "Sacred offerings" },
              { id: "3", src: "/assets/img/saraswati-puja12.webp", alt: "Traditional celebration" },
              { id: "4", src: "/assets/img/saraswati-puja2.webp", alt: "Traditional Saraswati Puja decoration" },
              { id: "5", src: "/assets/img/saraswati-puja3.webp", alt: "Devotees offering prayers" },
              { id: "6", src: "/assets/img/saraswati-puja5.webp", alt: "Community celebration" },
              { id: "7", src: "/assets/img/saraswati-puja6.webp", alt: "Saraswati Puja celebration" },
              { id: "8", src: "/assets/img/saraswati-puja7.webp", alt: "Traditional rituals" },
              { id: "9", src: "/assets/img/saraswati-puja8.webp", alt: "Festive atmosphere" },
            ]}
            showYear={false}
            columns={{ mobile: 1, tablet: 2, desktop: 3, xl: 4 }}
          />
        </div>
      </section>

      {/* Community Section */}
      <section className="content-layer py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="font-fraunces text-3xl md:text-4xl font-bold text-primary leading-tight mb-6">
              Community Celebration
            </h2>
            <div className="w-16 h-1 bg-accent mb-8 rounded-full" />
            <p className="text-secondary text-lg md:text-xl leading-relaxed mb-6">
              The Saraswati Puja celebration brings together people of all ages in a spirit of devotion, culture, and togetherness. Community members dressed in traditional yellow and white attire participate in prayers, offer flowers, receive prasadam, and seek the blessings of the goddess for a prosperous and enlightened future.
            </p>
            <p className="text-secondary text-lg md:text-xl leading-relaxed">
              More than just a religious festival, Saraswati Puja serves as a celebration of education, creativity, and the timeless Bengali tradition of honoring knowledge, making it a joyful occasion that strengthens family bonds, preserves cultural values, and inspires lifelong learning.
            </p>
          </div>
        </div>
      </section>

      {/* Flea Market Section */}
      <FleaMarketSection />
    </>
  );
};

export default SaraswatiPuja;
