/* Static site generator for the dental-implants landing page.
   Pattern adapted from the Ohio Endocrinology design system's
   build-authority-pages.mjs: all copy comes from content.mjs, and the
   on-page FAQ / NAP data and their JSON-LD are rendered from the same
   objects. Output: docs/ (index.html, css/, sitemap.xml, robots.txt). */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE, PRACTICE, DOCTORS, IMAGES, STATS, ANATOMY, TYPES, STEPS,
  COMPARISON, CANDIDATE, FINANCING, REAL_CARE, TESTIMONIALS, FAQS, CTA,
} from './content.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DOCS = path.join(ROOT, 'docs');           // deploy root (domain root)
const PAGE = path.join(DOCS, SITE.path);        // docs/dental-implants — matches canonical
const CANONICAL = SITE.origin + SITE.path;

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/* ---------- responsive <picture> helper ---------- */
/* Images live at the domain root (/assets/img/) so every page, at any
   depth, shares the same renditions and cache entries. */
const IMG_BASE = '/assets/img';
function srcset(img, ext) {
  return img.widths.map((w) => `${IMG_BASE}/${img.slug}-${w}.${ext} ${w}w`).join(', ');
}
function picture(img, { sizes, eager = false, className = '' } = {}) {
  const largest = img.widths[img.widths.length - 1];
  const mid = img.widths.includes(800) ? 800 : largest;
  const load = eager
    ? 'fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  return `<picture${className ? ` class="${className}"` : ''}>
  <source type="image/webp" srcset="${srcset(img, 'webp')}" sizes="${sizes}">
  <img src="${IMG_BASE}/${img.slug}-${mid}.jpg" srcset="${srcset(img, 'jpg')}" sizes="${sizes}"
    width="${img.w}" height="${img.h}" alt="${esc(img.alt)}" ${load}>
</picture>`;
}

/* ---------- inline SVG icons (no icon-font dependency) ---------- */
const IC = {
  star: '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
  phone: '<path d="M6.6 2c.5 0 .9.3 1.1.7l1.7 3.6c.2.5.1 1-.3 1.4L7.6 9.2a12.4 12.4 0 0 0 7.2 7.2l1.5-1.5c.4-.4.9-.5 1.4-.3l3.6 1.7c.4.2.7.6.7 1.1v3.1c0 .8-.7 1.5-1.5 1.4C10.5 21.4 2.6 13.5 2.1 3.5 2 2.7 2.7 2 3.5 2z"/>',
  check: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.7-1.7 2.3 2.3 5.7-5.7 1.7 1.7z"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5zm-1.2 13.4 6-6-1.7-1.7-4.3 4.3-1.9-1.9-1.7 1.7z"/>',
  calendar: '<path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm13 8H4v10h16zm-9 3v4H6v-4z"/>',
  clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.4l4 2.4-1 1.7-5-3V7z"/>',
  pin: '<path d="M12 2a7 7 0 0 1 7 7c0 4.4-4.4 9.5-6.3 11.5a1 1 0 0 1-1.4 0C9.4 18.5 5 13.4 5 9a7 7 0 0 1 7-7zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5z"/>',
  warning: '<path d="M12 2.5 23 21H1zM11 9v5h2V9zm0 7v2h2v-2z"/>',
  dollar: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 3v1.6c1.8.3 3 1.4 3.1 3H14c-.1-.8-.8-1.4-2-1.4s-1.9.5-1.9 1.3c0 .7.5 1.1 2.2 1.5 2.2.5 3.8 1.2 3.8 3.2 0 1.7-1.2 2.8-3.1 3.1V19h-2v-1.7c-1.9-.3-3.2-1.4-3.3-3.2H10c.1 1 1 1.6 2.2 1.6 1.3 0 2-.6 2-1.4 0-.8-.6-1.2-2.4-1.6-2-.5-3.6-1.2-3.6-3.2 0-1.6 1.2-2.7 2.8-3V5z"/>',
  heart: '<path d="M12 21S3 14.7 3 8.6C3 5.5 5.5 3 8.5 3c1.4 0 2.7.6 3.5 1.5C12.8 3.6 14.1 3 15.5 3 18.5 3 21 5.5 21 8.6 21 14.7 12 21 12 21z"/>',
  award: '<path d="M12 2a6 6 0 0 1 3.5 10.9l2 7.1-3.9-2.1a3 3 0 0 0-3.2 0L6.5 20l2-7.1A6 6 0 0 1 12 2zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
  smile: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 8A1.5 1.5 0 1 1 7 9.5 1.5 1.5 0 0 1 8.5 8zm7 0A1.5 1.5 0 1 1 14 9.5 1.5 1.5 0 0 1 15.5 8zM6.9 13.6a1 1 0 0 1 1.4-.2 6.2 6.2 0 0 0 7.4 0 1 1 0 0 1 1.2 1.6 8.2 8.2 0 0 1-9.8 0 1 1 0 0 1-.2-1.4z"/>',
  mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.4L4.5 7v10h15V7zM19 6.5H5L12 11z"/>',
  chevron: '<path d="M6.3 9.3 12 15l5.7-5.7-1.4-1.4L12 12.2 7.7 7.9z"/>',
  close: '<path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/>',
  home: '<path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3z"/>',
  user: '<path d="M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 11c4.4 0 8 2.2 8 5v2H4v-2c0-2.8 3.6-5 8-5z"/>',
  file: '<path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm7 1.5V8h4.5zM8 12h8v2H8zm0 4h8v2H8z"/>',
  tooth: '<path d="M7.5 3C4.9 3 3 4.9 3 7.5c0 4.6 2.4 14 4.6 14 1.5 0 1.2-5.4 2.4-5.4s.9 5.4 2.4 5.4C14.6 21.5 17 12.1 17 7.5 17 4.9 15.1 3 12.5 3c-1.6 0-2 .8-2.5.8S9.1 3 7.5 3z" transform="translate(2 -0.5)"/>',
};
const ic = (name, extra = '') =>
  `<svg class="mhb-ic${extra ? ' ' + extra : ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[name]}</svg>`;

/* ---------- type-card SVG illustrations (48×48, stroke style) ---------- */
const post = (x, y = 26) =>
  `<path d="M${x - 4} ${y}h8l-1 5h-1.5l-.5 9c0 .8-.7 1.5-1.5 1.5S${x - 1.5} 40.8 ${x - 1.5} 40l-.5-9H${x - 3}z" fill="var(--oe-teal)" opacity=".85"/>`;
const toothShape = (x, y = 8, s = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4C0 1.5 2 0 4.5 0 6 0 7 .7 8 .7S10 0 11.5 0C14 0 16 1.5 16 4c0 3.5-2 12-4 12-1.2 0-1.4-4-4-4s-2.8 4-4 4C2 16 0 7.5 0 4z" fill="#fff" stroke="var(--oe-navy)" stroke-width="1.6"/>`;
const TYPE_SVGS = {
  tooth: `<svg viewBox="0 0 48 48" aria-hidden="true">${post(24)}${toothShape(16)}</svg>`,
  bridge: `<svg viewBox="0 0 48 48" aria-hidden="true">${post(10, 25)}${post(38, 25)}<rect x="6" y="20" width="36" height="4" rx="2" fill="var(--oe-blue)" opacity=".35"/>${toothShape(2, 6, 0.85)}${toothShape(17, 6, 0.85)}${toothShape(32, 6, 0.85)}</svg>`,
  denture: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 22c0-10 8-16 18-16s18 6 18 16" fill="none" stroke="var(--oe-navy)" stroke-width="1.6" transform="translate(0 -1) scale(.95)"/>${post(9, 24)}${post(19, 27)}${post(29, 27)}${post(39, 24)}${toothShape(4, 8, 0.6)}${toothShape(14, 4, 0.6)}${toothShape(24, 4, 0.6)}${toothShape(34, 8, 0.6)}</svg>`,
};

/* ---------- implant anatomy diagram ---------- */
const ANATOMY_SVG = `<svg viewBox="0 0 560 430" role="img" aria-labelledby="anatomy-title anatomy-desc">
  <title id="anatomy-title">Dental implant cross-section diagram</title>
  <desc id="anatomy-desc">Cross-section of a dental implant showing the porcelain crown above the gumline, the abutment connector at the gumline, and the titanium post fused into the jawbone between two natural teeth.</desc>
  <!-- jawbone -->
  <rect x="0" y="215" width="560" height="215" fill="#f1f5f9"/>
  <g fill="#cbd5e1" opacity=".55">
    <circle cx="60" cy="280" r="4"/><circle cx="130" cy="330" r="5"/><circle cx="95" cy="390" r="4"/>
    <circle cx="440" cy="290" r="4"/><circle cx="500" cy="350" r="5"/><circle cx="465" cy="400" r="4"/>
    <circle cx="180" cy="395" r="4"/><circle cx="385" cy="390" r="4"/>
  </g>
  <!-- gum tissue -->
  <path d="M0 215 Q90 185 170 205 Q230 220 280 218 Q330 220 390 205 Q470 185 560 215 L560 245 Q460 218 390 233 Q330 246 280 244 Q230 246 170 233 Q100 218 0 245 Z" fill="#e8b0ab"/>
  <!-- neighboring natural teeth with roots -->
  <g stroke="#94a3b8" stroke-width="2" fill="#fff">
    <path d="M105 90 C85 90 75 105 75 125 C75 160 82 200 90 212 L96 225 C102 255 108 300 118 300 C128 300 130 250 135 225 L140 212 C150 200 157 160 157 125 C157 105 145 90 125 90 C118 90 112 90 105 90 Z"/>
    <path d="M435 90 C415 90 405 105 405 125 C405 160 412 200 420 212 L426 225 C432 255 438 300 448 300 C458 300 460 250 465 225 L470 212 C480 200 487 160 487 125 C487 105 475 90 455 90 C448 90 442 90 435 90 Z"/>
  </g>
  <!-- crown -->
  <path d="M245 88 C245 70 260 60 280 60 C300 60 315 70 315 88 C315 120 308 165 300 190 L260 190 C252 165 245 120 245 88 Z" fill="#fff" stroke="var(--oe-navy)" stroke-width="2.5"/>
  <!-- abutment -->
  <path d="M262 190 L298 190 L292 232 L268 232 Z" fill="var(--oe-gold-light)" stroke="var(--oe-gold-dark)" stroke-width="2"/>
  <!-- titanium post (threaded screw) -->
  <g>
    <path d="M266 232 L294 232 L290 360 C290 372 284 380 280 380 C276 380 270 372 270 360 Z" fill="#b6c2d0" stroke="#64748b" stroke-width="2"/>
    <g stroke="#64748b" stroke-width="2">
      <line x1="267" y1="252" x2="293" y2="246"/>
      <line x1="268" y1="272" x2="292" y2="266"/>
      <line x1="269" y1="292" x2="291" y2="286"/>
      <line x1="270" y1="312" x2="290" y2="306"/>
      <line x1="271" y1="332" x2="289" y2="326"/>
    </g>
  </g>
  <!-- callout labels -->
  <g font-family="Inter, system-ui, sans-serif" font-size="15" font-weight="600" fill="var(--oe-navy)">
    <g><line x1="318" y1="110" x2="406" y2="92" stroke="var(--oe-teal)" stroke-width="2"/><circle cx="420" cy="88" r="13" fill="var(--oe-teal)"/><text x="420" y="93" text-anchor="middle" fill="#fff">3</text><text x="440" y="93" font-size="14">Porcelain crown</text></g>
    <g><line x1="300" y1="211" x2="406" y2="180" stroke="var(--oe-gold)" stroke-width="2"/><circle cx="420" cy="176" r="13" fill="var(--oe-gold)"/><text x="420" y="181" text-anchor="middle" fill="#fff">2</text><text x="440" y="181" font-size="14">Abutment</text></g>
    <g><line x1="290" y1="320" x2="150" y2="345" stroke="var(--oe-blue)" stroke-width="2"/><circle cx="136" cy="349" r="13" fill="var(--oe-blue)"/><text x="136" y="354" text-anchor="middle" fill="#fff">1</text><text x="20" y="332" font-size="14">Titanium post</text><text x="20" y="350" font-size="12" font-weight="500" fill="#64748b">fused into jawbone</text></g>
  </g>
</svg>`;

/* ---------- JSON-LD ---------- */
/* Full practice graph: Dentist + FAQPage + BreadcrumbList. Used by the
   implants landing page and the home page (both carry the complete
   LocalBusiness data). canonical/faqs/crumbTrail vary per page. */
function jsonLd(canonical = CANONICAL, faqs = FAQS, crumbTrail = null) {
  const imgUrl = (slug, w) => `${SITE.origin}${IMG_BASE}/${slug}-${w}.jpg`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dentist',
        '@id': `${SITE.origin}/#dentist`,
        name: PRACTICE.name,
        legalName: PRACTICE.legalName,
        url: canonical,
        image: imgUrl(IMAGES.hero.slug, 1200),
        telephone: PRACTICE.phoneE164,
        faxNumber: PRACTICE.fax,
        email: PRACTICE.email,
        priceRange: '$$',
        foundingDate: PRACTICE.founded,
        address: {
          '@type': 'PostalAddress',
          streetAddress: PRACTICE.address.street,
          addressLocality: PRACTICE.address.city,
          addressRegion: PRACTICE.address.region,
          postalCode: PRACTICE.address.zip,
          addressCountry: 'US',
        },
        geo: { '@type': 'GeoCoordinates', latitude: PRACTICE.geo.lat, longitude: PRACTICE.geo.lng },
        openingHoursSpecification: PRACTICE.hours.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes,
        })),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: PRACTICE.rating.value,
          reviewCount: PRACTICE.rating.count,
          bestRating: 5,
        },
        areaServed: PRACTICE.areaServed.map((c) => ({ '@type': 'City', name: c })),
        employee: DOCTORS.map((d) => ({
          '@type': 'Person',
          name: d.name,
          jobTitle: 'Dentist',
          image: imgUrl(d.img, 800),
          worksFor: { '@id': `${SITE.origin}/#dentist` },
        })),
        availableService: {
          '@type': 'MedicalProcedure',
          name: 'Dental Implant Placement',
          procedureType: 'https://schema.org/SurgicalProcedure',
          description:
            'Surgical placement of a titanium dental implant post and restoration with an abutment and custom porcelain crown to permanently replace missing teeth.',
        },
        paymentAccepted: 'Cash, Credit Card, CareCredit, Insurance',
      },
      ...(faqs?.length ? [{
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
      ...(crumbTrail?.length > 1 ? [breadcrumbList(crumbTrail, canonical)] : []),
    ],
  };
  return JSON.stringify(graph, null, 0);
}

