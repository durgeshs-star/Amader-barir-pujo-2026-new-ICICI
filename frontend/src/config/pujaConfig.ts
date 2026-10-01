/**
 * Centralized configuration for Puja booking cutoffs and categories
 * All timestamps are in IST (Asia/Kolkata timezone)
 */

export interface PujaBookingCutoff {
  pujaName: string;
  pujaDate: string;
  cutoffISO: string; // ISO 8601 format with IST offset
}

export const PUJA_BOOKING_CUTOFFS: Record<string, PujaBookingCutoff> = {
  saptami: {
    pujaName: "Maha Saptami",
    pujaDate: "Sat, 17 Oct 2026",
    cutoffISO: "2026-10-16T12:00:00+05:30",
  },
  ashtami: {
    pujaName: "Maha Ashtami",
    pujaDate: "Sun, 18 Oct 2026",
    cutoffISO: "2026-10-17T12:00:00+05:30",
  },
  sandhiPuja: {
    pujaName: "Sandhi Puja",
    pujaDate: "Mon, 19 Oct 2026",
    cutoffISO: "2026-10-18T12:00:00+05:30",
  },
  navami: {
    pujaName: "Maha Navami",
    pujaDate: "Tue, 20 Oct 2026",
    cutoffISO: "2026-10-19T12:00:00+05:30",
  },
  // lakshmiPuja: {
  //   pujaName: "Lakshmi Puja",
  //   pujaDate: "Sun, 25 Oct 2026",
  //   cutoffISO: "2026-10-24T12:00:00+05:30",
  // },
  // saraswatiPuja: {
  //   pujaName: "Saraswati Puja",
  //   pujaDate: "Thu, 11 Feb 2027",
  //   cutoffISO: "2027-02-10T12:00:00+05:30",
  // },
};

/**
 * Standard Bhog booking categories (Saptami, Ashtami, Sandhi Puja, etc.)
 */
export const BHOG_BOOKING_CATEGORIES = [
  {
    id: "bhog-booking",
    title: "Pandal Bhog",
    description: "per person",
    price: 315,
    max: 5,
  },
  {
    id: "bhog-booking-senior",
    title: "Senior Citizen (age above 60)",
    description: "per person",
    price: 100,
    max: 10,
  },
  {
    id: "packed-bhog",
    title: "Packed Bhog",
    description: "per person",
    price: 335,
    max: 10,
  },
  {
    id: "children-0-5",
    title: "Children aged 0 to 5",
    description: "",
    price: 0,
    max: 2,
  },
];

/**
 * Navami Bhog booking categories
 * Pandal Bhog: ₹350, Packed Bhog: ₹375
 */
export const NAVAMI_BHOG_BOOKING_CATEGORIES = [
  {
    id: "bhog-booking",
    title: "Pandal Bhog",
    description: "per person",
    price: 350,
    max: 5,
  },
  {
    id: "bhog-booking-senior",
    title: "Senior Citizen (age above 60)",
    description: "per person",
    price: 100,
    max: 10,
  },
  {
    id: "packed-bhog",
    title: "Packed Bhog",
    description: "per person",
    price: 375,
    max: 10,
  },
  {
    id: "children-0-5",
    title: "Children aged 0 to 5",
    description: "",
    price: 0,
    max: 2,
  },
];

/**
 * Get Bhog booking categories for a specific puja key
 */
export const getBhogBookingCategories = (pujaKey?: string) => {
  if (pujaKey && pujaKey.toLowerCase() === "navami") {
    return NAVAMI_BHOG_BOOKING_CATEGORIES;
  }
  return BHOG_BOOKING_CATEGORIES;
};

export interface UnifiedBhogDay {
  key: string;
  title: string;
  shortName: string;
  subtitle: string;
  description: string;
  date: string;
  cutoffISO: string;
  categories: typeof BHOG_BOOKING_CATEGORIES;
}

export const UNIFIED_BHOG_DAYS: UnifiedBhogDay[] = [
  {
    key: 'saptami',
    title: 'Saptami Bhog',
    shortName: 'Saptami',
    subtitle: 'Bhog Booking',
    description: 'Select the number of bhog.',
    date: 'Sat, 17 Oct 2026',
    cutoffISO: '2026-10-16T12:00:00+05:30',
    categories: BHOG_BOOKING_CATEGORIES,
  },
  {
    key: 'ashtami',
    title: 'Ashtami Bhog',
    shortName: 'Ashtami',
    subtitle: 'Bhog Booking',
    description: 'Select the number of bhog.',
    date: 'Sun, 18 Oct 2026',
    cutoffISO: '2026-10-17T12:00:00+05:30',
    categories: BHOG_BOOKING_CATEGORIES,
  },
  {
    key: 'sandhiPuja',
    title: 'Ashtami Sandhi Pujo Bhog',
    shortName: 'Ashtami Sandhi Pujo',
    subtitle: 'Sacred Transition Bhog Booking',
    description: 'Select the number of bhog.',
    date: 'Mon, 19 Oct 2026',
    cutoffISO: '2026-10-18T12:00:00+05:30',
    categories: BHOG_BOOKING_CATEGORIES,
  },
  {
    key: 'navami',
    title: 'Navami Bhog',
    shortName: 'Navami',
    subtitle: 'Bhog Booking',
    description: 'Select the number of bhog.',
    date: 'Tue, 20 Oct 2026',
    cutoffISO: '2026-10-19T12:00:00+05:30',
    categories: NAVAMI_BHOG_BOOKING_CATEGORIES,
  },
];

