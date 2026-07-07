import React from "react";
import SEO from "../components/ui/SEO";
import PageHero from "../components/common/PageHero";
import { FleaMarketSection } from "../components/schedule";
import FleaMarketCarousel from "../components/ui/FleaMarketCarousel";
import ImageGrid from "../components/ui/ImageGrid";

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
      <section className="py-8 md:py-12 bg-white">
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
      <section className="bg-white py-10 lg:py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-stretch">
            <div className="relative min-h-112.5 flex items-center justify-center animate-fade-in-up">
              {/* Decorative Corners */}
              <span className="absolute -top-5 -left-5 z-10 text-4xl text-accent-text">
                ❦
              </span>
              <span className="absolute -top-5 -right-5 z-10 rotate-90 text-4xl text-accent-text">
                ❦
              </span>
              <span className="absolute -bottom-5 -left-5 z-10 -rotate-90 text-4xl text-accent-text">
                ❦
              </span>
              <span className="absolute -bottom-5 -right-5 z-10 rotate-180 text-4xl text-accent-text">
                ❦
              </span>

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
            </div>

            <div className="h-full flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="uppercase tracking-widest text-secondary text-[11px] font-medium animate-fade-in">
                Sacred Tradition of Learning
              </p>
              <h2 className="font-fraunces text-3xl lg:text-4xl font-bold leading-tight mt-2 animate-fade-in-up">
                <span className="text-primary">
                  Hathe Khori
                </span>
                <br />
                <span className="italic text-secondary font-medium">
                  (Vidyarambham)
                </span>
              </h2>
              <p className="text-dark-bg text-sm leading-6 mt-4 mb-4 animate-fade-in">
                The sacred initiation of young children into the world of learning, where they are guided by the priest or elders to write their first letters on a slate under the blessings of Maa Saraswati.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Sacred Tradition",
                    description: "The sacred initiation of young children into the world of learning, symbolizing the beginning of their educational journey under the blessings of Maa Saraswati."
                  },
                  {
                    title: "Sacred Offerings",
                    description: "Students place their books, notebooks, musical instruments, and educational tools before the goddess, praying for wisdom, success, and excellence in academics and the arts."
                  }
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="border-l-4 border-primary pl-5 py-1.5 transition-all duration-300 hover:border-secondary hover:translate-x-2 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <h3 className="font-fraunces text-xl text-primary font-bold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-dark-bg text-sm leading-6">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-8 md:py-12 bg-white">
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
              { id: "1", src: "/assets/img/saraswati-puja2.webp", alt: "Traditional Saraswati Puja decoration" },
              { id: "2", src: "/assets/img/saraswati-puja3.webp", alt: "Devotees offering prayers" },
              { id: "3", src: "/assets/img/saraswati-puja5.webp", alt: "Community celebration" },
              { id: "4", src: "/assets/img/saraswati-puja6.webp", alt: "Saraswati Puja celebration" },
              { id: "5", src: "/assets/img/saraswati-puja7.webp", alt: "Traditional rituals" },
              { id: "6", src: "/assets/img/saraswati-puja8.webp", alt: "Festive atmosphere" },
              { id: "7", src: "/assets/img/saraswati-puja9.webp", alt: "Devotional offerings" },
              { id: "8", src: "/assets/img/saraswati-puja10.webp", alt: "Saraswati Puja ceremony" },
              { id: "9", src: "/assets/img/saraswati-puja12.webp", alt: "Traditional celebration" },
              { id: "11", src: "/assets/img/saraswati-puja14.webp", alt: "Sacred offerings" },
            ]}
            showYear={false}
            columns={{ mobile: 1, tablet: 2, desktop: 3, xl: 4 }}
          />
        </div>
      </section>

      {/* Community Section */}
      <section className="py-8 md:py-12 bg-white">
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
