# Marshall H. Brown, DDS — Dental Implants Landing Page

SEO-optimized static landing page for [marshallhbrowntx.instawp.xyz/dental-implants](https://marshallhbrowntx.instawp.xyz/dental-implants/), rebuilt with real team/office photography and the Ohio Endocrinology design system (whose palette was originally extracted from the Marshall H. Brown site — same navy/teal/gold, Inter + Playfair Display).

## Layout

```
tools/content.mjs        All copy, practice NAP data, FAQs, testimonials, image alt text
tools/build.mjs          Static generator: HTML, inline CSS, JSON-LD, sitemap, robots
tools/process-images.sh  Photo pipeline: raw shoot → resized JPEG + WebP renditions
css/                     Design-system tokens, landing.css, chrome.css (inlined at build)
netlify.toml             Netlify build config
docs/                    Build output = the domain root. Deploy this directory.
  ├── dental-implants/   The page itself — path matches the canonical URL
  ├── _redirects         / → /dental-implants/, plus secondary-domain 301s
  ├── _headers           Cache-control for images, security headers
  └── sitemap.xml robots.txt
```

## Domains

`marshallbrowndds.com` is **primary/canonical**. `marshallhbrown.com` is the secondary and 301-redirects to it (rule already in `docs/_redirects`) so the two don't split search authority. The practice email stays `info@marshallhbrown.com` — email and website domains don't need to match.

## Deploying to Netlify

The site is static with no dependencies. Either:

- **Drag and drop** — go to app.netlify.com, drag the `docs/` folder onto the deploy area. Done.
- **CLI** — `npm i -g netlify-cli`, then `netlify deploy --prod --dir docs`.
- **Git** — push the repo and connect it; `netlify.toml` already sets publish dir and build command.

Then in Netlify: Domain settings → add `marshallbrowndds.com` and set it as **primary**, add `marshallhbrown.com` as a domain alias. Netlify issues the HTTPS certificate automatically once DNS resolves.

## Build

```sh
node tools/build.mjs          # regenerates docs/index.html, sitemap.xml, robots.txt
python3 -m http.server 8080 -d docs   # local preview
```

Images only need regenerating when photo selection changes:

```sh
./tools/process-images.sh [source-dir]   # default: /Users/varunkumar/Downloads/Patrick
```

Requires `imagemagick` and `webp` (`brew install imagemagick webp`).

## Site chrome

Full site chrome matching the original site: utility topbar (address / hours / phone / email / HIPAA badge), sticky header with logo, desktop nav with dropdown menus (General / Cosmetic / Patient Info — same items and paths as the live site), hamburger slide-out drawer with accordion submenus, breadcrumb bar, hero feature chips, and the fixed announcement ticker (16 rotating messages with CTAs and a WCAG pause button). Interactivity is ~60 lines of inline vanilla JS. Nav links use the live site's root-relative paths (`/about`, `/treatments/...`) — they 404 on the standalone local preview and resolve once the page is deployed into the real site.

## SEO features

- Meta title/description, canonical, Open Graph + Twitter cards
- JSON-LD `@graph`: `Dentist` (NAP, geo, hours, rating, both doctors, MedicalProcedure) + `FAQPage` (generated from the same array as the on-page FAQ, so they can't drift) + `BreadcrumbList`
- `sitemap.xml`, `robots.txt`, single `h1`, semantic headings/table
- Responsive `<picture>` WebP/JPEG with `srcset`/`sizes`, explicit dimensions (CLS ≈ 0), hero preloaded with `fetchpriority=high`, everything else lazy
- All CSS inlined (no request waterfall); Google Fonts deferred with `media="print"` swap
- Lighthouse (throttled mobile, uncompressed dev server): SEO 100 · Accessibility 100 · Best Practices 100 · Performance 83 (→ ~95 on any host with gzip/brotli)

## Before launch — confirm with the practice

1. **Canonical domain** — assumed `https://marshallhbrown.com/dental-implants/` (from their email domain). One-line change: `SITE.origin`/`SITE.path` in `tools/content.mjs`.
2. **Geo coordinates** in `PRACTICE.geo` are approximate for 1818 8th Ave — verify on Google Maps.
3. **Doctor bios** — Dr. Kamgang's role/relationship to the practice is inferred from the photo shoot; confirm wording.
4. **Before/after gallery** intentionally omitted (no clinical photos exist). A commented slot is in `build.mjs` (`realCareSection`) for when the practice supplies real case photos.
5. **No form backend** — CTAs are `tel:`/`mailto:`. If deploying to Netlify, a Netlify Form can drop into the CTA section.
