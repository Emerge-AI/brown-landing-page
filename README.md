# Marshall H. Brown, DDS — Practice Website

Live at **https://marshallbrowndds.com** · 22 static pages · deploys automatically from `main`.

Rebuilt from [marshallhbrowntx.instawp.xyz](https://marshallhbrowntx.instawp.xyz/) with the practice's real team and office photography, on the Ohio Endocrinology design system — whose palette was originally extracted *from* the Brown site, so the tokens carried over verbatim.

Pages: home, about, contact, patient info, privacy, online booking, two service hubs (general/cosmetic), the hand-crafted dental-implants landing page, and 12 treatment pages.

## Layout

```
tools/content.mjs         Practice NAP data, doctors, implants-page copy, image registry
tools/content/*.json      One file per content page (extracted from the live site)
tools/build.mjs           Generator: templates, chrome, JSON-LD, sitemap, 404, robots
tools/booking.mjs         Booking widget markup + client script
tools/process-images.sh   Photo pipeline: raw shoot → JPEG + WebP in docs/assets/img
netlify/functions/book.mjs  Appointment email handler (/api/book)
css/                      Design tokens + landing/chrome/pages/booking CSS (inlined at build)
docs/                     Build output = the domain root. This is what deploys.
```

## Everyday workflow

```sh
npm run build      # regenerate docs/
npm run preview    # http://localhost:8317
git push           # deploys in ~30s
```

Images only need regenerating when the photo selection changes:

```sh
npm run images     # needs: brew install imagemagick webp
```

## Adding or editing a page

Content pages are data. Edit or add a JSON file in `tools/content/`:

`path`, `template` (`treatment` | `hub` | `home` | `about` | `contact` | `patient-info` | `privacy`), `metaTitle`, `metaDesc`, `breadcrumbs`, `eyebrow`, `h1`, `intro[]`, `chips[]`, `sections[{h2, body[], bullets[]}]`, `faqs[]`, `related[]`, `cta{}`

Then `npm run build`. New pages are picked up automatically, including in the sitemap. The dental-implants and booking pages are the two hand-built bodies, in `build.mjs` and `booking.mjs`.

## Appointment booking

`/book/` is a two-step request flow: a calendar constrained to real office hours, then a details form. It posts JSON to `/api/book` (`netlify/functions/book.mjs`), which emails the front desk via Resend.

Environment variables (Netlify → Site configuration → Environment variables):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | **Set.** From resend.com. Without it the form tells patients to call instead. |
| `BOOKING_FROM` | **Set** to `Appointments <appointments@marshallbrowndds.com>`. Must be a Resend-verified domain — the shared `onboarding@resend.dev` sender can only mail your own account address. |
| `BOOKING_TO` | Unset, so it falls back to `sylviacastaneda1@gmail.com`. |

`marshallbrowndds.com` is verified in Resend via DKIM (`resend._domainkey`) plus SPF and a bounce MX on the `send` subdomain. Note the existing root `_dmarc` record is `p=quarantine`, so authentication has to pass or mail goes to spam — don't remove those three records.

Availability lives in `OFFICE.slotsByDay` in `tools/booking.mjs` — keys are weekday numbers (0 = Sunday). Change the slots and the calendar follows; weekends, past dates, and anything beyond `daysAhead` are never selectable.

This deliberately avoids Netlify Forms, which is free only to 100 submissions/month and then jumps to about $19/month. Functions (~125k invocations/month) plus Resend (3,000 emails/month) covers far more volume at $0, and because the site posts to our own endpoint the email provider stays swappable.

## Domains

`marshallbrowndds.com` is primary/canonical, registered 2026-07-22 and pointed at Netlify via GoDaddy DNS.

`marshallhbrown.com` still serves the practice's previous site (PBHS) and their live email, and its DNS is managed at **Cloudflare, not GoDaddy**. It is not part of this deployment. When the practice is ready to retire the old site, pointing that domain at Netlify activates the 301s already written into `docs/_redirects`, transferring its search authority. Email (MX) is independent and unaffected either way.

## Performance

Lighthouse against production — measure there, not locally, since the local dev server sends uncompressed HTML and reads ~15 points low:

| | |
|---|---|
| Performance | 100 (median of 5 runs) |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 |
| FCP / LCP / TBT / CLS | 1.2s / 1.7s / 0ms / 0 |

Three things keep it there, and are easy to undo by accident:

1. **The ticker animation is deferred** to an idle callback ~2.5s after load. Animating that ~10,000px strip during render cost ~350ms of style and layout. `will-change` is deliberately absent.
2. **Fonts are self-hosted and subset** to the ~90 glyphs the site uses, with `font-display: swap` on every face — including the metric-matched fallbacks, which held text invisible for 3s without it. Filenames carry a content hash; `build.mjs` generates the `@font-face` rules and preloads from the files on disk, so they can't drift.
3. **All CSS is inlined**, so there is no request waterfall.

## SEO

Per-page title, meta description, canonical, Open Graph and Twitter cards. JSON-LD: `Dentist` (full NAP, geo, hours, rating, both doctors, `MedicalProcedure`), `FAQPage` generated from the same array as the visible FAQ so they can't diverge, `BreadcrumbList`, and `WebPage`. Plus `sitemap.xml`, `robots.txt`, one `h1` per page, and related-service interlinking.

## Open items

1. **Google Business Profile** — point the website field at `marshallbrowndds.com`. Highest-impact remaining task for local search.
2. **Verify practice details** — `PRACTICE.geo` coordinates are approximate; Dr. Kamgang's bio wording was inferred from the photo shoot.
3. **Before/after photos** — none exist, so the gallery was deliberately omitted rather than faked. A commented slot is ready in `build.mjs`.
