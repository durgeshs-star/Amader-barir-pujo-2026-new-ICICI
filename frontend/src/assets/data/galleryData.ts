export interface GalleryImage {
  id: number;
  year: '2024' | '2025' | '2026';
  src: string;
  alt: string;
  category?: 'pujo' | 'cultural' | 'bhog' | 'volunteer';
  isFeaturedIdol?: boolean;
  isPinnedToTop?: boolean;
}

const featuredIdolImageFilenames = new Set([
  'SJP_3870.webp',
  'SJP_5325.webp',
]);

const gallery2026Images: GalleryImage[] = [
  'SJP_0132.webp',
  'SJP_0240.webp',
  'SJP_0347.webp',
  'SJP_0381.webp',
  'SJP_0537.webp',
  'SJP_2808.webp',
  'SJP_2826.webp',
  'SJP_2827.webp',
  'SJP_3022.webp',
  'SJP_3672.webp',
  'SJP_3676.webp',
  'SJP_3870 (1).webp',
  'SJP_3870.webp',
  'SJP_3943.webp',
  'SJP_3957.webp',
  'SJP_3961.webp',
  'SJP_4013.webp',
  'SJP_4041.webp',
  'SJP_4142.webp',
  'SJP_4388.webp',
  'SJP_4509.webp',
  'SJP_5312.webp',
  'SJP_5317.webp',
  'SJP_5319.webp',
  'SJP_5325.webp',
  'SJP_5343.webp',
  'SJP_5344.webp',
  'SJP_5345.webp',
  'SJP_5437.webp',
  'SJP_5476.webp',
  'SJP_5502.webp',
  'SJP_6835.webp',
  'SJP_6853.webp',
  'SJP_6903.webp',
  'SJP_6912.webp',
  'SJP_6979.webp',
  'SJP_8487.webp',
  'SJP_8510.webp',
  'SJP_8612.webp',
  'SJP_8791.webp',
  'SJP_8815.webp',
  'SJP_9051.webp',
].map((filename, index) => ({
  id: 100 + index,
  year: '2026',
  src: `/assets/img26/img26/${filename}`,
  alt: `Durga Puja 2026 celebration ${index + 1}`,
  category: 'pujo',
  isFeaturedIdol: featuredIdolImageFilenames.has(filename),
}));

const additionalAboutUsImages: GalleryImage[] = [
  'SJP_3943.webp',
  'SJP_3957.webp',
  'SJP_3961.webp',
  'SJP_4041.webp',
  'SJP_4142.webp',
  'SJP_4388.webp',
  'SJP_4509.webp',
].map((filename, index) => ({
  id: 137 + index,
  year: '2026',
  src: `/assets/img26/aboutus/${filename}`,
  alt: `Durga Puja 2026 community moment ${index + 1}`,
  category: 'pujo',
}));

const cultural2026Images: GalleryImage[] = [
  'SJP_3470.webp',
  'SJP_4410.webp',
  'SJP_4453.webp',
  'SJP_4465.webp',
  'SJP_4523.webp',
  'SJP_4534.webp',
  'SJP_4579.webp',
  'SJP_4600.webp',
  'SJP_4677.webp',
  'SJP_4738.webp',
  'SJP_4767.webp',
  'SJP_4833.webp',
  'SJP_4874.webp',
  'SJP_6423.webp',
  'SJP_6747.webp',
  'SJP_7561.webp',
  'SJP_7659.webp',
  'SJP_7799.webp',
  'SJP_8037.webp',
  'SJP_8149.webp',
  'SJP_8194.webp',
  'TAN_8252.webp',
  'SJP_9199.webp',
  'SJP_9262.webp',
].map((filename, index) => ({
  id: 200 + index,
  year: '2026',
  src: `/assets/img26/culture26/${filename}`,
  alt: `Cultural performance at Durga Puja 2026 ${index + 1}`,
  category: 'cultural',
  isPinnedToTop: true,
}));

const bhog2026Images: GalleryImage[] = [
  'SJP_3943 (1).webp',
  'SJP_4100.webp',
  'SJP_4115.webp',
  'SJP_4127 (1).webp',
  'SJP_4127.webp',
  'SJP_4132.webp',
  'SJP_4135.webp',
  'SJP_4137.webp',
  'SJP_4142 (1).webp',
  'SJP_4146.webp',
  'SJP_4148.webp',
  'SJP_5567.webp',
  'SJP_5577.webp',
].map((filename, index) => ({
  id: 300 + index,
  year: '2026',
  src: `/assets/img26/bhog/${filename}`,
  alt: `Bhog offering and distribution at Durga Puja 2026 ${index + 1}`,
  category: 'bhog',
}));

