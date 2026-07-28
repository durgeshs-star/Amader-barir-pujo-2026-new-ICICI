import React from 'react';
import SEO from '../components/ui/SEO';
import { useParams, Link } from 'react-router-dom';
import { FaClock } from 'react-icons/fa';

interface ScheduleItem {
  time: string;
  ritual: string;
  details: string;
}

export const Schedule: React.FC = () => {
  const { day } = useParams<{ day: string }>();

  // Map schedules
  const scheduleData: Record<string, { title: string; date: string; items: ScheduleItem[] }> = {
    panchami: {
      title: 'Panchami',
      date: 'October 15, 2026',
      items: [
        { time: '06:30 PM', ritual: 'Maa Durga Aavaahan & Kalparambha', details: 'Commencement of the primary Durga Puja rituals.' },
        { time: '07:30 PM', ritual: 'Sandhya Aarti', details: 'Evening lamp offerings and devotional chanting.' },
        { time: '08:30 PM', ritual: 'Cultural Programs', details: 'Inaugural community dance and devotional song recitals.' }
      ]
    },
    shashti: {
      title: 'Maha Shashti',
      date: 'October 16, 2026',
      items: [
        { time: '08:00 AM', ritual: 'Maha Shashti Kalparambha', details: 'Morning worship setting up the holy water vessels.' },
        { time: '09:30 AM', ritual: 'Bodhon, Amantran & Adhibas', details: 'Awakening of the Goddess Durga and welcoming rites.' },
        { time: '07:00 PM', ritual: 'Amantran Aarti & Sandhya Aarti', details: 'Evening lamp worship and devotional offerings.' }
      ]
    },
    saptami: {
      title: 'Maha Saptami',
      date: 'October 17, 2026',
      items: [
        { time: '06:00 AM', ritual: 'Naba Patrika Prabesh & Sthapana', details: 'The entry and installation of Kola Bou (nine sacred leaves).' },
        { time: '08:30 AM', ritual: 'Maha Saptami Puja', details: 'Main rituals and sacred chants of Saptami.' },
        { time: '10:30 AM', ritual: 'Community Pushpanjali', details: 'Devotees offer floral prayers to the Goddess.' },
        { time: '12:30 PM', ritual: 'Bhog Distribution', details: 'Serving of traditional cooked Prasad to all visitors.' },
        { time: '07:30 PM', ritual: 'Sandhya Aarti & Dhunuchi Naach', details: 'Devotional evening worship with the traditional clay pot dance.' }
      ]
    },
    ashtami: {
      title: 'Maha Ashtami',
      date: 'October 18, 2026',
      items: [
        { time: '08:30 AM', ritual: 'Maha Ashtami Puja', details: 'The most sacred core rituals of Durga Puja.' },
        { time: '10:30 AM', ritual: 'Maha Pushpanjali & Aarti', details: 'Devotees offer flowers and prayers with strict guidance.' },
        { time: '12:30 PM', ritual: 'Bhog Prasad Distribution', details: 'Traditional Khichuri Bhog distribution.' },
        { time: '05:30 PM', ritual: 'Sandhi Puja & Aarti', details: 'A highly auspicious transition ritual celebrating the destruction of demons (108 lamps).' },
        { time: '07:30 PM', ritual: 'Sandhya Aarti', details: 'Evening light offerings.' }
      ]
    },
    navami: {
      title: 'Maha Navami',
      date: 'October 19, 2026',
      items: [
        { time: '08:30 AM', ritual: 'Maha Navami Puja', details: 'Concluding core prayers and morning rituals.' },
        { time: '10:30 AM', ritual: 'Pushpanjali & Aarti', details: 'Devotees morning flower offerings.' },
        { time: '11:30 AM', ritual: 'Maha Homa (Yagna)', details: 'The sacred fire sacrifice ritual.' },
        { time: '12:45 PM', ritual: 'Special Bhog Distribution', details: 'Serving of special festive lunch.' },
        { time: '07:30 PM', ritual: 'Sandhya Aarti & Dhunuchi Naach', details: 'Final major evening clay lamp dance.' }
      ]
    },
    dashami: {
      title: 'Maha Dashami',
      date: 'October 20, 2026',
      items: [
        { time: '08:30 AM', ritual: 'Maha Dashami Puja', details: 'Concluding rituals marking the departure of Maa Durga.' },
        { time: '10:00 AM', ritual: 'Darpan Bisarjan', details: 'Mirror reflection immersion ritual.' },
        { time: '11:00 AM', ritual: 'Sindoor Khela & Boron', details: 'Women bid farewell with vermilion and sweets.' },
        { time: '05:00 PM', ritual: 'Sacred Immersion Procession', details: 'Procession carrying the deity to water body.' },
        { time: '08:00 PM', ritual: 'Bijoya Milani & Greetings', details: 'Sharing sweets and offering respect to elders.' }
      ]
    },
    'lakshmi-puja': {
      title: 'Kojagari Lakshmi Puja',
      date: 'October 24, 2026',
      items: [
        { time: '06:30 PM', ritual: 'Lakshmi Puja & Kalparambha', details: 'Invocation of Goddess Lakshmi for wealth and prosperity.' },
        { time: '08:00 PM', ritual: 'Pushpanjali & Aarti', details: 'Floral offerings and lamp rituals.' },
        { time: '08:30 PM', ritual: 'Prasad Distribution', details: 'Serving of sweets and traditional coconut flatbread.' }
      ]
    }
  };

  const activeDayKey = day && scheduleData[day.toLowerCase()] ? day.toLowerCase() : 'panchami';
  const activeDay = scheduleData[activeDayKey];

  return (
    <div className="pt-10 md:pt-14 pb-20 bg-light-bg/30 min-h-screen">
      <SEO
        title={activeDay ? `${activeDay.title} Schedule` : 'Pujo Schedule'}
        description="View the complete Durga Puja 2026 schedule for Amader Barir Pujo — day-wise rituals, timings, and programs for Panchami through Dashami."
        keywords="Durga Puja schedule 2026 Pune, Pujo timetable Wakad, Amader Barir Pujo schedule"
        ogImage="/assets/img/banner/1.webp"
        canonical="https://www.abp.proplusdatafoundation.com/pujo-schedule"
      />
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-primary font-fraunces mb-3">
            Pujo Schedule
          </h1>
          <p className="text-sm text-muted font-medium text-center">
            Daily rituals and timing details for the 2026 celebrations
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Days Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 bg-light-bg p-2.5 rounded-xl border border-gray-150 shadow-sm select-none">
          {Object.keys(scheduleData).map((key) => {
            const label = scheduleData[key].title.replace('Maha ', '');
            const isActive = activeDayKey === key;
            return (
              <Link
                key={key}
                to={`/pujo-schedule/${key}`}
                className={`px-4 py-2.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 block ${
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

        {/* Schedule Display */}
        <div className="bg-light-bg rounded-2xl p-6 md:p-10 shadow-md border border-gray-100 animate-fade-in select-text">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-150 pb-6 mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-accent-text uppercase tracking-widest">Selected Day</span>
              <h2 className="text-2xl md:text-4xl font-bold font-fraunces text-primary mt-1">
                {activeDay.title}
              </h2>
            </div>
            <div className="px-4 py-2 bg-light-bg border border-accent/20 rounded-md text-sm font-bold text-primary">
              {activeDay.date}
            </div>
          </div>

          {/* Timeline Rites */}
          <div className="relative border-l border-gray-200 ml-3 md:ml-6 space-y-8 pb-4">
            {activeDay.items.map((item, idx) => (
              <div key={idx} className="relative pl-8 group">
                
                {/* Timeline node */}
                <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full group-hover:bg-accent transition-colors duration-250 z-10" />

                {/* Content details */}
                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                  {/* Timing card */}
                  <div className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-accent-text w-24">
                    <FaClock className="text-xs shrink-0" />
                    <span>{item.time}</span>
                  </div>

                  {/* Ritual Info */}
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-primary font-fraunces group-hover:text-primary transition-colors">
                      {item.ritual}
                    </h3>
                    <p className="text-xs md:text-sm text-secondary leading-relaxed font-sans mt-1">
                      {item.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Schedule;


