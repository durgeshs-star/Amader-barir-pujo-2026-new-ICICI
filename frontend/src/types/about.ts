export interface CarouselImage {
  src: string;
  alt: string;
}

export interface ImageCarouselProps {
   image: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  height?: string;
}