/* trail: [[label, path], ..., [label, ""]] (empty path = current page) */
function breadcrumbList(trail, canonical) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumbs`,
    itemListElement: trail.map(([name, href], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: href ? SITE.origin + href : canonical,
    })),
  };
}

/* Lightweight graph for content pages: WebPage + BreadcrumbList (+ FAQPage) */
function pageJsonLd(page) {
  const canonical = SITE.origin + page.path;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': canonical,
      url: canonical,
      name: page.metaTitle,
      description: page.metaDesc,
      isPartOf: { '@type': 'WebSite', name: PRACTICE.name, url: SITE.origin + '/' },
      about: { '@id': `${SITE.origin}/#dentist` },
    },
    ...(page.breadcrumbs?.length > 1 ? [breadcrumbList(page.breadcrumbs, canonical)] : []),
    ...(page.faqs?.length ? [{
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }] : []),
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 0);
}

/* ---------- navigation data (mirrors the live site's structure) ---------- */
const NAV = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'About', drawerLabel: 'About Dr. Brown', href: '/about/', icon: 'user' },
  {
    label: 'General', drawerLabel: 'General Dentistry', icon: 'tooth',
    items: [
      ['All General Services', '/general-dentistry/'],
      ['Dental Implants', '/dental-implants/'],
      ['Dental Crowns', '/treatments/crowns/'],
      ['Dental Bridges', '/treatments/bridges/'],
      ['Dentures', '/treatments/dentures/'],
      ['Root Canal', '/treatments/root-canal/'],
      ['Gum Disease Laser', '/treatments/gum-disease/'],
      ['Tooth Extractions', '/treatments/extractions/'],
      ['Fillings & Restorations', '/treatments/fillings/'],
      ['Dental Sealants', '/treatments/sealants/'],
    ],
  },
  {
    label: 'Cosmetic', drawerLabel: 'Cosmetic Dentistry', icon: 'star',
    items: [
      ['All Cosmetic Services', '/cosmetic-dentistry/'],
      ['Teeth Whitening', '/teeth-whitening/'],
      ['Porcelain Veneers', '/cosmetic-treatments/veneers/'],
      ['Dental Bonding', '/cosmetic-treatments/bonding/'],
      ['Clear Braces', '/cosmetic-treatments/clear-braces/'],
      ['Inlays & Onlays', '/cosmetic-treatments/inlays-onlays/'],
    ],
  },
  {
    label: 'Patient Info', drawerLabel: 'Patient Info', icon: 'file',
    items: [
      ['Patient Information', '/patient-info/'],
      ['First Visit', '/patient-info/#first-visit'],
      ['Insurance', '/patient-info/#insurance'],
      ['Financing Options', '/patient-info/#financing'],
      ['Privacy & HIPAA', '/privacy-policy/'],
    ],
  },
  { label: 'Contact', drawerLabel: 'Contact Us', href: '/contact/', icon: 'mail' },
];

