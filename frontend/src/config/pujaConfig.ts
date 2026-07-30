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
    cutoffISO: "2026-10-16T17:30:00+05:30",
  },
  ashtami: {
    pujaName: "Maha Ashtami",
    pujaDate: "Mon, 19 Oct 2026",
    cutoffISO: "2026-10-18T17:30:00+05:30",
  },
  sandhiPuja: {
    pujaName: "Sandhi Puja",
    pujaDate: "Mon, 19 Oct 2026",
    cutoffISO: "2026-10-18T17:30:00+05:30",
  },
  navami: {
    pujaName: "Maha Navami",
    pujaDate: "Mon, 19 Oct 2026",
    cutoffISO: "2026-10-18T17:30:00+05:30",
  },
  lakshmiPuja: {
    pujaName: "Lakshmi Puja",
    pujaDate: "Sun, 25 Oct 2026",
    cutoffISO: "2026-10-24T17:30:00+05:30",
  },
  saraswatiPuja: {
    pujaName: "Saraswati Puja",
    pujaDate: "Thu, 11 Feb 2027",
    cutoffISO: "2027-02-10T17:30:00+05:30",
  },
};

/**
 * Standard Bhog booking categories
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
