# Work Completed — Marshall H. Brown, DDS Website

**Status:** 🟢 Live at **https://marshallbrowndds.com**
**Repo:** [Emerge-AI/brown-landing-page](https://github.com/Emerge-AI/brown-landing-page) (public)
**Host:** Netlify (`endearing-pavlova-69c554`), auto-deploys on push to `main`
**Last updated:** 2026-08-05

---

## 1. Research & discovery

- Explored the **Ohio Endocrinology Design System** as the design base. Key finding: its palette was originally extracted *from* the Marshall H. Brown site, so the tokens (navy `#0d2d4e`, blue `#1e5fa8`, teal `#00b4a6`, gold `#c8922a`, Inter + Playfair Display) were reused **verbatim** — no rebranding needed, and the result stays on-brand.
- Inventoried the raw photo shoot at `~/Downloads/Patrick` — 49 JPEGs, ~432 MB, 4K–9.5K px. Identified both dentists from embroidered scrubs in contact sheets: **Dr. Marshall H. Brown** and **Dr. Patrick Kamgang**.
- Extracted all copy from the live site `marshallhbrowntx.instawp.xyz`.

## 2. Dental implants landing page

Hand-crafted page rebuilt from the live version (which had broken images):

- Hero, stats strip, implant anatomy, implant types, 6-step process, comparison table, candidate checklist, both doctors, cost & financing, testimonials, FAQ, CTA
- **Custom inline SVG diagrams** — implant cross-section (crown / abutment / titanium post) and three type illustrations, authored from scratch
- **Before/after gallery deliberately omitted** — no real clinical photos exist, and fabricating them would be an E-E-A-T and ethics problem. Replaced with a real-photo "Real patients, real care" section. A commented slot remains in `build.mjs` for genuine case photos later.

## 3. Full site build — 21 pages

Every page's copy extracted from the live site by four parallel agents, then rendered through seven templates:

| Template | Pages |
|---|---|
| `home` | `/` |
| `about` | `/about/` |
| `contact` | `/contact/` |
| `patient-info` | `/patient-info/` (with `#first-visit`, `#insurance`, `#financing` anchors) |
| `privacy` | `/privacy-policy/` |
| `hub` | `/general-dentistry/`, `/cosmetic-dentistry/` |
| `treatment` | 12 service pages (implants, crowns, bridges, dentures, root canal, gum disease, extractions, fillings, sealants, whitening, veneers, bonding, clear braces, inlays/onlays) |

Plus a **branded 404 page** replacing Netlify's default.

**Architecture:** each content page is one JSON file in `tools/content/` (20 files) rendered by `tools/build.mjs`. Adding a page is a data entry — it's picked up automatically, including in the sitemap.

## 4. Site chrome

Rebuilt to match the original site, ported from the design system's reference CSS:

- Utility topbar (address, hours, phone, email, HIPAA badge)
- Sticky header with logo, full desktop nav with **working dropdown menus** (General / Cosmetic / Patient Info)
- **Hamburger slide-out drawer** with accordion submenus
- Breadcrumb bar, hero feature chips
- **Fixed announcement ticker** — 16 rotating messages, CTA pills, WCAG-compliant pause button
- ~60 lines of inline vanilla JS; no framework

## 5. Image pipeline

- `tools/process-images.sh` — selects, resizes, strips EXIF, and encodes **62 renditions** (JPEG + WebP at 480/800/1200/1600/1920) from the raw shoot
- SEO-descriptive filenames, per-image alt text, responsive `<picture>` with `srcset`/`sizes`
- Explicit width/height on every image (no layout shift); hero preloaded with `fetchpriority="high"`, everything else lazy-loaded
- Served from `/assets/img/` so all pages share one cache

## 6. SEO implementation

- Per-page title, meta description, canonical, Open Graph + Twitter cards
- **JSON-LD:** `Dentist` (full NAP, geo, hours, rating, both doctors, `MedicalProcedure`), `FAQPage` generated from the same array as the visible FAQ so they can't drift, `BreadcrumbList`, `WebPage`
- `sitemap.xml` (21 URLs), `robots.txt`, semantic HTML, single `h1` per page, related-service interlinking
- All CSS inlined (no request waterfall); fonts deferred
- **Metric-matched font fallbacks** (`size-adjust` overrides) to eliminate webfont layout shift

### Lighthouse — measured against production

| Metric | Score |
|---|---|
| Performance | **100** (median of 5 runs) |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |
| FCP / LCP / TBT / CLS | 1.2 s / 1.7 s / 0 ms / 0 |

Getting Performance from 93 to 100 took three measured fixes, each isolated by A/B testing rather than guesswork:

1. **Style & layout was 850ms.** The announcement ticker animated a ~10,000px strip continuously during page load, and `backdrop-filter` on the photo chips forced offscreen composites. The ticker now starts on an idle callback ~2.5s after load (identical to a viewer) and the blur became a more opaque background.
2. **First paint waited 2.9s on fonts.** The metric-matched fallback faces had no `font-display`, so they inherited the default block behaviour and held text invisible; the webfonts also cost two third-party connections. Fonts are now self-hosted.
3. **Font payload was 137KB.** Subset to the ~90 glyphs the site actually renders: 80KB total, and the two preloaded faces went from 88KB to 46KB. Filenames carry a content hash so immutable caching stays safe.

## 7. Online appointment booking

`/book/` — a two-step request flow modelled on a modern scheduling widget, styled in the practice's navy/teal:

- **Calendar** driven by real office hours (Mon–Thu 8–4, Fri 8–12). Weekends, past dates, and anything beyond 90 days can't be selected, so the form can never offer a slot the practice isn't open for.
- **Time slots** regenerate per weekday — Friday correctly shows the shorter 8am–12pm schedule.
- **Details form**: first name, last name, phone, email, free-text notes, and a contact-consent checkbox, with inline validation.
- **Explicit expectation-setting**: the page states plainly that a request is *not* a confirmed booking and asks patients to keep medical details out of the free-text field.
- Every "Book Appointment" CTA sitewide now routes here.

**Delivery:** submissions post to a Netlify function (`/api/book`) that emails the front desk through Resend. This avoids Netlify Forms, which is free only to 100 submissions/month before jumping to ~$19/month. Functions (~125k invocations) plus Resend (3,000 emails/month) covers far more volume at **$0**, and owning the endpoint keeps the email provider swappable.

Includes a honeypot spam trap, server-side validation, and error handling that never surfaces a raw exception — a failed send tells the patient to call instead. Lighthouse on `/book/`: Performance 98, Accessibility 100, Best Practices 100, SEO 100.

## 8. Domain, hosting & deployment

- **Canonical domain decision:** `marshallbrowndds.com` set as primary. DNS inspection revealed it was registered 2026-07-22 (2 weeks old, no SEO history, no email), while `marshallhbrown.com` is Cloudflare-managed, serves the existing PBHS site, and carries live EmailArray email. Documented as a deliberate rebrand.
- **GitHub:** repo created under Emerge-AI, made public after a secret scan confirmed no credentials (only staff photos, which the public site serves anyway)
- **Netlify:** connected to the repo for continuous deployment; `netlify.toml` sets publish dir and build command
- **DNS at GoDaddy:** `A @ → 75.2.60.5`, `CNAME www → endearing-pavlova-69c554.netlify.app`, parking record replaced, forwarding confirmed off
- **HTTPS:** Let's Encrypt certificate auto-issued, HTTP→HTTPS upgrade, `www`→apex redirect
- `_redirects` carries 301s from all four `marshallhbrown.com` variants, ready for whenever that domain is migrated

### Live verification

All 21 pages return 200 · valid certificate · www redirects · 404 works · images, sitemap, robots serve correctly · structured data present · every internal link resolves.

## 9. Documentation

- `README.md` — architecture, build/preview commands, how to add a page
- `DNS-INSTRUCTIONS.md` — registrar instructions, corrected after live DNS inspection
- `WORK-COMPLETED.md` — this file

---

## Commit history

```
3e614cf  Correct DNS instructions from live registrar/DNS inspection
32db78d  Build out the full 21-page practice site from the live site's content
b516a36  Add package.json scripts and document the git-based deploy flow
5083aa5  Add SEO-optimized dental implants landing page
```

## Open items

1. **Google Search Console** — property verified; sitemap initially returned "Couldn't fetch" because Google's DNS cache predated the domain going live. Expected to self-resolve; run *Test Live URL* + *Request Indexing* to accelerate.
2. **Google Business Profile** — update the website field to `marshallbrowndds.com`. Highest-impact remaining task for local search.
3. **`marshallhbrown.com` migration** — still serves the old PBHS site and the practice's email. Repointing it will activate the prepared 301s and transfer its search authority. Its DNS is at **Cloudflare, not GoDaddy**. Email (MX) is independent and unaffected.
4. **Verify practice details** — geo coordinates in `PRACTICE.geo` are approximate; Dr. Kamgang's bio wording was inferred from the photo shoot.
5. **Booking email — live and verified.** `marshallbrowndds.com` is DKIM/SPF-verified in Resend, and requests deliver to sylviacastaneda1@gmail.com from `appointments@marshallbrowndds.com`. Confirmed end-to-end through both the API and the live browser form.
6. **Before/after photos** — slot is ready in `build.mjs` if the practice supplies real clinical images.

## Making changes

```sh
# edit tools/content/<page>.json  (copy)  or  css/*.css  (styling)
npm run build      # regenerate docs/
npm run preview    # check at localhost:8317
git push           # deploys automatically in ~1 minute
```