const LOGO_SVG = `<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" rx="10" fill="#0d2d4e"/><path d="M14 11c-3 0-5.2 2.2-5.2 5.2 0 5.3 2.8 16 5.3 16 1.7 0 1.4-6.2 2.9-6.2s1.2 6.2 2.9 6.2c2.5 0 5.3-10.7 5.3-16C25.2 13.2 23 11 20 11c-1.8 0-2.3 1-3 1s-1.2-1-3-1z" transform="translate(4 -1)" fill="#fff"/></svg>`;

/* ---------- page sections ---------- */
const stars = '★★★★★';
const addr = `${PRACTICE.address.street}, ${PRACTICE.address.city}, ${PRACTICE.address.region} ${PRACTICE.address.zip}`;

const cur = (h, activePath) => (h === activePath ? ' aria-current="page"' : '');

const navDesktop = (activePath) => NAV.map((n, i) => n.items
  ? `<li>
      <button class="mhb-header__nav-dd-btn" type="button" aria-expanded="false" aria-controls="dd-${i}">${esc(n.label)} <svg class="mhb-header__nav-chevron" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${'<path d="M6.3 9.3 12 15l5.7-5.7-1.4-1.4L12 12.2 7.7 7.9z"/>'}</svg></button>
      <ul class="mhb-header__dropdown" id="dd-${i}">
        ${n.items.map(([t, h]) => `<li><a href="${h}"${cur(h, activePath)}>${esc(t)}</a></li>`).join('\n        ')}
      </ul>
    </li>`
  : `<li><a class="mhb-header__nav-link" href="${n.href}"${cur(n.href, activePath)}>${esc(n.label)}</a></li>`).join('\n    ');

const navDrawer = (activePath) => NAV.map((n, i) => n.items
  ? `<li>
      <button class="mhb-drawer__acc-btn" type="button" aria-expanded="false" aria-controls="dsub-${i}">
        <span class="mhb-drawer__acc-label">${ic(n.icon)} ${esc(n.drawerLabel || n.label)}</span>
        <svg class="mhb-drawer__acc-chevron" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.3 9.3 12 15l5.7-5.7-1.4-1.4L12 12.2 7.7 7.9z"/></svg>
      </button>
      <ul class="mhb-drawer__sub" id="dsub-${i}">
        ${n.items.map(([t, h]) => `<li><a href="${h}"${cur(h, activePath)}>${esc(t)}</a></li>`).join('\n        ')}
      </ul>
    </li>`
  : `<li><a class="mhb-drawer__link" href="${n.href}"${cur(n.href, activePath)}>${ic(n.icon)} ${esc(n.drawerLabel || n.label)}</a></li>`).join('\n    ');

const chromeHeader = (activePath) => `
<a class="mhb-skip-link" href="#main">Skip to main content</a>
<div class="mhb-topbar">
  <div class="mhb-topbar__inner">
    <div class="mhb-topbar__left">
      <span class="mhb-topbar__item">${ic('pin')} ${esc(addr)}</span>
      <span class="mhb-topbar__item">${ic('clock')} Mon–Thu: 8am–4pm&nbsp;|&nbsp;Fri: 8am–12pm</span>
    </div>
    <div class="mhb-topbar__right">
      <a class="mhb-topbar__phone" href="${PRACTICE.phoneHref}">${ic('phone')} ${PRACTICE.phone}</a>
      <a class="mhb-topbar__item" href="mailto:${PRACTICE.email}" aria-label="Email ${PRACTICE.email}">${ic('mail')} <span class="mhb-topbar__email-text">${PRACTICE.email}</span></a>
      <span class="mhb-topbar__item mhb-topbar__hipaa">${ic('shield')} HIPAA Protected</span>
    </div>
  </div>
</div>
<header class="mhb-header">
  <div class="mhb-header__inner">
    <div class="mhb-header__left">
      <a class="mhb-logo" href="/" aria-label="${esc(PRACTICE.name)} — home">
        <span class="mhb-logo__icon">${LOGO_SVG}</span>
        <span class="mhb-logo__text">
          <span class="mhb-logo__name">Marshall H. Brown, DDS</span>
          <span class="mhb-logo__sub">&amp; Associates · Fort Worth, TX</span>
        </span>
      </a>
      <button class="mhb-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">
        <span class="mhb-burger__bar"></span><span class="mhb-burger__bar"></span><span class="mhb-burger__bar"></span>
      </button>
    </div>
    <nav class="mhb-header__nav" aria-label="Primary">
      <ul class="mhb-header__nav-list">
    ${navDesktop(activePath)}
      </ul>
    </nav>
    <div class="mhb-header__right">
      <a class="mhb-btn mhb-btn--teal mhb-btn--sm mhb-header__cta" href="#contact" aria-label="Book Appointment">${ic('calendar')} <span class="mhb-header__cta-text">Book Appointment</span></a>
    </div>
  </div>
</header>
<div class="mhb-drawer-overlay" id="drawer-overlay" hidden></div>
<aside class="mhb-drawer" id="drawer" aria-label="Site menu" aria-hidden="true">
  <div class="mhb-drawer__hdr">
    <span class="mhb-drawer__hdr-brand">${ic('tooth')} Marshall H. Brown, DDS</span>
    <button class="mhb-drawer__close" type="button" aria-label="Close menu">${ic('close')}</button>
  </div>
  <nav class="mhb-drawer__body" aria-label="Site menu">
    <ul class="mhb-drawer__list">
    ${navDrawer(activePath)}
    </ul>
  </nav>
  <div class="mhb-drawer__footer">
    <a class="mhb-btn mhb-btn--teal mhb-header__cta" href="#contact">${ic('calendar')} Book Appointment</a>
    <a class="mhb-drawer__footer-phone" href="${PRACTICE.phoneHref}">${ic('phone')} ${PRACTICE.phone}</a>
    <p class="mhb-drawer__footer-note">${ic('shield')} HIPAA-compliant · Fort Worth, TX</p>
  </div>
</aside>`;

/* Breadcrumb bar. trail: [[label, path], ..., [label, ""]] — last item is
   the current page. Omitted entirely on the home page. */
const crumbsHtml = (trail) => !trail || trail.length < 2 ? '' : `
<nav class="mhb-crumbs" aria-label="Breadcrumb">
  <ol>
    ${trail.map(([label, href]) => href
      ? `<li><a href="${href}">${esc(label)}</a></li>`
      : `<li><span aria-current="page">${esc(label)}</span></li>`).join('\n    ')}
  </ol>
</nav>`;

const hero = `
<section class="mhb-hero" id="top" aria-label="Introduction">
  <div class="mhb-hero__inner">
    <div>
      <p class="mhb-hero__eyebrow">Fort Worth, TX — Permanent Tooth Replacement</p>
      <h1 class="mhb-hero__title">Dental Implants <span>That Last a Lifetime</span></h1>
      <p class="mhb-hero__desc">Dental implants are the most advanced, longest-lasting solution for missing teeth. Our doctors place restorations that look, feel, and function exactly like your natural teeth — giving you back your smile, your confidence, and your quality of life.</p>
      <ul class="mhb-hero__chips" role="list">
        <li class="mhb-hero__chip">${ic('check')} Single Tooth Implants</li>
        <li class="mhb-hero__chip">${ic('check')} Multiple Teeth</li>
        <li class="mhb-hero__chip">${ic('check')} Implant-Supported Dentures</li>
      </ul>
      <div class="mhb-hero__actions">
        <a class="mhb-btn mhb-btn--teal" href="#contact">${ic('calendar')} Free Implant Consultation</a>
        <a class="mhb-btn mhb-btn--outline-white" href="${PRACTICE.phoneHref}">${ic('phone')} Call ${PRACTICE.phone}</a>
      </div>
      <ul class="mhb-hero__trust" role="list">
        <li class="mhb-hero__trust-item">${ic('star')} <span><strong>${PRACTICE.rating.value}★ Google rating</strong> · ${PRACTICE.rating.count}+ reviews</span></li>
        <li class="mhb-hero__trust-item">${ic('shield')} <span><strong>Most insurance</strong> accepted</span></li>
        <li class="mhb-hero__trust-item">${ic('calendar')} <span><strong>Same-week</strong> appointments</span></li>
      </ul>
    </div>
    <div class="mhb-hero__media">
      <div class="mhb-hero__img-wrap">
        ${picture(IMAGES.hero, { sizes: '(max-width: 1024px) 90vw, 540px', eager: true })}
      </div>
      <div class="mhb-hero__badge">
        <div class="mhb-hero__badge-icon">${ic('star')}</div>
        <div class="mhb-hero__badge-text"><strong>${PRACTICE.rating.value} ★★★★★</strong><span>${PRACTICE.rating.count}+ Google reviews</span></div>
      </div>
      <div class="mhb-hero__badge-2"><strong>30+</strong><span>years of implant experience</span></div>
    </div>
  </div>
</section>`;

const statsSection = `
<section class="mhb-section" aria-label="Key numbers">
  <div class="mhb-container">
    <div class="mhb-stats">
      ${STATS.map((s) => `<div class="mhb-stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>`;

