import React, { useState } from 'react';
import SEO from '../components/ui/SEO';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';

interface BhogMenu {
  title: string;
  items: string[];
  suggestedContribution: string;
}

export const BhogBooking: React.FC = () => {
  const { day } = useParams<{ day: string }>();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plates: '1',
    collection: 'pandal',
  });
  const [submitted, setSubmitted] = useState(false);

  const bhogDays: Record<string, { title: string; date: string; menu: BhogMenu }> = {
    saptami: {
      title: 'Saptami Bhog',
      date: 'October 17, 2026',
      menu: {
        title: 'Maha Saptami Khichuri Bhog',
        items: ['Gobindobhog Rice Khichuri', 'Labra (Mixed Veg Curry)', 'Beguni (Eggplant Fritters)', 'Sweet Tomato Chutney', 'Papad', 'Payesh (Rice Kheer)'],
        suggestedContribution: 'â‚¹150 per plate',
      }
    },
    ashtami: {
      title: 'Ashtami Bhog',
      date: 'October 18, 2526',
      menu: {
        title: 'Maha Ashtami Special Bhog',
        items: ['Gobindobhog Rice Khichuri', 'Cholar Dal with Coconut', 'Alur Dom', 'Beguni', 'Anarash (Pineapple) Chutney', 'Rosogolla', 'Payesh'],
        suggestedContribution: 'â‚¹200 per plate',
      }
    },
    'ashtami-sandhi-puja': {
      title: 'Ashtami Sandhi Puja Bhog',
      date: 'October 18, 2026',
      menu: {
        title: 'Sandhi Puja Sacred Prasad',
        items: ['Gobindobhog Rice Khichuri', 'Cholar Dal with Coconut', 'Alur Dom', 'Beguni', 'Anarash (Pineapple) Chutney', 'Rosogolla', 'Payesh'],
        suggestedContribution: 'â‚¹200 per plate',
      }
    },
    navami: {
      title: 'Navami Bhog',
      date: 'October 19, 2026',
      menu: {
        title: 'Maha Navami Pulao Bhog',
        items: ['Basanti Pulao', 'Paneer Butter Masala', 'Dhokar Dalna', 'Beguni', 'Mango Chutney', 'Papad', 'Sweet Curd (Misti Doi)', 'Gulab Jamun'],
        suggestedContribution: 'â‚¹250 per plate',
      }
    },
    'lakshmi-puja': {
      title: 'Lakshmi Puja Bhog',
      date: 'October 24, 2026',
      menu: {
        title: 'Kojagari Lakshmi Puja Prasad',
        items: ['Khichuri', 'Labra', 'Beguni', 'Narkel Nadu (Coconut Ladoo)', 'Suji Halwa', 'Payesh'],
        suggestedContribution: 'â‚¹150 per plate',
      }
    }
  };

  const activeDayKey = day && bhogDays[day.toLowerCase()] ? day.toLowerCase() : 'saptami';
  const activeDay = bhogDays[activeDayKey];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-10 md:pt-14 pb-20 min-h-screen">
      <SEO
        title={activeDay ? `${activeDay.title} Booking` : 'Bhog Booking'}
        description="Book your sacred Prasad Bhog for Durga Puja 2026 at Amader Barir Pujo, Wakad Pune. Available for Saptami, Ashtami, Navami and Lakshmi Puja."
        keywords="Bhog booking Pune, Durga Puja prasad 2026, khichuri bhog Wakad Pune"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/bhog-booking"
      />
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-primary font-fraunces mb-3">
            Bhog Booking
          </h1>
          <p className="text-sm text-muted font-medium text-center font-sans">
            Book your sacred Prasad lunch box for pick-up or dine-in
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Payment Gateway Disclaimer */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm font-semibold text-center">
            ⚠️ Payment Gateway Integration is in Progress.
          </p>
        </div>

        {/* Days Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 p-2.5 rounded-xl border border-gray-150 shadow-sm select-none">
          {Object.keys(bhogDays).map((key) => {
            const label = bhogDays[key].title.replace(' Bhog', '');
            const isActive = activeDayKey === key;
            return (
              <Link
                key={key}
                to={`/bhog-booking/${key}`}
                className={`px-5 py-2.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 block ${
                  isActive
                    ? 'bg-primary text-text-on-primary shadow-md'
                    : 'text-secondary hover:bg-light-bg hover:text-primary'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 content-layer">
          
          {/* Left Column: Menu Details */}
          <div className="lg:col-span-2 rounded-2xl p-6 md:p-10 shadow-md border border-gray-100 animate-fade-in select-text">
            <span className="text-xs font-bold text-accent-text uppercase tracking-widest">Selected Pujo Day</span>
            <h2 className="text-2xl md:text-4xl font-bold font-fraunces text-primary mt-1 mb-6">
              {activeDay.title}
            </h2>

            <div className="p-6 rounded-xl border border-gray-150 space-y-4">
              <h3 className="text-lg font-bold text-primary font-fraunces border-b border-gray-250 pb-2">
                {activeDay.menu.title}
              </h3>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 list-disc text-sm text-secondary">
                {activeDay.menu.items.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex justify-between items-center text-xs font-bold text-secondary border-t border-gray-200">
                <span>Suggested Seva Contribution</span>
                <span className="text-base text-primary font-fraunces">{activeDay.menu.suggestedContribution}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Request Form */}
          <div className="rounded-2xl p-6 shadow-md border border-gray-100 self-start">
            <h2 className="text-lg font-bold font-fraunces text-primary mb-4">Request Bhog Box</h2>
            
            {submitted ? (
              <div className="text-center py-8 space-y-3 animate-fade-in">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 font-bold text-xl">
                  âœ“
                </div>
                <h3 className="text-lg font-bold font-fraunces text-primary">Booking Requested</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Thank you! We have received your Bhog booking request for {activeDay.title} ({formData.plates} plates). Please complete the suggested contribution at our desk or via UPI transfer.
                </p>
                <button onClick={() => setSubmitted(false)} className="text-xs text-accent-text hover:underline bg-transparent border-0 cursor-pointer">
                  Request more plates
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 select-text">
                <div className="flex flex-col gap-1">
                  <label htmlFor="bh-name" className="text-[10px] font-bold text-secondary uppercase tracking-widest">Name</label>
                  <input
                    id="bh-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                    placeholder="Enter name"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="bh-phone" className="text-[10px] font-bold text-secondary uppercase tracking-widest">Phone</label>
                  <input
                    id="bh-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                    placeholder="Enter phone"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="bh-plates" className="text-[10px] font-bold text-secondary uppercase tracking-widest">Number of Plates</label>
                  <input
                    id="bh-plates"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.plates}
                    onChange={(e) => setFormData({ ...formData, plates: e.target.value })}
                    className="px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Collection Mode</span>
                  <div className="flex items-center gap-4 text-xs font-medium text-secondary">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value="pandal"
                        checked={formData.collection === 'pandal'}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        className="accent-primary"
                      />
                      Dine-in at Pandal
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="collection"
                        value="takeaway"
                        checked={formData.collection === 'takeaway'}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        className="accent-primary"
                      />
                      Takeaway Parcel
                    </label>
                  </div>
                </div>
                <Button type="submit" variant="primary" fullWidth className="py-2.5 text-xs">
                  Request Bhog Plates
                </Button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BhogBooking;


