import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/ui/SEO';
import PageHero from '../components/common/PageHero';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="relative">
      <SEO title="Page Not Found" robots="noindex,follow" />

      <PageHero
        title="404"
        subtitle="Page Not Found"
        height="h-[35vh] md:h-[50vh]"
      />

      <section className="py-16 md:py-24 text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-fraunces text-3xl md:text-4xl text-primary font-bold mb-6">
            Oops! This page seems to be missing.
          </h2>
          <p className="text-secondary text-base md:text-lg leading-relaxed mb-10">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. 
            Don't worry, Maa's blessings are still with you. Let's get you back home.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