const anatomySection = `
<section class="mhb-section mhb-section--alt" id="what-is-an-implant">
  <div class="mhb-container">
    <div class="mhb-split">
      <div class="mhb-split__body">
        <div class="mhb-section-head mhb-section-head--left">
          <p class="mhb-eyebrow">${esc(ANATOMY.eyebrow)}</p>
          <h2>${esc(ANATOMY.title)}</h2>
        </div>
        ${ANATOMY.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <ol class="mhb-parts">
          ${ANATOMY.parts.map((p, i) => `<li><span class="mhb-parts__num" aria-hidden="true">${i + 1}</span><div><strong>${esc(p.name)}</strong><p>${esc(p.desc)}</p></div></li>`).join('\n          ')}
        </ol>
      </div>
      <figure class="mhb-split__figure">
        ${ANATOMY_SVG}
        <figcaption>The three components of a dental implant</figcaption>
      </figure>
    </div>
  </div>
</section>`;

const typesSection = `
<section class="mhb-section" id="implant-types">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">${esc(TYPES.eyebrow)}</p>
      <h2>${esc(TYPES.title)}</h2>
    </div>
    <div class="mhb-whyus-grid">
      ${TYPES.items.map((t) => `<div class="mhb-whyus-item">
        <div class="mhb-whyus-icon">${TYPE_SVGS[t.icon]}</div>
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.desc)}</p>
        <span class="mhb-tag">${esc(t.tag)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;

const stepsSection = `
<section class="mhb-section mhb-section--alt" id="process">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">${esc(STEPS.eyebrow)}</p>
      <h2>${esc(STEPS.title)}</h2>
    </div>
    <ol class="mhb-steps" role="list" style="list-style:none;padding:0;margin:0;">
      ${STEPS.items.map((s, i) => `<li class="mhb-step">
        <span class="mhb-step__num" aria-hidden="true">${i + 1}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.desc)}</p>
        <span class="mhb-step__meta">${esc(s.meta)}</span>
      </li>`).join('\n      ')}
    </ol>
    <div class="mhb-note">
      ${ic('warning')}
      <p><strong>Don't wait:</strong> ${esc(STEPS.note)}</p>
    </div>
  </div>
</section>`;

