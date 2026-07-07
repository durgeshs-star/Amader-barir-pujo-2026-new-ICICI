export interface FleaMarketCarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  slidesPerView?: number;
  altPrefix?: string;
}

export interface FleaMarketCardProps {
  image: string;
  alt: string;
  index?: number;
}

export interface ScheduleIntroProps {
  paragraph: string;
}

export interface ScheduleSubSection {
  title: string;
  lines: string[];
}

export interface ScheduleBlock {
  subtitle: string;
  title?: string;
  lines?: string[];
  sections?: ScheduleSubSection[];
}

export interface ScheduleDetailsProps {
  image: string;
  imageAlt: string;
  subtitle?: string;
  title?: string;
  timing?: string;
  date?: string;
  blocks?: ScheduleBlock[];
}

export interface ScheduleHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  overlay?: string;
  height?: string;
}
