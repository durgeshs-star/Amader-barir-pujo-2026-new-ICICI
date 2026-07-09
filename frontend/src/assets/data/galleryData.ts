export interface GalleryImage {
  id: number;
  year: '2024' | '2025';
  src: string;
  alt: string;
  category?: 'pujo' | 'cultural' | 'bhog' | 'volunteer';
}

export const galleryImages: GalleryImage[] = [
  // Row 1
  { id: 1, year: '2024', src: '/assets/img/puja/1.webp', alt: 'Puja celebration 1', category: 'pujo' },
  { id: 2, year: '2025', src: '/assets/img/puja/2.webp', alt: 'Puja celebration 2', category: 'pujo' },
  { id: 3, year: '2024', src: '/assets/img/puja/3.webp', alt: 'Puja celebration 3', category: 'pujo' },
  { id: 4, year: '2024', src: '/assets/img/puja/12.webp', alt: 'Puja celebration 12', category: 'pujo' },
  { id: 5, year: '2025', src: '/assets/img/puja/5.webp', alt: 'Puja celebration 5', category: 'pujo' },
  { id: 6, year: '2025', src: '/assets/img/puja/6.webp', alt: 'Puja celebration 6', category: 'pujo' },
  
  // Row 2
  { id: 7, year: '2024', src: '/assets/img/puja/7.webp', alt: 'Puja celebration 7', category: 'pujo' },
  { id: 8, year: '2025', src: '/assets/img/puja/8.webp', alt: 'Puja celebration 8', category: 'pujo' },
  { id: 9, year: '2024', src: '/assets/img/puja/9.webp', alt: 'Puja celebration 9', category: 'pujo' },
  { id: 10, year: '2024', src: '/assets/img/puja/10.webp', alt: 'Puja celebration 10', category: 'pujo' },
  { id: 11, year: '2025', src: '/assets/img/puja/11.webp', alt: 'Puja celebration 11', category: 'pujo' },
  { id: 12, year: '2025', src: '/assets/img/puja/14.webp', alt: 'Puja celebration 14', category: 'pujo' },
  
  // Row 3
  { id: 13, year: '2024', src: '/assets/img/puja/16.webp', alt: 'Puja celebration 16', category: 'pujo' },
  { id: 14, year: '2025', src: '/assets/img/puja/17.jpg', alt: 'Puja celebration 17', category: 'pujo' },
  { id: 15, year: '2024', src: '/assets/img/puja/18.jpg', alt: 'Puja celebration 18', category: 'pujo' },
  { id: 16, year: '2024', src: '/assets/img/puja/19.webp', alt: 'Puja celebration 19', category: 'pujo' },
  { id: 17, year: '2025', src: '/assets/img/puja/20.webp', alt: 'Puja celebration 20', category: 'pujo' },
  { id: 18, year: '2025', src: '/assets/img/puja/21.webp', alt: 'Puja celebration 21', category: 'pujo' },
  
  // Row 4
  { id: 19, year: '2024', src: '/assets/img/puja/22.webp', alt: 'Puja celebration 22', category: 'pujo' },
  { id: 20, year: '2025', src: '/assets/img/puja/27.jpg', alt: 'Puja celebration 27', category: 'pujo' },
  { id: 21, year: '2024', src: '/assets/img/puja/23.webp', alt: 'Puja celebration 23', category: 'pujo' },
  { id: 22, year: '2024', src: '/assets/img/puja/28.jpg', alt: 'Puja celebration 28', category: 'pujo' },
  { id: 23, year: '2025', src: '/assets/img/puja/26.webp', alt: 'Puja celebration 26', category: 'pujo' },
  { id: 24, year: '2025', src: '/assets/img/puja/24.webp', alt: 'Puja celebration 24', category: 'pujo' },
  
  // Row 5
  { id: 25, year: '2024', src: '/assets/img/puja/34.jpg', alt: 'Puja celebration 34', category: 'pujo' },
  { id: 26, year: '2025', src: '/assets/img/puja/36.jpg', alt: 'Puja celebration 36', category: 'pujo' },
  { id: 27, year: '2024', src: '/assets/img/puja/37.webp', alt: 'Puja celebration 37', category: 'pujo' },
  { id: 28, year: '2024', src: '/assets/img/puja/38.webp', alt: 'Puja celebration 38', category: 'pujo' },
  { id: 29, year: '2025', src: '/assets/img/puja/33.jpg', alt: 'Puja celebration 33', category: 'pujo' },
  { id: 30, year: '2025', src: '/assets/img/puja/35.webp', alt: 'Puja celebration 35', category: 'pujo' },

  // Cultural Offerings
  { id: 31, year: '2025', src: '/assets/img/cultural-assets/DSC_1913.webp', alt: 'Cultural performance', category: 'cultural' },
  { id: 32, year: '2025', src: '/assets/img/cultural-assets/DSC_1964.webp', alt: 'Cultural celebration', category: 'cultural' },
  { id: 33, year: '2025', src: '/assets/img/cultural-assets/DSC_2059.webp', alt: 'Dance performance', category: 'cultural' },
  { id: 34, year: '2025', src: '/assets/img/cultural-assets/DSC_2351.webp', alt: 'Stage performance', category: 'cultural' },
  { id: 35, year: '2025', src: '/assets/img/cultural-assets/DSC_2585.webp', alt: 'Musical evening', category: 'cultural' },
  { id: 36, year: '2025', src: '/assets/img/cultural-assets/DSC_2604.webp', alt: 'Cultural program', category: 'cultural' },
  { id: 37, year: '2025', src: '/assets/img/cultural-assets/DSC_2755.webp', alt: 'Evening performance', category: 'cultural' },
  { id: 38, year: '2025', src: '/assets/img/cultural-assets/SJP_3036.webp', alt: 'Community celebration', category: 'cultural' },
  { id: 39, year: '2025', src: '/assets/img/cultural-assets/SJP_3049.webp', alt: 'Festive moments', category: 'cultural' },
  { id: 40, year: '2025', src: '/assets/img/cultural-assets/SJP_3061.webp', alt: 'Cultural evening', category: 'cultural' },
];