const comparisonSection = `
<section class="mhb-section" id="compare">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">${esc(COMPARISON.eyebrow)}</p>
      <h2>${esc(COMPARISON.title)}</h2>
    </div>
    <div class="mhb-table-wrap">
      <table class="mhb-table">
        <caption>${esc(COMPARISON.caption)}</caption>
        <colgroup><col><col class="mhb-col-implants"><col><col></colgroup>
        <thead>
          <tr><th scope="col"><span class="visually-hidden">Feature</span></th>${COMPARISON.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${COMPARISON.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th>${r.cells.map((c, i) => `<td${i === r.win ? ' class="mhb-win"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('\n          ')}
        </tbody>
      </table>
    </div>
  </div>
</section>`;

const doctorsSection = `
<section class="mhb-section mhb-section--alt" id="doctors">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">${esc(CANDIDATE.eyebrow)}</p>
      <h2>${esc(CANDIDATE.title)}</h2>
      <p class="mhb-section-sub">${esc(CANDIDATE.intro)}</p>
    </div>
    <div class="mhb-split" style="align-items:start;">
      <div class="mhb-split__body">
        <ul class="mhb-checklist" role="list">
          ${CANDIDATE.checklist.map((c) => `<li>${ic('check')} <span>${esc(c)}</span></li>`).join('\n          ')}
        </ul>
        <p style="margin-top:1.5rem;color:var(--oe-text-muted);">${esc(CANDIDATE.outro)}</p>
      </div>
      <div class="mhb-photo-card">
        ${picture(IMAGES.consult, { sizes: '(max-width: 1024px) 90vw, 560px' })}
        <span class="mhb-photo-card__chip">Chairside implant consultation</span>
      </div>
    </div>
    <h3 style="font-family:var(--oe-font-display);color:var(--oe-navy);font-size:1.4rem;margin:3.5rem 0 1.5rem;text-align:center;">Meet Your Fort Worth Implant Dentists</h3>
    <div class="mhb-doctors">
      ${DOCTORS.map((d) => `<article class="mhb-doctor">
        ${picture(IMAGES[d.img === IMAGES.drBrown.slug ? 'drBrown' : 'drKamgang'] ?? IMAGES.drBrown, { sizes: '(max-width: 768px) 92vw, 190px' })}
        <div class="mhb-doctor__body">
          <h4 style="font-family:var(--oe-font-display);font-size:1.15rem;color:var(--oe-navy);margin-bottom:0.2rem;">${esc(d.name)}</h4>
          <span class="mhb-doctor__role">${esc(d.role)}</span>
          <p>${esc(d.bio)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>`;

const financingSection = `
<section class="mhb-section" id="cost">
  <div class="mhb-container">
    <div class="mhb-split" style="align-items:start;">
      <div class="mhb-split__body">
        <div class="mhb-section-head mhb-section-head--left">
          <p class="mhb-eyebrow">${esc(FINANCING.eyebrow)}</p>
          <h2>${esc(FINANCING.title)}</h2>
        </div>
        <p>${esc(FINANCING.intro)}</p>
        <ul class="mhb-finance-points" role="list">
          ${FINANCING.points.map((p) => `<li>${ic('dollar')} <span>${esc(p)}</span></li>`).join('\n          ')}
        </ul>
        <p style="margin-top:1.5rem;">${esc(FINANCING.outro)}</p>
      </div>
      <div class="mhb-photo-card">
        ${picture(IMAGES.waiting, { sizes: '(max-width: 1024px) 90vw, 560px' })}
        <span class="mhb-photo-card__chip">Our Fort Worth office</span>
      </div>
    </div>
  </div>
</section>
<div class="mhb-insurance-strip" aria-label="Payment and insurance options">
  <div class="mhb-container">
    <div class="mhb-insurance-logos">
      ${FINANCING.insurers.map((n) => `<div class="mhb-insurance-logo"><span class="mhb-insurance-logo__icon">${ic('shield')}</span><span>${esc(n)}</span></div>`).join('\n      ')}
    </div>
  </div>
</div>`;

const realCareSection = `
<section class="mhb-section mhb-section--alt" id="patients">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">${esc(REAL_CARE.eyebrow)}</p>
      <h2>${esc(REAL_CARE.title)}</h2>
      <p class="mhb-section-sub">${esc(REAL_CARE.sub)}</p>
    </div>
    <div class="mhb-testimonials-grid">
      ${TESTIMONIALS.map((t) => `<figure class="mhb-quote">
        <div class="mhb-quote__stars" aria-label="5 out of 5 stars">${stars}</div>
        <blockquote>&ldquo;${esc(t.quote)}&rdquo;</blockquote>
        <figcaption><strong>${esc(t.name)}</strong>${esc(t.detail)}</figcaption>
      </figure>`).join('\n      ')}
    </div>
    <!-- Before/after case gallery: intentionally omitted until real clinical
         photos are supplied by the practice. Add a .mhb-gallery grid of
         picture() cards here when they arrive. -->
    <div class="mhb-gallery">
      <div class="mhb-photo-card">${picture(IMAGES.team, { sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 380px' })}<span class="mhb-photo-card__chip">The whole team, ready for you</span></div>
      <div class="mhb-photo-card">${picture(IMAGES.imaging, { sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 380px' })}<span class="mhb-photo-card__chip">3D imaging for precise planning</span></div>
      <div class="mhb-photo-card">${picture(IMAGES.waiting, { sizes: '(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 380px' })}<span class="mhb-photo-card__chip">Comfort from the moment you arrive</span></div>
    </div>
  </div>
</section>`;

const faqSection = `
<section class="mhb-section" id="faq">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Your Questions Answered</p>
      <h2>Dental Implant FAQs</h2>
    </div>
    <div class="mhb-faq">
      ${FAQS.map((f) => `<details>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>`;

const ctaSection = `
<section class="mhb-cta" id="contact">
  <div class="mhb-container">
    <p class="mhb-eyebrow" style="color:rgba(255,255,255,0.85);justify-content:center;display:flex;">${esc(CTA.eyebrow)}</p>
    <h2>${esc(CTA.title)}</h2>
    <p>${esc(CTA.body)}</p>
    <div class="mhb-cta__actions">
      <a class="mhb-btn mhb-btn--primary" href="${PRACTICE.phoneHref}">${ic('phone')} Call ${PRACTICE.phone}</a>
      <a class="mhb-btn mhb-btn--outline-white" href="mailto:${PRACTICE.email}?subject=Free%20Implant%20Consultation">${ic('calendar')} Email to Book a Visit</a>
    </div>
    <div class="mhb-cta__meta">
      <span>${ic('pin')} ${esc(addr)}</span>
      <span>${ic('clock')} ${PRACTICE.hours.map((h) => h.label).join(' · ')}</span>
    </div>
  </div>
</section>`;

/* ---------- announcement ticker (messages from the live site) ---------- */
const TICKER_ITEMS = [
  { icon: 'warning', variant: 'alert', html: `<strong>WARNING:</strong> Bone loss begins within 3 months of tooth extraction` },
  { icon: 'tooth', variant: 'info', html: `<strong>Dental Implants in Fort Worth</strong> — Permanent teeth that look and feel natural`, cta: ['Explore Implants', '/dental-implants/'] },
  { icon: 'check', variant: 'success', html: `<strong>Accepting New Patients</strong> — Same-week appointments often available`, cta: ['Book Now', '/contact/', 'teal'] },
  { icon: 'star', variant: 'gold', html: `<strong>4.7★ on Google</strong> — 269+ verified patient reviews in Fort Worth, TX` },
  { icon: 'shield', variant: 'success', html: `<strong>HIPAA-Compliant Practice</strong> — Your health information is always protected` },
  { icon: 'dollar', variant: 'info', html: `<strong>Financing Options Available</strong> — Make the smile you deserve affordable`, cta: ['See Options', '/patient-info/#financing'] },
  { icon: 'smile', variant: 'gold', html: `<strong>Porcelain Veneers</strong> — Transform your smile in as few as 2 visits`, cta: ['See Results', '/cosmetic-treatments/veneers/'] },
  { icon: 'star', variant: 'info', html: `<strong>Zoom® &amp; LaserSmile Teeth Whitening</strong> — Brighten your smile up to 8 shades` },
  { icon: 'award', variant: 'gold', html: `<strong>30+ Years Serving Fort Worth Families</strong> — Dr. Marshall H. Brown, DDS` },
  { icon: 'check', variant: 'success', html: `<strong>Second Opinion Welcome</strong> — Get expert reassurance before any procedure` },
  { icon: 'heart', variant: 'success', html: `<strong>Complimentary Consultation</strong> — Ask about your treatment options today`, cta: ['Get Started', '/contact/', 'teal'] },
  { icon: 'shield', variant: 'info', html: `<strong>Most Dental Insurance Accepted</strong> — We help maximize your benefits` },
  { icon: 'pin', variant: 'info', html: `Conveniently Located: 1818 8th Avenue, Fort Worth, TX 76110` },
  { icon: 'phone', variant: 'gold', html: `Questions? Call us at <a class="mhb-ticker-phone" href="${PRACTICE.phoneHref}">${PRACTICE.phone}</a> — We're here to help` },
  { icon: 'smile', variant: 'success', html: `<strong>Full-Scope General &amp; Cosmetic Dentistry</strong> — One team for all your dental needs` },
  { icon: 'clock', variant: 'info', html: `<strong>Flexible Scheduling</strong> — Mon–Thu 8am–4pm | Fri 8am–12pm` },
];
const tickerItemsHtml = TICKER_ITEMS.map((t) => `<span class="mhb-ticker-item mhb-ticker--${t.variant}">${ic(t.icon)} <span>${t.html}</span>${t.cta ? ` <a class="mhb-ticker-cta${t.cta[2] ? ` mhb-ticker-cta--${t.cta[2]}` : ''}" href="${t.cta[1]}">${esc(t.cta[0])}</a>` : ''}</span>`).join('');

const ticker = `
<div class="mhb-ticker-bar" role="region" aria-label="Practice announcements">
  <div class="mhb-ticker-bar__inner">
    <div class="mhb-ticker-track" tabindex="0">
      <div class="mhb-ticker-content" id="ticker-content" aria-hidden="false">
        ${tickerItemsHtml}${tickerItemsHtml}
      </div>
    </div>
    <button class="mhb-ticker-pause" id="ticker-pause" type="button" aria-label="Pause announcements" data-paused="false">
      <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>
      <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>
    </button>
  </div>
</div>`;

/* ---------- interactive chrome (drawer, dropdowns, ticker pause) ---------- */
const SCRIPT = `<script>
(function () {
  var burger = document.querySelector('.mhb-burger');
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawer-overlay');
  var closeBtn = drawer.querySelector('.mhb-drawer__close');
  function setDrawer(open) {
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    overlay.hidden = false;
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
  closeBtn.addEventListener('click', function () { setDrawer(false); });
  overlay.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setDrawer(false); closeDropdowns(); }
  });
  drawer.querySelectorAll('.mhb-drawer__acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('open', !open);
    });
  });
  var ddBtns = document.querySelectorAll('.mhb-header__nav-dd-btn');
  function closeDropdowns(except) {
    ddBtns.forEach(function (b) {
      if (b !== except) {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).classList.remove('open');
      }
    });
  }
  ddBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeDropdowns(btn);
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('open', !open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.mhb-header__nav-list')) closeDropdowns();
  });
  var pauseBtn = document.getElementById('ticker-pause');
  var tickerContent = document.getElementById('ticker-content');
  if (pauseBtn && tickerContent) {
    pauseBtn.addEventListener('click', function () {
      var paused = pauseBtn.getAttribute('data-paused') === 'true';
      pauseBtn.setAttribute('data-paused', String(!paused));
      pauseBtn.setAttribute('aria-label', paused ? 'Pause announcements' : 'Play announcements');
      tickerContent.classList.toggle('is-paused', !paused);
    });
  }
  // Start the ticker only once the page has loaded and the main thread is
  // idle. Animating a ~10,000px strip during render cost ~350ms of style
  // and layout; deferring it keeps that off the critical path.
  if (tickerContent) {
    var start = function () { tickerContent.classList.add('is-running'); };
    // Hold off ~2.5s after load, then wait for an idle moment. A marquee
    // that begins a couple of seconds in reads as intentional, and this
    // keeps its style/layout work clear of the page's settling period.
    var defer = function () {
      setTimeout(function () {
        if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 2000 });
        else start();
      }, 2500);
    };
    if (document.readyState === 'complete') defer();
    else window.addEventListener('load', defer);
  }
})();
</script>`;

const footer = `
<footer class="mhb-footer">
  <div class="mhb-container">
    <div class="mhb-footer__grid">
      <div>
        <h2>Marshall H. Brown, DDS</h2>
        <p>Family &amp; implant dentistry, serving Fort Worth, Arlington, and Burleson since ${PRACTICE.founded}. Rated ${PRACTICE.rating.value}★ on Google across ${PRACTICE.rating.count}+ patient reviews.</p>
      </div>
      <div>
        <h3>Contact</h3>
        <address>
          ${esc(addr)}<br>
          Phone: <a href="${PRACTICE.phoneHref}">${PRACTICE.phone}</a><br>
          Fax: (817) 920-0709<br>
          <a href="mailto:${PRACTICE.email}">${PRACTICE.email}</a>
        </address>
      </div>
      <div>
        <h3>Hours &amp; Links</h3>
        <ul>
          ${PRACTICE.hours.map((h) => `<li>${h.label}</li>`).join('\n          ')}
          <li><a href="/about/">About the practice</a></li>
          <li><a href="/dental-implants/">Dental implants</a></li>
          <li><a href="/patient-info/">Patient information</a></li>
          <li><a href="/privacy-policy/">Privacy &amp; HIPAA</a></li>
        </ul>
      </div>
    </div>
    <div class="mhb-footer__legal">
      <span>© ${new Date().getFullYear()} ${esc(PRACTICE.name)}. All rights reserved.</span>
      <span>This page is for general information only and is not a substitute for professional dental advice, diagnosis, or treatment.</span>
    </div>
  </div>
</footer>`;

/* ---------- self-hosted fonts ----------
   Filenames carry a content hash so they can be cached immutably and still
   change safely. That means the @font-face rules and preload hints are
   derived from what's actually on disk rather than hard-coded, so the hash,
   the CSS, and the preloads can never drift apart. Latin subset, further
   reduced to the ~90 glyphs the site actually uses. */
const LATIN_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, '
  + 'U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, '
  + 'U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const FONT_FACES = [
  { file: 'inter-latin', family: 'Inter', style: 'normal', weight: '300 800', preload: true },
  { file: 'playfair-latin', family: 'Playfair Display', style: 'normal', weight: '600 800', preload: true },
  // Italic is used only by pull quotes below the fold — loaded, never preloaded.
  { file: 'inter-latin-italic', family: 'Inter', style: 'italic', weight: '400 600', preload: false },
];

const fontDir = path.join(DOCS, 'assets', 'fonts');
const fontFiles = fs.existsSync(fontDir) ? fs.readdirSync(fontDir) : [];
for (const f of FONT_FACES) {
  const match = fontFiles.find((n) => n.startsWith(f.file + '.') && n.endsWith('.woff2'));
  if (!match) throw new Error(`Missing font file for "${f.file}" in docs/assets/fonts/`);
  f.url = `/assets/fonts/${match}`;
}

const fontCss = FONT_FACES.map((f) =>
  `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};`
  + `font-display:swap;src:url('${f.url}') format('woff2');unicode-range:${LATIN_RANGE};}`
).join('\n');

const FONT_PRELOADS = FONT_FACES.filter((f) => f.preload)
  .map((f) => `<link rel="preload" href="${f.url}" as="font" type="font/woff2" crossorigin>`)
  .join('\n  ');

/* ---------- document shell ---------- */
const heroPreload = `<link rel="preload" as="image" type="image/webp"
    imagesrcset="${srcset(IMAGES.hero, 'webp')}"
    imagesizes="(max-width: 1024px) 90vw, 540px" fetchpriority="high">`;

/* Inline all CSS to avoid the @import request waterfall.
   Order matters: tokens first, then components. */
const CSS_FILES = [
  'tokens/fonts.css', 'tokens/colors.css', 'tokens/typography.css',
  'tokens/spacing.css', 'tokens/radii-shadows.css', 'tokens/base.css',
  'landing.css', 'chrome.css', 'pages.css',
];
const inlineCss = fontCss + '\n' + CSS_FILES
  .map((f) => fs.readFileSync(path.join(ROOT, 'css', f), 'utf8'))
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^@import[^\n]*$/gm, '')
  .replace(/\n{2,}/g, '\n');


