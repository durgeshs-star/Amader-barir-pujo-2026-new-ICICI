export interface BhogCounterProps {
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  ariaLabel?: string;
}

export interface BhogBookingCategory {
  id: string;
  title: string;
  description: string;
  price: number;
  max: number;
}

export interface BhogBookingState {
  [categoryId: string]: number;
}

export interface BhogBookingSectionProps {
  title: string;
  subtitle: string;
  description: string;
  categories: BhogBookingCategory[];
  paymentUrl: string;
  disclaimer?: string;
}
