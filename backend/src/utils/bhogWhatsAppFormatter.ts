import { getCutoffConfig, getCutoffConfigByTitle } from '../config/bhogCutoffConfig';

interface BhogWhatsAppCategory {
  title?: string;
  description?: string;
  quantity?: number;
}

interface BhogWhatsAppBooking {
  day: string;
  dayKey?: string;
  quantity?: number;
  categories?: BhogWhatsAppCategory[];
}

const BHOG_TIMING = '12:30 PM – 2:00 PM';

const BHOG_TIMINGS: Record<string, string> = {
  saptami: '12:30 PM – 2:00 PM',
  ashtami: '12:30 PM – 2:00 PM',
  sandhiPuja: '12:30 PM – 2:00 PM',
  navami: '12:30 PM – 2:00 PM',
  lokhiPuja: '12:30 PM – 1:00 PM',
};

const formatBhogDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  });

  return `${day} ${monthName} ${year}`;
};

// Map day keys to their bhog dates (independent of cutoff config)
const BHOG_DATES: Record<string, string> = {
  saptami: '2026-10-17',
  ashtami: '2026-10-18',
  sandhiPuja: '2026-10-19',
  navami: '2026-10-20',
  lokhiPuja: '2026-10-25',
};

export const formatBhogBookingDetails = (bookings: BhogWhatsAppBooking[]): string => {
  if (!bookings.length) {
    throw new Error('No Bhog bookings available for WhatsApp confirmation');
  }

  return bookings.map((booking) => {
    // Try to get date from cutoff config first, fallback to BHOG_DATES
    const dayConfig = (booking.dayKey && getCutoffConfig(booking.dayKey))
      || getCutoffConfigByTitle(booking.day);
    const bhogDate = dayConfig?.bhogDate || BHOG_DATES[booking.dayKey || ''] || '2026-10-17';

    const selectedCategories = (booking.categories || []).filter(
      (category) => Number(category.quantity) > 0,
    );
    const numberOfBhog = selectedCategories.length > 0
      ? selectedCategories.reduce((total, category) => total + Number(category.quantity || 0), 0)
      : Number(booking.quantity) || 0;
    const types = Array.from(new Set(selectedCategories
      .map((category) => category.title?.trim() || category.description?.trim())
      .filter((title): title is string => Boolean(title))));
    const day = booking.day.replace(/\s+Bhog$/i, '').trim();

    // Get specific timing for the puja day
    const bhogTiming = BHOG_TIMINGS[booking.dayKey || ''] || BHOG_TIMING;

    return [
      `**Day:** ${day}`,
      `**Date:** ${formatBhogDate(bhogDate)}`,
      `**Number of Bhog:** ${numberOfBhog}`,
      `**Type:** ${types.join(', ') || 'Bhog'}`,
      `**Bhog Timing:** ${bhogTiming}`,
    ].join('\n');
  }).join('\n\n');
};