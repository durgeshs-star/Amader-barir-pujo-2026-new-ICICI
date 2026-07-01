/**
 * optimize-images.mjs
 * One-time image optimization script using sharp.
 * Run: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function run() {
  console.log('🖼  Starting image optimization...\n');

  // ─────────────────────────────────────────────────────────
  // 1. Responsive Hero Image — 35.webp → 4 responsive sizes
  // ─────────────────────────────────────────────────────────
  const heroSrc = join(PUBLIC, 'assets/img/puja/35.webp');
  const heroDir = join(PUBLIC, 'assets/img/puja');
  const heroSizes = [
    { width: 480,  suffix: '480' },
    { width: 768,  suffix: '768' },
    { width: 1280, suffix: '1280' },
    { width: 1920, suffix: '1920' },
  ];

  for (const { width, suffix } of heroSizes) {
    const out = join(heroDir, `35-${suffix}.webp`);
    if (!existsSync(out)) {
      await sharp(heroSrc)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(out);
      console.log(`  ✓ Hero ${suffix}w  → ${out}`);
    } else {
      console.log(`  · Hero ${suffix}w  (already exists, skipping)`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. Responsive Logo — Logo-puja.webp → 3 sizes
  // ─────────────────────────────────────────────────────────
  const logoSrc = join(PUBLIC, 'assets/img/Logo-puja.webp');
  const logoDir = join(PUBLIC, 'assets/img');
  const logoSizes = [
    { size: 96,  suffix: '96' },
    { size: 160, suffix: '160' },
    { size: 256, suffix: '256' },
  ];

  for (const { size, suffix } of logoSizes) {
    const out = join(logoDir, `Logo-puja-${suffix}.webp`);
    if (!existsSync(out)) {
      await sharp(logoSrc)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 90, lossless: false })
        .toFile(out);
      console.log(`  ✓ Logo ${suffix}px  → ${out}`);
    } else {
      console.log(`  · Logo ${suffix}px  (already exists, skipping)`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. Icon PNGs → WebP (preserve transparency)
  // ─────────────────────────────────────────────────────────
  const iconDir = join(PUBLIC, 'assets/img/icons');
  const icons = ['woman', 'meal', 'lotus-1', 'lotus', 'lotus-flower', 'volunteer', 'group'];

  for (const name of icons) {
    const src = join(iconDir, `${name}.png`);
    if (!existsSync(src)) continue;
    const out = join(iconDir, `${name}.webp`);
    if (!existsSync(out)) {
      await sharp(src)
        .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 85, lossless: false })
        .toFile(out);
      console.log(`  ✓ Icon ${name}.webp`);
    } else {
      console.log(`  · Icon ${name}.webp (already exists, skipping)`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. Testimonial PNGs → WebP
  // ─────────────────────────────────────────────────────────
  const testimonialDir = join(PUBLIC, 'assets/img/testimonials');
  const testimonialPngs = ['boy', 'girl', 'user', 'user-2'];

  for (const name of testimonialPngs) {
    const src = join(testimonialDir, `${name}.png`);
    if (!existsSync(src)) continue;
    const out = join(testimonialDir, `${name}.webp`);
    if (!existsSync(out)) {
      await sharp(src)
        .resize(256, 256, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(out);
      console.log(`  ✓ Testimonial ${name}.webp`);
    } else {
      console.log(`  · Testimonial ${name}.webp (already exists, skipping)`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 5. Donation PNG → WebP
  // ─────────────────────────────────────────────────────────
  const donationDir = join(PUBLIC, 'assets/img/donation');
  const donationFiles = [
    { src: 'dashami.png',  width: 800 },
    { src: 'mahalaya.png', width: 800 },
  ];

  for (const { src: fname, width } of donationFiles) {
    const src = join(donationDir, fname);
    if (!existsSync(src)) continue;
    const outName = fname.replace('.png', '.webp');
    const out = join(donationDir, outName);
    if (!existsSync(out)) {
      await sharp(src)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(out);
      console.log(`  ✓ Donation ${outName}`);
    } else {
      console.log(`  · Donation ${outName} (already exists, skipping)`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 6. Convert large JPGs in /puja to WebP  (only missing ones)
  // ─────────────────────────────────────────────────────────
  const pujaJpgs = [
    { name: '13.JPG', width: 1280 },
    { name: '15.jpg', width: 1280 },
    { name: '17.jpg', width: 1280 },
    { name: '18.jpg', width: 1280 },
    { name: '25.jpg', width: 1280 },
    { name: '27.jpg', width: 1280 },
    { name: '28.jpg', width: 1280 },
    { name: '29.jpg', width: 1280 },
    { name: '30.jpg', width: 1280 },
    { name: '31.jpg', width: 1280 },
    { name: '32.jpg', width: 1280 },
    { name: '33.jpg', width: 1280 },
    { name: '34.jpg', width: 1280 },
    { name: '36.jpg', width: 1280 },
    { name: 'SJP_2376.jpg', width: 1280 },
    { name: 'SJP_3021.jpg', width: 1280 },
    { name: 'SJP_3073.jpg', width: 1280 },
    { name: 'SJP_3428.jpg', width: 1280 },
    { name: 'SJP_3528 (1).jpg', width: 1280 },
  ];

  const pujaImgDir = join(PUBLIC, 'assets/img/puja');
  for (const { name, width } of pujaJpgs) {
    const src = join(pujaImgDir, name);
    if (!existsSync(src)) continue;
    const outName = name.replace(/\.(jpg|JPG|jpeg)$/i, '.webp').replace(/\s+/g, '-');
    const out = join(pujaImgDir, outName);
    if (!existsSync(out)) {
      await sharp(src)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(out);
      console.log(`  ✓ Puja jpg→webp ${outName}`);
    } else {
      console.log(`  · Puja ${outName} (already exists, skipping)`);
    }
  }

  console.log('\n✅ Image optimization complete!');
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
