/**
 * Bhog Booking Cutoff Configuration
 * 
 * All cutoff times are in Asia/Kolkata (IST) timezone
 * Booking closes at 12:00 PM (noon) on the DAY BEFORE the Bhog date
 */

export interface BhogCutoffConfig {
  pujaKey: string;
  pujaName: string;
  bhogDate: string; // ISO format date in IST
  cutoffISO: string; // ISO format timestamp in IST
}

/**
 * Bhog booking cutoffs for 2026
 * Cutoff is always 12:00 PM IST on the day before the Bhog date
 */
export const BHOG_CUTOFF_CONFIGS: BhogCutoffConfig[] = [
  {
    pujaKey: 'saptami',
    pujaName: 'Maha Saptami',
    bhogDate: '2026-10-17',
    cutoffISO: '2026-10-16T12:00:00+05:30',
  },
  {
    pujaKey: 'ashtami',
    pujaName: 'Maha Ashtami',
    bhogDate: '2026-10-18',
    cutoffISO: '2026-10-17T12:00:00+05:30',
  },
  {
    pujaKey: 'sandhiPuja',
    pujaName: 'Sandhi Puja',
    bhogDate: '2026-10-19',
    cutoffISO: '2026-10-18T12:00:00+05:30',
  },
  {
    pujaKey: 'navami',
    pujaName: 'Maha Navami',
    bhogDate: '2026-10-20',
    cutoffISO: '2026-10-19T12:00:00+05:30',
  },
  // {
  //   pujaKey: 'lakshmiPuja',
  //   pujaName: 'Lakshmi Puja',
  //   bhogDate: '2026-10-25',
  //   cutoffISO: '2026-10-24T12:00:00+05:30',
  // },
  // {
  //   pujaKey: 'saraswatiPuja',
  //   pujaName: 'Saraswati Puja',
  //   bhogDate: '2027-02-11',
  //   cutoffISO: '2027-02-10T12:00:00+05:30',
  // },
];

/**
 * Get cutoff config by puja key
 */
export const getCutoffConfig = (pujaKey: string): BhogCutoffConfig | undefined => {
  return BHOG_CUTOFF_CONFIGS.find(config => config.pujaKey === pujaKey);
};

/**
 * Get cutoff config by title (matches against pujaName)
 */
export const getCutoffConfigByTitle = (title: string): BhogCutoffConfig | undefined => {
  const titleLower = title.toLowerCase();
  return BHOG_CUTOFF_CONFIGS.find(config => 
    titleLower.includes(config.pujaKey.toLowerCase()) ||
    titleLower.includes(config.pujaName.toLowerCase())
  );
};

/**
 * Check if booking is closed for a specific puja
 * Uses Asia/Kolkata timezone for all comparisons
 * 
 * @param pujaKey - The puja key (e.g., 'saptami', 'ashtami')
 * @returns true if booking is closed, false if still open
 */
export const isBhogBookingClosed = (pujaKey: string): boolean => {
  const config = getCutoffConfig(pujaKey);

  if (!config) {
    console.warn(`[BhogCutoff] No cutoff config found for puja key: ${pujaKey}`);
    return false;
  }

  // cutoffISO already contains IST offset, so direct comparison is timezone-independent
  const now = new Date();
  const cutoffDate = new Date(config.cutoffISO);

  const isClosed = now >= cutoffDate;

  if (isClosed) {
    console.log(`[BhogCutoff] Booking closed for ${config.pujaName}. Cutoff: ${config.cutoffISO}, Current: ${now.toISOString()}`);
  }

  return isClosed;
};

/**
 * Check if booking is closed by title
 * Uses Asia/Kolkata timezone for all comparisons
 *
 * @param title - The puja title (e.g., 'Saptami Bhog', 'Maha Ashtami')
 * @returns true if booking is closed, false if still open
 */
export const isBhogBookingClosedByTitle = (title: string): boolean => {
  const config = getCutoffConfigByTitle(title);

  if (!config) {
    console.warn(`[BhogCutoff] No cutoff config found for title: ${title}`);
    return false;
  }

  // cutoffISO already contains IST offset, so direct comparison is timezone-independent
  const now = new Date();
  const cutoffDate = new Date(config.cutoffISO);

  const isClosed = now >= cutoffDate;

  if (isClosed) {
    console.log(`[BhogCutoff] Booking closed for ${config.pujaName} (title: ${title}). Cutoff: ${config.cutoffISO}`);
  }

  return isClosed;
};

/**
 * Get cutoff timestamp for a specific puja
 * 
 * @param pujaKey - The puja key
 * @returns ISO string of the cutoff timestamp
 */
export const getCutoffTimestamp = (pujaKey: string): string | null => {
  const config = getCutoffConfig(pujaKey);
  return config?.cutoffISO || null;
};

/**
 * Get cutoff timestamp by title
 * 
 * @param title - The puja title
 * @returns ISO string of the cutoff timestamp
 */
export const getCutoffTimestampByTitle = (title: string): string | null => {
  const config = getCutoffConfigByTitle(title);
  return config?.cutoffISO || null;
};

/**
 * Get formatted cutoff message for error responses
 * 
 * @param pujaKey - The puja key
 * @returns Human-readable error message
 */
export const getCutoffErrorMessage = (pujaKey: string): string => {
  const config = getCutoffConfig(pujaKey);
  
  if (!config) {
    return 'Bhog booking is closed.';
  }

  const cutoffDate = new Date(config.cutoffISO);
  const formattedDate = cutoffDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  return `Bhog booking for ${config.pujaName} closed on ${formattedDate} IST.`;
};

/**
 * Get formatted cutoff message by title
 * 
 * @param title - The puja title
 * @returns Human-readable error message
 */
export const getCutoffErrorMessageByTitle = (title: string): string => {
  const config = getCutoffConfigByTitle(title);
  
  if (!config) {
    return 'Bhog booking is closed.';
  }

  const cutoffDate = new Date(config.cutoffISO);
  const formattedDate = cutoffDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  return `Bhog booking for ${config.pujaName} closed on ${formattedDate} IST.`;
};
