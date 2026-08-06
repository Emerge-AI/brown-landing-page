# Marshall H. Brown, DDS — Practice Website

Full static site (21 pages) for the Fort Worth dental practice, rebuilt from [marshallhbrowntx.instawp.xyz](https://marshallhbrowntx.instawp.xyz/) with real team/office photography and the Ohio Endocrinology design system (whose palette was originally extracted from the Marshall H. Brown site — same navy/teal/gold, Inter + Playfair Display).

Pages: home, about, contact, patient info, privacy, two service hubs (general/cosmetic), the hand-crafted dental-implants landing page, and 12 treatment pages.

## Layout

```
tools/content.mjs        Practice NAP data, doctors, implants-page copy, image registry
tools/content/*.json     One file per content page (extracted from the live site)
tools/build.mjs          Generator: templates, chrome, JSON-LD, sitemap, 404, robots
tools/process-images.sh  Photo pipeline: raw shoot → resized JPEG + WebP in docs/assets/img
css/                     Design-system tokens + landing/chrome/pages CSS (inlined at build)
netlify.toml             Netlify build config
docs/                    Build output = the domain root. Deploy this directory.
```

## Adding or editing a page

Content pages are data: edit (or add) a JSON file in `tools/content/` — schema: `path`, `template` (`treatment` | `hub` | `home` | `about` | `contact` | `patient-info` | `privacy`), `metaTitle`, `metaDesc`, `breadcrumbs`, `eyebrow`, `h1`, `intro[]`, `chips[]`, `sections[{h2, body[], bullets[]}]`, `faqs[]`, `related[]`, `cta{}` — then `npm run build`. New pages are picked up automatically, including in the sitemap. The implants landing page is the one hand-crafted body (in `build.mjs`).

## Appointment booking

`/book/` is a two-step request flow: a calendar constrained to real office hours, then a details form. It posts JSON to `/api/book` (`netlify/functions/book.mjs`), which emails the front desk via Resend.

**Required env var** (Netlify → Site configuration → Environment variables):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | **Required.** From resend.com. Without it the form returns a "please call us" message. |
| `BOOKING_TO` | Optional. Recipient; defaults to `sylviacastaneda1@gmail.com`. |
| `BOOKING_FROM` | Optional. Verified sender, e.g. `Appointments <appointments@marshallbrowndds.com>`. |

Availability lives in `OFFICE.slotsByDay` in `tools/booking.mjs` — keys are weekday numbers (0 = Sunday). Change the slots there and the calendar follows automatically; weekends, past dates, and anything past `daysAhead` are never selectable.

Cost note: this deliberately avoids Netlify Forms, which is free only to 100 submissions/month and then jumps to ~$19/month. Netlify Functions (~125k invocations/month) plus Resend (3,000 emails/month) covers far more volume at $0, and because the site posts to our own endpoint the email provider can be swapped without touching the front end.

## Domains

`marshallbrowndds.com` is **primary/canonical**. `marshallhbrown.com` is the secondary and 301-redirects to it (rule already in `docs/_redirects`) so the two don't split search authority. The practice email stays `info@marshallhbrown.com` — email and website domains don't need to match.

## Deploying

Repo: **github.com/Emerge-AI/brown-landing-page** (private). Netlify is connected to it, so **every push to `main` redeploys automatically**. `netlify.toml` sets the publish directory (`docs`) and build command (`node tools/build.mjs`).

Normal workflow:

```sh
# edit tools/content.mjs or css/*.css
npm run build          # regenerate docs/
npm run preview        # check at localhost:8317/dental-implants/
git commit -am "..." && git push    # deploys
```

In Netlify: Domain management → `marshallbrowndds.com` set as **primary**, `marshallhbrown.com` added as an alias. HTTPS is issued automatically once DNS resolves.

`docs/` is committed intentionally — it holds the processed image renditions, which are generated from the ~432MB raw shoot that lives outside the repo. Netlify can't regenerate those at build time, so they're version-controlled. Only re-run `npm run images` when changing which photos are used.

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
