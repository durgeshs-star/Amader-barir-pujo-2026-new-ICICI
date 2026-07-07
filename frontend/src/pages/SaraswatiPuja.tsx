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
      <section className="py-8 md:py-12 bg-light-bg/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-stretch">
            <div className="relative group animate-fade-in-up flex items-end">
              <div className="absolute -inset-3 rounded-2xl bg-linear-to-br from-primary/20 via-accent/10 to-primary-light/20 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5 w-full h-full min-h-162.5 md:min-h-full">
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

            <div className="md:pl-2 animate-fade-in-up flex flex-col" style={{ animationDelay: '0.1s' }}>
              <p className="uppercase tracking-[0.4em] text-accent-text text-xs md:text-sm font-semibold">
                Sacred Tradition
              </p>
              <h3 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 leading-tight">
                HatheKhori (Vidyarambham)
              </h3>
              <div className="w-12 h-1 bg-accent mt-5 rounded-full" />
              
              <span className="inline-block px-4 py-2 bg-light-bg border border-accent/25 rounded-full text-sm font-semibold text-primary mt-6 w-fit">
                Vasant Panchami 2026
              </span>

              <div className="mt-8 space-y-6 flex-grow">
                <div>
                  <h4 className="font-fraunces text-xl md:text-2xl font-bold text-primary leading-tight mb-3">
                    Sacred Tradition
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "The sacred initiation of young children into the world of learning",
                      "Children are guided by the priest or elders to write their first letters on a slate",
                      "Symbolizes the beginning of their educational journey under the blessings of Maa Saraswati",
                      "Families gather to participate in prayers, devotional hymns, and community worship",
                    ].map((line, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-secondary text-base md:text-lg leading-relaxed"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="uppercase tracking-[0.35em] text-accent-text text-xs md:text-sm font-semibold mb-3">
                    Offerings & Blessings
                  </p>
                  <h4 className="font-fraunces text-xl md:text-2xl font-bold text-primary leading-tight mb-3">
                    Sacred Offerings
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Students place their books, notebooks, musical instruments, and educational tools before the goddess",
                      "Praying for wisdom, success, and excellence in academics and the arts",
                      "Devotional hymns and community worship create a spiritual atmosphere",
                    ].map((line, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-secondary text-base md:text-lg leading-relaxed"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
