import React from 'react';
import PageHero from '../components/common/PageHero';
import NewsCard from '../components/ui/NewsCard';
import SEO from '../components/ui/SEO';

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
  image?: string;
}

export const News: React.FC = () => {
  const newsItems: NewsItem[] = [
    {
      title: "Durga Puja pandals serve Bengal on a plate: From khichudi to kosha mangsho, pantua",
      source: "Times of India",
      date: "October 2024",
      url: "https://timesofindia.indiatimes.com/city/pune/durga-puja-pandals-serve-bengal-on-a-plate-from-khichudi-to-kosha-mangsho-pantua/articleshow/124199900.cms",
      image: "/assets/img/puja/26.webp"
    }
  ];

  return (
    <div className="min-h-screen bg-light-bg">
      <SEO
        description="Latest news and media coverage about Amader Barir Pujo, Pune. Stay updated with our community celebrations and events."
        keywords="Amader Barir Pujo news, Durga Puja Pune news, Bengali community news, media coverage"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/news"
      />

      {/* Page Header with Hero Image */}
      <PageHero
        title="News & Media"
        subtitle="Stay updated with the latest news and media coverage about Amader Barir Pujo"
        backgroundImage="/assets/img/culture-2.webp"
        height="h-[40vh] md:h-[60vh]"
      />

      {/* News Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item, index) => (
                <NewsCard
                  key={index}
                  title={item.title}
                  source={item.source}
                  date={item.date}
                  url={item.url}
                  image={item.image}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">No news articles available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
