/**
 * Anudan Configuration
 * 
 * Defines campaign IDs, amount targets, and SSE heartbeat interval for Anudan campaigns.
 * Assumption: Single campaign per day (e.g., "Panchami", "Shashti", etc.).
 */

export const ANUDAN_CONFIG = {
  // Campaign ID for the current Anudan drive (can be extended for multiple concurrent campaigns)
  DEFAULT_CAMPAIGN_ID: 'default',
  
  // Total cost targets for each Anudan category (same as frontend data)
  TOTAL_COSTS: {
    'Panchami': 6000,
    'Sasthi': 35000,
    'Saptami': 43000,
    'Ashtami': 47000,
    'Sondhi Pujo': 24500,
    'Navami': 50500,
    'Dasami': 18500,
    '5 Days': 134000
  },
  
  // SSE heartbeat interval in milliseconds (25 seconds to keep connections alive through proxies)
  SSE_HEARTBEAT_INTERVAL_MS: 25000,
  
  // Rate limiting for remaining amount endpoint
  REMAINING_RATE_LIMIT_WINDOW_MS: 60000,
  REMAINING_RATE_LIMIT_MAX_REQUESTS: 60,
  
  // Rate limiting for SSE endpoint
  EVENTS_RATE_LIMIT_WINDOW_MS: 60000,
  EVENTS_RATE_LIMIT_MAX_REQUESTS: 10,
};