/* Render one page. pagePath must start and end with "/". Writes
   docs/<pagePath>/index.html unless outFile overrides the destination. */
function renderPage({
  pagePath, metaTitle, metaDesc, ogImage, jsonLdStr = '', breadcrumbs = null,
  body, extraHead = '', noindex = false, outFile = null,
}) {
  const canonical = SITE.origin + pagePath;
  const og = ogImage ?? `${SITE.origin}${IMG_BASE}/${IMAGES.team.slug}-1200.jpg`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(metaTitle)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="canonical" href="${canonical}">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <meta name="theme-color" content="#0d2d4e">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(PRACTICE.name)}">
  <meta property="og:title" content="${esc(metaTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${og}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(metaTitle)}">
  <meta name="twitter:description" content="${esc(metaDesc)}">
  <meta name="twitter:image" content="${og}">

  ${FONT_PRELOADS}
  ${extraHead}
  <style>
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}
${inlineCss}
  </style>
  ${jsonLdStr ? `<script type="application/ld+json">${jsonLdStr}</script>` : ''}
</head>
<body>
${chromeHeader(pagePath)}
${crumbsHtml(breadcrumbs)}
<main id="main">
${body}
</main>
${footer}
${ticker}
${SCRIPT}
</body>
</html>
`;
  if (outFile) {
    fs.writeFileSync(outFile, html);
  } else {
    const outDir = path.join(DOCS, '.' + pagePath);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
  }
  return html.length;
}

/* ---------- JSON-driven page templates ---------- */
const CONTENT_DIR = path.join(ROOT, 'tools', 'content');
const loadPages = () =>
  fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')));

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const CARD_ICONS = ['tooth', 'smile', 'star', 'shield', 'heart', 'award'];

const bookBtns = `
    <div class="mhb-hero__actions" style="margin-bottom:0;">
      <a class="mhb-btn mhb-btn--teal" href="/contact/">${ic('calendar')} Book Appointment</a>
      <a class="mhb-btn mhb-btn--outline-white" href="${PRACTICE.phoneHref}">${ic('phone')} Call ${PRACTICE.phone}</a>
    </div>`;

const pageHero = (p) => `
<section class="mhb-page-hero">
  <div class="mhb-container">
    <p class="mhb-hero__eyebrow">${esc(p.eyebrow)}</p>
    <h1>${esc(p.h1)}</h1>
    ${(p.intro || []).map((t) => `<p class="mhb-page-hero__lede">${esc(t)}</p>`).join('\n    ')}
    ${p.chips?.length ? `<ul class="mhb-hero__chips" role="list">
      ${p.chips.map((c) => `<li class="mhb-hero__chip">${ic('check')} ${esc(c)}</li>`).join('\n      ')}
    </ul>` : ''}${bookBtns}
  </div>
</section>`;

const usedIds = new WeakMap(); // page → Set of ids already assigned
function anchorId(p, s) {
  if (!usedIds.has(p)) usedIds.set(p, new Set());
  const used = usedIds.get(p);
  let id = slugify(s.h2);
  if (p.template === 'patient-info') {
    if (/first visit/i.test(s.h2) && !used.has('first-visit')) id = 'first-visit';
    else if (/insurance/i.test(s.h2) && !used.has('insurance')) id = 'insurance';
    else if (/financing/i.test(s.h2) && !used.has('financing')) id = 'financing';
  }
  while (used.has(id)) id += '-2';
  used.add(id);
  return id;
}

const bulletsHtml = (bullets) => bullets?.length ? `
    <ul class="mhb-checklist" role="list">
      ${bullets.map((b) => `<li>${ic('check')} <span>${esc(b)}</span></li>`).join('\n      ')}
    </ul>` : '';

const proseSection = (p, s, i) => `
<section class="mhb-section${i % 2 ? ' mhb-section--alt' : ''}" id="${anchorId(p, s)}">
  <div class="mhb-container mhb-narrow">
    <h2 class="mhb-h2">${esc(s.h2)}</h2>
    ${(s.body || []).map((t) => `<p class="mhb-prose-p">${esc(t)}</p>`).join('\n    ')}${bulletsHtml(s.bullets)}
  </div>
