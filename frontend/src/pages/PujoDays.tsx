import SEO from "../components/ui/SEO";
import PageHero from "../components/common/PageHero";
import PujoDaysSection from "../components/PujoDays/PujoDaysSection";

const PujoDays = () => {
  return (
    <>
      <SEO
        title="Pujo Days | Amader Barir Pujo"
        description="Explore the sacred days of Durga Puja - from Mahalaya to Maha Dashami. Learn about the rituals and significance of each day."
        keywords="Pujo Days, Durga Puja schedule, Mahalaya, Maha Shashti, Maha Saptami, Maha Ashtami, Maha Navami, Maha Dashami"
        ogImage="/assets/img/banner/1.webp"
      />

      <PageHero
        title="Pujo Days"
        subtitle="Experience the divine journey through each sacred day of Durga Puja"
      />
      <PujoDaysSection />
    </>
  );
};

export default PujoDays;
