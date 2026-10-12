import React, { useState } from 'react';
import { CalendarDays, ChevronDown, Clock3 } from 'lucide-react';

interface ScheduleEvent {
  time: string;
  event: string;
}

interface ScheduleDay {
  id: string;
  day: string;
  date: string;
  events: ScheduleEvent[];
}

const scheduleData: ScheduleDay[] = [
  {
    id: 'soshthi',
    day: 'Soshthi',
    date: '16 October, Friday',
    events: [
      { time: '9:30 AM', event: 'Durga Soshthi Pujo' },
      { time: '10:30 AM', event: 'Pushpanjali' },
      { time: '7:00 PM', event: 'Shondha Kale Devibodhan, Amantran & Adhivaas' },
      { time: '7:30 PM', event: 'Cultural Program - Retro to Rhythm (A tribute to Asha Bhosale)' },
    ],
  },
  {
    id: 'saptami',
    day: 'Saptami',
    date: '17 October, Saturday',
    events: [
      { time: '7:30 AM', event: 'Mahasaptami Bihito Pujo, Nobopotrika Probesh Sthapan, KolpaArambho & Saptami Pujo' },
      { time: '10:30 AM', event: 'Pushpanjali' },
      { time: '7:00 PM', event: 'Shondha kale shitol bhog and Arati' },
      { time: '7:30 PM', event: 'Cultural Program - Navarasas: Indian Classical Dance By Ashwini, Shilpi & Group' },
    ],
  },
  {
    id: 'ashtami',
    day: 'Ashtami',
    date: '18 October, Sunday',
    events: [
      { time: '7:30 AM', event: 'Mahashtami Pujo, Ashtami KolpaArambho & Bihito Pujo' },
      { time: '10:30 AM', event: 'Pushpanjali & Maa er Bhog' },
      { time: '7:00 PM', event: 'Shondha kale shitol bhog and Arati' },
      { time: '7:30 PM', event: 'Cultural Program - Durga Within Us (Dance Drama)' },
    ],
  },
  {
    id: 'sandhi-pujo',
    day: 'Ashtami Sandhi Pujo',
    date: '19 October, Monday',
    events: [
      { time: '7:26 AM', event: 'Sandhi Pujo Starts' },
      { time: '7:50 AM', event: 'Balidaan' },
      { time: '8:14 AM', event: 'Sondhi Pujo Ends' },
      { time: '7:00 PM', event: 'Shondha Kale Shitol Bhog & Arati' },
      { time: '7:30 PM', event: 'Cultural Program - Odissi Dance by Prachiti Dange & Group' },
    ],
  },
  {
    id: 'navami',
    day: 'Navami',
    date: '20 October, Tuesday',
    events: [
      { time: '7:30 AM', event: 'MahaNavami Bihito Pujo' },
      { time: '10:30 AM', event: 'Pushpanjali' },
      { time: '11:30 AM', event: 'Havan' },
      { time: '7:00 PM', event: 'Shondha Kale Shitol Bhog & Arati' },
      { time: '7:30 PM', event: 'Cultural Program - Ujaan Band Performs Hindi & Bengali Songs' },
    ],
  },
  {
    id: 'dashami',
    day: 'Dashami',
    date: '21 October, Wednesday',
    events: [
      { time: '8:00 AM', event: 'Dashami Bihito Pujo' },
      { time: '10:00 AM', event: 'Aparajita Pujo' },
      { time: '11:30 AM', event: 'Sindoor Khela' },
      { time: '4:00 PM', event: 'Pratima Niranjan' },
    ],
  },
];

interface ScheduleCardProps {
  day: ScheduleDay;
  isExpanded: boolean;
  onToggle: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  day,
  isExpanded,
  onToggle,
}) => {
  const contentId = `${day.id}-content`;

  return (
    <article
      id={day.id}
      className={`group min-w-0 overflow-hidden rounded-2xl border bg-white shadow-[0_3px_12px_rgba(95,22,33,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D99A9F] hover:shadow-[0_9px_25px_rgba(95,22,33,0.08)] ${
        isExpanded
          ? 'border-primary shadow-[0_10px_28px_rgba(95,22,33,0.08)]'
          : 'border-[#E9D5D5]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[88px] w-full items-center gap-3.5 bg-white px-4 py-4 text-left transition-colors duration-200 hover:bg-[#FDF6F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:px-5"
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 sm:h-12 sm:w-12 ${
            isExpanded
              ? 'border-primary bg-primary text-white'
              : 'border-[#F1D0D2] bg-[#FFF0F0] text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-white'
          }`}
        >
          <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="break-words text-[15px] font-extrabold leading-snug text-primary sm:text-base md:text-lg">
            {day.date}
          </span>

          <span className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold tracking-[0.6px] text-[#6B4A58] sm:gap-2 sm:text-[11px]">
            <span>{day.day.toUpperCase()}</span>
            <span className="text-[#C9A34D]" aria-hidden="true">•</span>
            <span>
              {day.events.length}{' '}
              {day.events.length === 1 ? 'PROGRAMME' : 'PROGRAMMES'}
            </span>
          </span>
        </span>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF5DF] text-primary transition-transform duration-300 ${
            isExpanded ? 'rotate-180 bg-[#FFE8A4]' : ''
          }`}
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </span>
      </button>

      {isExpanded && (
        <div
          id={contentId}
          className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-[#E9D5D5] px-4 pb-1 pt-2 sm:px-5"
        >
          <div className="divide-y divide-[#F2E8E8]">
            {day.events.map((event, index) => (
              <div
                key={`${event.time}-${index}`}
                className="grid min-w-0 grid-cols-1 items-start gap-2 py-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4"
              >
                <span className="inline-flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#EFD66C] bg-[#FFE27A] px-3 py-2 text-xs font-extrabold leading-tight text-[#2A0A14]">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {event.time}
                </span>

                <span className="flex min-w-0 items-start gap-3 pt-0.5 sm:pt-1">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B38] ring-[3px] ring-[#FFF4D4]"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words text-sm font-medium leading-7 text-[#2A0A14] sm:text-[15px]">
                    {event.event}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

const ScheduleSection: React.FC = () => {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  const handleToggle = (dayId: string) => {
    setExpandedDayId((current) => (current === dayId ? null : dayId));
  };

  return (
    <section className="content-layer bg-[#FFFDFA] py-10 sm:py-12 lg:py-16">
      <div className="mx-auto w-[calc(100%-24px)] max-w-[1240px] sm:w-[calc(100%-40px)]">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[1.8px] text-primary sm:text-xs sm:tracking-[2px]">
            AMADER BARIR PUJO <span className="text-[#C9A34D]">✦</span> YEAR 3
          </p>

          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Pujo Schedule <span className="text-primary">2026</span>
          </h2>

          <div className="mt-6 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-12 bg-[#E8C56B]" />
            <span className="text-base text-[#C99B35]">✦</span>
            <span className="h-px w-12 bg-[#E8C56B]" />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
          {scheduleData.map((day) => (
            <ScheduleCard
              key={day.id}
              day={day}
              isExpanded={expandedDayId === day.id}
              onToggle={() => handleToggle(day.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;