</section>`;

const faqsBlock = (p) => p.faqs?.length ? `
<section class="mhb-section" id="faq">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Your Questions Answered</p>
      <h2>Frequently Asked Questions</h2>
    </div>
    <div class="mhb-faq">
      ${p.faqs.map((f) => `<details>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

const relatedBlock = (p) => p.related?.length ? `
<section class="mhb-section mhb-section--alt">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Explore More</p>
      <h2>Related Services</h2>
    </div>
    <div class="mhb-whyus-grid">
      ${p.related.map((r, i) => `<a class="mhb-whyus-item mhb-card-link" href="${r.path}">
        <div class="mhb-whyus-icon">${ic(CARD_ICONS[i % CARD_ICONS.length])}</div>
        <h3>${esc(r.label)}</h3>
        <span class="mhb-tag">Learn more</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

const ctaBlock = (p) => `
<section class="mhb-cta" id="contact">
  <div class="mhb-container">
    <h2>${esc(p.cta?.title || 'Ready to Get Started?')}</h2>
    <p>${esc(p.cta?.body || 'Call today to schedule your visit — same-week appointments are often available and second opinions are always welcome.')}</p>
    <div class="mhb-cta__actions">
      <a class="mhb-btn mhb-btn--primary" href="${PRACTICE.phoneHref}">${ic('phone')} Call ${PRACTICE.phone}</a>
      <a class="mhb-btn mhb-btn--outline-white" href="mailto:${PRACTICE.email}?subject=Appointment%20Request">${ic('calendar')} Email to Book a Visit</a>
    </div>
    <div class="mhb-cta__meta">
      <span>${ic('pin')} ${esc(addr)}</span>
      <span>${ic('clock')} ${PRACTICE.hours.map((h) => h.label).join(' · ')}</span>
    </div>
  </div>
</section>`;

const doctorsCards = () => `
    <div class="mhb-doctors">
      ${DOCTORS.map((d) => `<article class="mhb-doctor">
        ${picture(d.img === IMAGES.drBrown.slug ? IMAGES.drBrown : IMAGES.drKamgang, { sizes: '(max-width: 768px) 92vw, 190px' })}
        <div class="mhb-doctor__body">
          <h3 style="font-family:var(--oe-font-display);font-size:1.15rem;color:var(--oe-navy);margin-bottom:0.2rem;">${esc(d.name)}</h3>
          <span class="mhb-doctor__role">${esc(d.role)}</span>
          <p>${esc(d.bio)}</p>
        </div>
      </article>`).join('\n      ')}
    </div>`;

const insuranceStrip = () => `
<div class="mhb-insurance-strip" aria-label="Insurance and payment options">
  <div class="mhb-container">
    <div class="mhb-insurance-logos">
      ${FINANCING.insurers.map((n) => `<div class="mhb-insurance-logo"><span class="mhb-insurance-logo__icon">${ic('shield')}</span><span>${esc(n)}</span></div>`).join('\n      ')}
    </div>
  </div>
</div>`;

/* ---- treatment: hero → prose sections → FAQ → related → CTA ---- */
const treatmentBody = (p) => pageHero(p)
  + p.sections.map((s, i) => proseSection(p, s, i)).join('\n')
  + faqsBlock(p) + relatedBlock(p) + ctaBlock(p);

/* ---- hub: intro prose → service card grid → remaining prose → FAQ → CTA ---- */
function hubBody(p) {
  const cards = p.sections.filter((s) => s.servicePath);
  const prose = p.sections.filter((s) => !s.servicePath);
  const [first, ...rest] = prose;
  const cardsHtml = `
<section class="mhb-section">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Our Services</p>
      <h2>Explore Every Option</h2>
    </div>
    <div class="mhb-whyus-grid">
      ${cards.map((s, i) => `<a class="mhb-whyus-item mhb-card-link" href="${s.servicePath}">
        <div class="mhb-whyus-icon">${ic(CARD_ICONS[i % CARD_ICONS.length])}</div>
        <h3>${esc(s.h2)}</h3>
        <p>${esc((s.body || []).join(' '))}</p>
        <span class="mhb-tag">Learn more</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>`;
  return pageHero(p)
    + (first ? proseSection(p, first, 1) : '')
    + cardsHtml
    + rest.map((s, i) => proseSection(p, s, i + 1)).join('\n')
    + faqsBlock(p) + ctaBlock(p);
}

/* ---- home: big hero + assembled sections from data + home.json copy ---- */
function homeBody(p) {
  const find = (re) => p.sections.find((s) => re.test(s.h2));
  const why = find(/why fort worth|why .*choose/i);
  const diff = find(/difference/i);
  const located = find(/located|visit us/i);

  const heroHtml = `
<section class="mhb-hero mhb-hero--home" id="top" aria-label="Introduction">
  <div class="mhb-hero__inner">
    <div>
      <p class="mhb-hero__eyebrow">${esc(p.eyebrow)}</p>
      <h1 class="mhb-hero__title">${esc(p.h1)}</h1>
      ${(p.intro || []).slice(0, 1).map((t) => `<p class="mhb-hero__desc">${esc(t)}</p>`).join('')}
      ${p.chips?.length ? `<ul class="mhb-hero__chips" role="list">
        ${p.chips.map((c) => `<li class="mhb-hero__chip">${ic('check')} ${esc(c)}</li>`).join('\n        ')}
      </ul>` : ''}
      <div class="mhb-hero__actions">
        <a class="mhb-btn mhb-btn--teal" href="/contact/">${ic('calendar')} Book Appointment</a>
        <a class="mhb-btn mhb-btn--outline-white" href="${PRACTICE.phoneHref}">${ic('phone')} Call ${PRACTICE.phone}</a>
      </div>
    </div>
    <div class="mhb-hero__media mhb-hero__media--team">
      <div class="mhb-hero__img-wrap">
        ${picture(IMAGES.team, { sizes: '(max-width: 1024px) 92vw, 725px', eager: true })}
      </div>
      <div class="mhb-hero__badge">
        <div class="mhb-hero__badge-icon">${ic('star')}</div>
        <div class="mhb-hero__badge-text"><strong>${PRACTICE.rating.value} ★★★★★</strong><span>${PRACTICE.rating.count}+ Google reviews</span></div>
      </div>
      <div class="mhb-hero__badge-2"><strong>30+</strong><span>years serving Fort Worth</span></div>
    </div>
  </div>
</section>`;

  const statsHtml = `
<section class="mhb-section" aria-label="Key numbers">
  <div class="mhb-container">
    <div class="mhb-stats">
      <div class="mhb-stat"><strong>30+</strong><span>Years serving Fort Worth</span></div>
      <div class="mhb-stat"><strong>4.7★</strong><span>Google rating · 269+ reviews</span></div>
      <div class="mhb-stat"><strong>15</strong><span>General &amp; cosmetic services</span></div>
    </div>
  </div>
</section>`;

  const FEATURED = [
    ['Dental Implants', '/dental-implants/', 'Permanent tooth replacement that looks and feels natural.'],
    ['Dental Crowns', '/treatments/crowns/', 'Natural-looking restorations for damaged or weakened teeth.'],
    ['Root Canal', '/treatments/root-canal/', 'Comfortable, anxiety-free treatment that saves your tooth.'],
    ['Teeth Whitening', '/teeth-whitening/', 'Zoom!® and LaserSmile whitening up to 8 shades brighter.'],
    ['Porcelain Veneers', '/cosmetic-treatments/veneers/', 'Transform your smile in as few as two visits.'],
    ['Clear Braces', '/cosmetic-treatments/clear-braces/', 'Straighter teeth without metal brackets or wires.'],
  ];
  const servicesHtml = `
<section class="mhb-section mhb-section--alt" id="services">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Comprehensive Care</p>
      <h2>One Team for All Your Dental Needs</h2>
      <p class="mhb-section-sub">From routine checkups to complete smile makeovers — explore our <a href="/general-dentistry/">general dentistry</a> and <a href="/cosmetic-dentistry/">cosmetic dentistry</a> services.</p>
    </div>
    <div class="mhb-whyus-grid">
      ${FEATURED.map(([label, href, blurb], i) => `<a class="mhb-whyus-item mhb-card-link" href="${href}">
        <div class="mhb-whyus-icon">${ic(CARD_ICONS[i % CARD_ICONS.length])}</div>
        <h3>${esc(label)}</h3>
        <p>${esc(blurb)}</p>
        <span class="mhb-tag">Learn more</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>`;

  const whyHtml = why ? `
<section class="mhb-section">
  <div class="mhb-container">
    <div class="mhb-split" style="align-items:center;">
      <div class="mhb-split__body">
        <div class="mhb-section-head mhb-section-head--left">
          <p class="mhb-eyebrow">The Difference</p>
          <h2>${esc(why.h2)}</h2>
        </div>
        ${(why.body || []).map((t) => `<p>${esc(t)}</p>`).join('\n        ')}${bulletsHtml([...(why.bullets || []), ...(diff?.bullets || [])].slice(0, 6))}
      </div>
      <div class="mhb-photo-card">
        ${picture(IMAGES.operatory, { sizes: '(max-width: 1024px) 90vw, 560px' })}
        <span class="mhb-photo-card__chip">Modern treatment rooms</span>
      </div>
    </div>
  </div>
</section>` : '';

  const doctorsHtml = `
<section class="mhb-section mhb-section--alt" id="doctors">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Meet Your Dentists</p>
      <h2>Experienced, Gentle, and Local</h2>
    </div>
    ${doctorsCards()}
  </div>
</section>`;

  const testimonialsHtml = `
<section class="mhb-section" id="reviews">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Patient Stories</p>
      <h2>What Our Fort Worth Patients Say</h2>
      <p class="mhb-section-sub">Rated ${PRACTICE.rating.value} stars on Google across ${PRACTICE.rating.count}+ verified reviews.</p>
    </div>
    <div class="mhb-testimonials-grid">
      ${TESTIMONIALS.map((t) => `<figure class="mhb-quote">
        <div class="mhb-quote__stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>&ldquo;${esc(t.quote)}&rdquo;</blockquote>
        <figcaption><strong>${esc(t.name)}</strong>${esc(t.detail)}</figcaption>
      </figure>`).join('\n      ')}
    </div>
    <div class="mhb-gallery">
      <div class="mhb-photo-card">${picture(IMAGES.hallway, { sizes: '(max-width: 768px) 92vw, 380px' })}<span class="mhb-photo-card__chip">A warm Texas welcome</span></div>
      <div class="mhb-photo-card">${picture(IMAGES.consult, { sizes: '(max-width: 768px) 92vw, 380px' })}<span class="mhb-photo-card__chip">Care explained clearly</span></div>
      <div class="mhb-photo-card">${picture(IMAGES.waiting, { sizes: '(max-width: 768px) 92vw, 380px' })}<span class="mhb-photo-card__chip">Comfort from the start</span></div>
    </div>
  </div>
</section>`;

  const locatedHtml = located ? proseSection(p, located, 1) : '';

  return heroHtml + statsHtml + servicesHtml + whyHtml + doctorsHtml
    + testimonialsHtml + insuranceStrip() + locatedHtml + faqsBlock(p) + ctaBlock(p);
}

/* ---- about: hero → story → doctors → remaining prose → team photo → quotes ---- */
function aboutBody(p) {
  const team = p.sections.find((s) => /meet our caring team/i.test(s.h2));
  const quotes = p.sections.find((s) => /what patients say/i.test(s.h2));
  const secs = p.sections.filter((s) => s !== team && s !== quotes);
  const [story, ...rest] = secs;

  const doctorsHtml = `
<section class="mhb-section mhb-section--alt">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Your Dentists</p>
      <h2>Two Generations of Fort Worth Dentistry</h2>
    </div>
    ${doctorsCards()}
  </div>
</section>`;

  const teamHtml = `
<section class="mhb-section mhb-section--alt">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Our Team</p>
      <h2>${esc(team?.h2 || 'Meet Our Caring Team')}</h2>
      ${team?.body?.length ? `<p class="mhb-section-sub">${esc(team.body[0])}</p>` : ''}
    </div>
    <div class="mhb-photo-card">${picture(IMAGES.team, { sizes: '(max-width: 1240px) 92vw, 1200px' })}<span class="mhb-photo-card__chip">The Marshall H. Brown, DDS team</span></div>
  </div>
</section>`;

  const quotesHtml = quotes ? `
<section class="mhb-section">
  <div class="mhb-container">
    <div class="mhb-section-head">
      <p class="mhb-eyebrow">Patient Stories</p>
      <h2>${esc(quotes.h2)}</h2>
    </div>
    <div class="mhb-testimonials-grid">
      ${(quotes.body || []).map((q) => `<figure class="mhb-quote">
        <div class="mhb-quote__stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>${esc(q)}</blockquote>
      </figure>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  return pageHero(p)
    + (story ? proseSection(p, story, 1) : '')
    + doctorsHtml
    + rest.map((s, i) => proseSection(p, s, i)).join('\n')
    + teamHtml + quotesHtml + faqsBlock(p) + ctaBlock(p);
}

/* ---- contact: hero → contact cards → remaining prose → CTA ---- */
function contactBody(p) {
  const keep = p.sections.filter((s) => !/request an appointment|office information|office hours/i.test(s.h2));
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query='
    + encodeURIComponent(`${PRACTICE.address.street}, ${PRACTICE.address.city}, ${PRACTICE.address.region} ${PRACTICE.address.zip}`);
  const cardsHtml = `
<section class="mhb-section">
  <div class="mhb-container">
    <div class="mhb-whyus-grid mhb-grid-4">
      <a class="mhb-whyus-item mhb-card-link" href="${PRACTICE.phoneHref}">
        <div class="mhb-whyus-icon">${ic('phone')}</div>
        <h3>Call Us</h3>
        <p>${PRACTICE.phone}<br>Fax: (817) 920-0709</p>
      </a>
      <a class="mhb-whyus-item mhb-card-link" href="mailto:${PRACTICE.email}">
        <div class="mhb-whyus-icon">${ic('mail')}</div>
        <h3>Email Us</h3>
        <p>${PRACTICE.email}</p>
      </a>
      <a class="mhb-whyus-item mhb-card-link" href="${mapsUrl}" rel="noopener">
        <div class="mhb-whyus-icon">${ic('pin')}</div>
        <h3>Visit Us</h3>
        <p>${esc(addr)}<br><strong>Get directions →</strong></p>
      </a>
      <div class="mhb-whyus-item">
        <div class="mhb-whyus-icon">${ic('clock')}</div>
        <h3>Office Hours</h3>
        <p>${PRACTICE.hours.map((h) => h.label).join('<br>')}</p>
      </div>
    </div>
  </div>
</section>`;
  return pageHero(p) + cardsHtml
    + keep.map((s, i) => proseSection(p, s, i + 1)).join('\n')
    + faqsBlock(p) + ctaBlock(p);
}

/* ---- patient-info: hero → anchored prose → insurance strip → FAQ → CTA ---- */
const patientInfoBody = (p) => pageHero(p)
  + p.sections.map((s, i) => proseSection(p, s, i)).join('\n')
  + insuranceStrip() + faqsBlock(p) + ctaBlock(p);

/* ---- privacy: plain hero → prose → CTA ---- */
const privacyBody = (p) => `
<section class="mhb-page-hero">
  <div class="mhb-container">
    <p class="mhb-hero__eyebrow">${esc(p.eyebrow)}</p>
    <h1>${esc(p.h1)}</h1>
    ${(p.intro || []).map((t) => `<p class="mhb-page-hero__lede">${esc(t)}</p>`).join('\n    ')}
  </div>
</section>`
  + p.sections.map((s, i) => proseSection(p, s, i)).join('\n')
  + ctaBlock(p);

const TEMPLATES = {
  treatment: treatmentBody,
  hub: hubBody,
  home: homeBody,
  about: aboutBody,
  contact: contactBody,
  'patient-info': patientInfoBody,
  privacy: privacyBody,
};

/* ---------- build all pages ---------- */
const built = [];

// 1. The dental-implants landing page (hand-crafted body)
const implantsCrumbs = [['Home', '/'], ['General Dentistry', '/general-dentistry/'], ['Dental Implants', '']];
renderPage({
  pagePath: SITE.path,
  metaTitle: SITE.metaTitle,
  metaDesc: SITE.metaDesc,
  ogImage: `${SITE.origin}${IMG_BASE}/${IMAGES.hero.slug}-1200.jpg`,
  jsonLdStr: jsonLd(CANONICAL, FAQS, implantsCrumbs),
  breadcrumbs: implantsCrumbs,
  body: [hero, statsSection, anatomySection, typesSection, stepsSection,
    comparisonSection, doctorsSection, financingSection, realCareSection,
    faqSection, ctaSection].join('\n'),
  extraHead: heroPreload,
});
built.push({ path: SITE.path, priority: '0.9' });

// 2. JSON-driven pages from tools/content/
for (const p of loadPages()) {
  const tpl = TEMPLATES[p.template];
  if (!tpl) { console.warn(`SKIPPED ${p.path} — no template "${p.template}"`); continue; }
  const isHome = p.path === '/';
  renderPage({
    pagePath: p.path,
    metaTitle: p.metaTitle,
    metaDesc: p.metaDesc,
    jsonLdStr: isHome ? jsonLd(SITE.origin + '/', p.faqs, null) : pageJsonLd(p),
    breadcrumbs: isHome ? null : p.breadcrumbs,
    body: tpl(p),
    extraHead: isHome ? `<link rel="preload" as="image" type="image/webp"
    imagesrcset="${srcset(IMAGES.team, 'webp')}"
    imagesizes="(max-width: 1024px) 92vw, 725px" fetchpriority="high">` : '',
  });
  built.push({ path: p.path, priority: isHome ? '1.0' : '0.7' });
}

// 3. Branded 404 (Netlify serves docs/404.html automatically)
renderPage({
  pagePath: '/404/',
  metaTitle: `Page Not Found | ${PRACTICE.name}`,
  metaDesc: 'The page you were looking for could not be found.',
  noindex: true,
  outFile: path.join(DOCS, '404.html'),
  body: `
<section class="mhb-page-hero">
  <div class="mhb-container">
    <p class="mhb-hero__eyebrow">404 — Page Not Found</p>
    <h1>We couldn't find that page</h1>
    <p class="mhb-page-hero__lede">The link may be outdated or the page may have moved. Here are some helpful places to go instead.</p>
    <div class="mhb-hero__actions" style="margin-bottom:0;">
      <a class="mhb-btn mhb-btn--teal" href="/">Go to Homepage</a>
      <a class="mhb-btn mhb-btn--outline-white" href="/dental-implants/">Dental Implants</a>
      <a class="mhb-btn mhb-btn--outline-white" href="/contact/">Contact Us</a>
    </div>
  </div>
</section>`,
});

/* ---------- ancillary files ---------- */
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0d2d4e"/><path d="M9 10c0-3 2.4-4.6 5-4.6 1.6 0 2 .8 2 .8s.4-.8 2-.8c2.6 0 5 1.6 5 4.6 0 4.6-2.4 15-4.6 15-1.5 0-1.2-5.4-2.4-5.4s-.9 5.4-2.4 5.4C11.4 25 9 14.6 9 10z" fill="#00b4a6" transform="translate(-2.5 0.5)"/></svg>`;

const today = process.env.BUILD_DATE ?? new Date().toISOString().slice(0, 10);
const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built
  .sort((a, b) => Number(b.priority) - Number(a.priority) || a.path.localeCompare(b.path))
  .map((b) => `  <url>
    <loc>${SITE.origin}${b.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${b.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`;

/* Secondary domain 301s to the canonical one so the two don't split
   search authority. www → apex is handled by Netlify's primary-domain
   setting. The bare domain now serves the real home page. */
const SECONDARY = 'marshallhbrown.com';
const REDIRECTS = `# Secondary domain → canonical domain (path preserved)
http://${SECONDARY}/*                ${SITE.origin}/:splat                 301!
https://${SECONDARY}/*               ${SITE.origin}/:splat                 301!
http://www.${SECONDARY}/*            ${SITE.origin}/:splat                 301!
https://www.${SECONDARY}/*           ${SITE.origin}/:splat                 301!
`;

/* Fingerprint-free assets are immutable in practice — the filenames encode
   width, and a photo swap changes the slug. */
const HEADERS = `${IMG_BASE}/*
  Cache-Control: public, max-age=31536000, immutable

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
`;

fs.writeFileSync(path.join(DOCS, 'favicon.svg'), FAVICON);
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), SITEMAP);
fs.writeFileSync(path.join(DOCS, 'robots.txt'), ROBOTS);
fs.writeFileSync(path.join(DOCS, '_redirects'), REDIRECTS);
fs.writeFileSync(path.join(DOCS, '_headers'), HEADERS);

console.log(`built ${built.length} pages:`);
for (const b of built.sort((a, b) => a.path.localeCompare(b.path))) console.log('  ' + b.path);
console.log('wrote 404.html, favicon.svg, sitemap.xml, robots.txt, _redirects, _headers');
