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

const formatBhogDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  });

  return `${day} ${monthName} ${year}`;
};

export const formatBhogBookingDetails = (bookings: BhogWhatsAppBooking[]): string => {
  if (!bookings.length) {
    throw new Error('No Bhog bookings available for WhatsApp confirmation');
  }

  return bookings.map((booking) => {
    const dayConfig = (booking.dayKey && getCutoffConfig(booking.dayKey))
      || getCutoffConfigByTitle(booking.day);

    if (!dayConfig) {
      throw new Error(`No configured Bhog date found for ${booking.day}`);
    }

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

    return [
      `**Day:** ${day}`,
      `**Date:** ${formatBhogDate(dayConfig.bhogDate)}`,
      `**Number of Bhog:** ${numberOfBhog}`,
      `**Type:** ${types.join(', ') || 'Bhog'}`,
      `**Bhog Timing:** ${BHOG_TIMING}`,
    ].join('\n');
  }).join('\n\n');
};