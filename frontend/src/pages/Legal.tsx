import React from 'react';
import SEO from '../components/ui/SEO';
import { useLocation } from 'react-router-dom';

export const Legal: React.FC = () => {
  const { pathname } = useLocation();
  const isPrivacy = pathname.includes('privacy-policy');

  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  const lastUpdated = 'June 29, 2026';

  return (
    <div className="pt-10 md:pt-14 pb-20 min-h-screen">
      <SEO
        title={title}
        description={`${title} for Amader Barir Pujo, Pune — read our policies regarding your use of this website.`}
      />
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-primary font-fraunces mb-3">
            {title}
          </h1>
          <p className="text-xs text-muted font-semibold font-sans uppercase tracking-wider">
            Last Updated: {lastUpdated}
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Content */}
        <div className="rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm space-y-6 text-sm text-secondary leading-relaxed font-sans select-text">
          {isPrivacy ? (
            <>
              <p>
                At Amader Barir Pujo, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by our platform and how we use it.
              </p>
              
              <h2 className="text-lg font-bold text-primary font-fraunces pt-2">Information We Collect</h2>
              <p>
                When you register as a volunteer, donate via bank transfer, or book Bhog plates, we collect personal information you provide to us such as your name, email address, and phone number. This information is used strictly to process bookings and coordinate events.
              </p>

              <h2 className="text-lg font-bold text-primary font-fraunces pt-2">How We Use Your Information</h2>
              <p>
                We use the information we collect in various ways, including to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, operate, and maintain our booking services.</li>
                <li>Improve, personalize, and expand our community programs.</li>
                <li>Understand and analyze how you interact with our platform.</li>
                <li>Send transactional notifications, booking updates, and volunteer emails.</li>
              </ul>

              <h2 className="text-lg font-bold text-primary font-fraunces pt-2">Security</h2>
              <p>
                We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable.
              </p>
            </>
          ) : (
            <>
              <p>
                Welcome to Amader Barir Pujo. These terms and conditions outline the rules and regulations for the use of our services and online portal.
              </p>

              <h2 className="text-lg font-bold text-primary font-fraunces pt-2">Service Availability</h2>
              <p>
                Bhog bookings, volunteer registrations, and donations are offered to users in good faith to facilitate smooth Durga Pujo community operations. We reserve the right to modify menu details, schedules, or volunteer placements based on logistics and safety constraints.
              </p>

              <h2 className="text-lg font-bold text-primary font-fraunces pt-2">Refund &amp; Contributions</h2>
              <p>
                Seva donations (Anudan) and suggested contributions for Bhog booking are non-refundable and are utilized entirely towards hosting the Pujo and serving free meals (Prasad) to the community.
              </p>

              <h2 className="text-lg font-bold text-primary font-fraunces pt-2">Code of Conduct</h2>
              <p>
                All devotees, volunteers, and visitors are expected to maintain respect, harmony, and discipline at the pandal grounds in Wakad, Pune, keeping in line with the sacred nature of the festivals.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Legal;