const volunteer2026Images: GalleryImage[] = [
  'SJP_5304.webp',
  'SJP_9745.webp',
].map((filename, index) => ({
  id: 400 + index,
  year: '2026',
  src: `/assets/img26/volunteer/${filename}`,
  alt: `Volunteer activity at Durga Puja 2026 ${index + 1}`,
  category: 'volunteer',
}));

export const galleryImages: GalleryImage[] = [
  // Row 1
  { id: 2, year: '2025', src: '/assets/img/puja/2.webp', alt: 'Puja celebration 2', category: 'pujo' },
  { id: 5, year: '2025', src: '/assets/img/puja/5.webp', alt: 'Puja celebration 5', category: 'pujo' },
  { id: 6, year: '2025', src: '/assets/img/puja/6.webp', alt: 'Puja celebration 6', category: 'pujo' },
  
  // Row 2
  { id: 8, year: '2025', src: '/assets/img/puja/8.webp', alt: 'Puja celebration 8', category: 'pujo' },
  { id: 11, year: '2025', src: '/assets/img/puja/11.webp', alt: 'Puja celebration 11', category: 'pujo' },
  { id: 12, year: '2025', src: '/assets/img/puja/14.webp', alt: 'Puja celebration 14', category: 'pujo' },
  
  // Row 3
  { id: 14, year: '2025', src: '/assets/img/puja/17.jpg', alt: 'Puja celebration 17', category: 'pujo' },
  { id: 15, year: '2024', src: '/assets/img/puja/18.jpg', alt: 'Puja celebration 18', category: 'pujo' },
  { id: 17, year: '2025', src: '/assets/img/puja/20.webp', alt: 'Puja celebration 20', category: 'pujo' },
  { id: 18, year: '2025', src: '/assets/img/puja/21.webp', alt: 'Puja celebration 21', category: 'pujo' },
  
  // Row 4
  { id: 20, year: '2025', src: '/assets/img/puja/27.jpg', alt: 'Puja celebration 27', category: 'pujo' },
  { id: 22, year: '2024', src: '/assets/img/puja/28.jpg', alt: 'Puja celebration 28', category: 'pujo' },
  { id: 23, year: '2025', src: '/assets/img/puja/26.webp', alt: 'Puja celebration 26', category: 'pujo' },
  { id: 24, year: '2025', src: '/assets/img/puja/24.webp', alt: 'Puja celebration 24', category: 'pujo' },
  
  // Row 5
  { id: 25, year: '2024', src: '/assets/img/puja/34.jpg', alt: 'Puja celebration 34', category: 'pujo' },
  { id: 26, year: '2025', src: '/assets/img/puja/36.jpg', alt: 'Puja celebration 36', category: 'pujo' },
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

  // Bhog Offerings
  { id: 41, year: '2025', src: '/assets/img/bhog-assets/SJP_4320.webp', alt: 'Bhog distribution', category: 'bhog' },
  { id: 42, year: '2025', src: '/assets/img/bhog-assets/SJP_4321.webp', alt: 'Bhog preparation', category: 'bhog' },
  { id: 43, year: '2025', src: '/assets/img/bhog-assets/0d64acaa-fe73-4e97-bb2e-779c11a0022e.webp', alt: 'Bhog serving', category: 'bhog' },

  // Volunteer Activities
  { id: 44, year: '2025', src: '/assets/img/volunteer-assets/DSC_1210.webp', alt: 'Volunteer teamwork', category: 'volunteer' },
  { id: 45, year: '2025', src: '/assets/img/volunteer-assets/SJP_4236.webp', alt: 'Volunteer service', category: 'volunteer' },
  { id: 46, year: '2025', src: '/assets/img/volunteer-assets/SJP_4319.webp', alt: 'Community volunteers', category: 'volunteer' },

  // 2024 Pujo Images
  { id: 47, year: '2024', src: '/assets/img/2024/SJP_5373.jpg', alt: 'Pujo celebration 2024 - 1', category: 'pujo' },
  { id: 48, year: '2024', src: '/assets/img/2024/SJP_5416.jpg', alt: 'Pujo celebration 2024 - 2', category: 'pujo' },
  { id: 49, year: '2024', src: '/assets/img/2024/SJP_5422.jpg', alt: 'Pujo celebration 2024 - 3', category: 'pujo' },
  { id: 51, year: '2024', src: '/assets/img/2024/SJP_5476.jpg', alt: 'Pujo celebration 2024 - 5', category: 'pujo' },
  { id: 52, year: '2024', src: '/assets/img/2024/SJP_5478.jpg', alt: 'Pujo celebration 2024 - 6', category: 'pujo' },
  { id: 53, year: '2024', src: '/assets/img/2024/SJP_5603_0076.jpg', alt: 'Pujo celebration 2024 - 7', category: 'pujo' },
  { id: 54, year: '2024', src: '/assets/img/2024/SJP_5603_0077.jpg', alt: 'Pujo celebration 2024 - 8', category: 'pujo' },
  { id: 55, year: '2024', src: '/assets/img/2024/SJP_5603_0108.jpg', alt: 'Pujo celebration 2024 - 9', category: 'pujo' },
  { id: 56, year: '2024', src: '/assets/img/2024/SJP_6004.jpg', alt: 'Pujo celebration 2024 - 10', category: 'pujo' },
  { id: 57, year: '2024', src: '/assets/img/2024/SJP_6371.jpg', alt: 'Pujo celebration 2024 - 11', category: 'pujo' },
  { id: 58, year: '2024', src: '/assets/img/2024/SJP_6374.jpg', alt: 'Pujo celebration 2024 - 12', category: 'pujo' },
  { id: 59, year: '2024', src: '/assets/img/2024/SJP_6401.jpg', alt: 'Pujo celebration 2024 - 13', category: 'pujo' },
  { id: 60, year: '2024', src: '/assets/img/2024/SJP_6667.jpg', alt: 'Pujo celebration 2024 - 14', category: 'pujo' },
  { id: 61, year: '2024', src: '/assets/img/2024/SJP_6782.jpg', alt: 'Pujo celebration 2024 - 15', category: 'pujo' },
  { id: 62, year: '2024', src: '/assets/img/2024/SJP_6795.jpg', alt: 'Pujo celebration 2024 - 16', category: 'pujo' },
  { id: 63, year: '2024', src: '/assets/img/2024/SJP_6824.jpg', alt: 'Pujo celebration 2024 - 17', category: 'pujo' },
  { id: 64, year: '2024', src: '/assets/img/2024/SJP_6946.jpg', alt: 'Pujo celebration 2024 - 18', category: 'pujo' },
  { id: 65, year: '2024', src: '/assets/img/2024/SJP_6956.jpg', alt: 'Pujo celebration 2024 - 19', category: 'pujo' },
  { id: 66, year: '2024', src: '/assets/img/2024/SJP_7790.jpg', alt: 'Pujo celebration 2024 - 20', category: 'pujo' },
  { id: 67, year: '2024', src: '/assets/img/2024/SJP_7816.jpg', alt: 'Pujo celebration 2024 - 21', category: 'pujo' },
  { id: 68, year: '2024', src: '/assets/img/2024/SJP_7820.jpg', alt: 'Pujo celebration 2024 - 22', category: 'pujo' },
  { id: 69, year: '2024', src: '/assets/img/2024/SJP_7882.jpg', alt: 'Pujo celebration 2024 - 23', category: 'pujo' },
  { id: 70, year: '2024', src: '/assets/img/2024/SJP_7908.jpg', alt: 'Pujo celebration 2024 - 24', category: 'pujo' },
  { id: 71, year: '2024', src: '/assets/img/2024/SJP_8030.jpg', alt: 'Pujo celebration 2024 - 25', category: 'pujo' },
  { id: 72, year: '2024', src: '/assets/img/2024/SJP_8241.jpg', alt: 'Pujo celebration 2024 - 26', category: 'pujo' },
  { id: 73, year: '2024', src: '/assets/img/2024/SJP_8880.jpg', alt: 'Pujo celebration 2024 - 27', category: 'pujo' },
  { id: 74, year: '2024', src: '/assets/img/2024/SJP_8897.jpg', alt: 'Pujo celebration 2024 - 28', category: 'pujo' },
  { id: 75, year: '2024', src: '/assets/img/2024/SJP_8902.jpg', alt: 'Pujo celebration 2024 - 29', category: 'pujo' },
  { id: 76, year: '2024', src: '/assets/img/2024/SJP_8906.jpg', alt: 'Pujo celebration 2024 - 30', category: 'pujo' },
  ...gallery2026Images,
  ...additionalAboutUsImages,
  ...cultural2026Images,
  ...bhog2026Images,
  ...volunteer2026Images,
];
