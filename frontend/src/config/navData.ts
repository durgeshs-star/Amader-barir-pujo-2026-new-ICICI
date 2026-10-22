export interface NavItem {
  name: string;
  path: string;
}

export const pujoScheduleDays: NavItem[] = [
  { name: 'Panchami', path: '/panchami' },
  { name: 'Soshti', path: '/shashti' },
  { name: 'Saptami', path: '/saptami' },
  { name: 'Ashtami', path: '/ashtami' },
  { name: 'Ashtami Sandhi Pujo', path: '/ashtami-sandhi-puja' },
  { name: 'Navami', path: '/navami' },
  { name: 'Dashami', path: '/dashami' },
  { name: 'Lokhi Pujo', path: '/lokhi-puja' },
];

export const bhogBookingDays: NavItem[] = [
  { name: 'Saptami', path: '/bhog-booking/saptami' },
  { name: 'Ashtami', path: '/bhog-booking/ashtami' },
  { name: 'Ashtami Sandhi Pujo', path: '/bhog-booking/ashtami-sandhi-puja' },
  { name: 'Navami', path: '/bhog-booking/navami' },
  { name: 'Lokhi Pujo', path: '/bhog-booking/lokhi-puja' },
  // Hidden for now - Saraswati Puja Bhog
  // { name: 'Saraswati Pujo', path: '/bhog-booking/saraswati-puja' },
];
