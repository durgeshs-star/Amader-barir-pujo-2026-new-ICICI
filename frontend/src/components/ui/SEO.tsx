import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  /** Page title — appended with site name automatically */
  title?: string;
  /** Meta description */
  description?: string;
  /** Canonical URL (full absolute URL) */
  canonical?: string;
  /** Open Graph image (full absolute URL or absolute path) */
  ogImage?: string;
  /** Open Graph type — defaults to "website" */
  ogType?: string;
  /** Additional keywords for meta keywords tag */
  keywords?: string;
  /** Disable appending site name to title */
  titleOnly?: boolean;
  /** Meta robots directive — defaults to "index,follow" */
  robots?: string;
}

const SITE_NAME = 'Amader Barir Pujo, Pune';
const DEFAULT_DESCRIPTION =
  'Amader Barir Pujo, Pune — Discover devotional services, sacred festivals, community meals, and spiritual programs. Open to everyone.';
const DEFAULT_OG_IMAGE = '/assets/img/banner/1.webp';
const THEME_COLOR = '#782850';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  keywords,
  titleOnly = false,
  robots = 'index,follow',
}) => {
  const fullTitle = title
    ? titleOnly
      ? title
      : `${title} | ${SITE_NAME}`
    : SITE_NAME;

  return (
    <Helmet>
      {/* ── Primary ────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content={robots} />

      {/* ── Theme / PWA ────────────────────────────────── */}
      <meta name="theme-color" content={THEME_COLOR} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="format-detection" content="telephone=no" />

      {/* ── Open Graph ─────────────────────────────────── */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* ── Twitter Card ───────────────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
    </Helmet>
  );
};

export default SEO;
