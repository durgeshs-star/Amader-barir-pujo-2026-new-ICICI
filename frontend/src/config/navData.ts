export interface NavItem {
  name: string;
  path: string;
}

export const pujoScheduleDays: NavItem[] = [
  { name: 'Panchami', path: '/panchami' },
  { name: 'Shashti', path: '/shashti' },
  { name: 'Saptami', path: '/saptami' },
  { name: 'Ashtami', path: '/ashtami' },
  { name: 'Ashtami Sandhi Puja', path: '/ashtami-sandhi-puja' },
  { name: 'Navami', path: '/navami' },
  { name: 'Dashami', path: '/dashami' },
  { name: 'Saraswati Puja', path: '/saraswati-puja' },
];

export const bhogBookingDays: NavItem[] = [
  { name: 'Saptami', path: '/bhog-booking/saptami' },
  { name: 'Ashtami', path: '/bhog-booking/ashtami' },
  { name: 'Ashtami Sandhi Puja', path: '/bhog-booking/ashtami-sandhi-puja' },
  { name: 'Navami', path: '/bhog-booking/navami' },
  { name: 'Lakshmi Puja', path: '/bhog-booking/lakshmi-puja' },
  { name: 'Saraswati Puja', path: '/bhog-booking/saraswati-puja' },
];
