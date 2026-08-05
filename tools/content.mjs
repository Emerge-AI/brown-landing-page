/* Single source of truth for all page content.
   Rendered by build.mjs — on-page copy and JSON-LD are generated from the
   same objects so they can never drift. */

export const SITE = {
  // Primary/canonical domain. marshallhbrown.com is the secondary and must
  // 301-redirect here, so the two domains don't split search authority.
  origin: 'https://marshallbrowndds.com',
  path: '/dental-implants/',
  metaTitle:
    'Dental Implants Fort Worth TX | Permanent Tooth Replacement | Marshall H. Brown, DDS',
  metaDesc:
    'Permanent dental implants in Fort Worth, TX from Marshall H. Brown, DDS. 30+ years of experience, 4.7★ on Google, free consultations & 0% financing. Call (817) 920-0882.',
};

export const PRACTICE = {
  name: 'Marshall H. Brown, DDS',
  legalName: 'Marshall H. Brown, DDS — Family & Implant Dentistry',
  phone: '(817) 920-0882',
  phoneHref: 'tel:+18179200882',
  phoneE164: '+18179200882',
  fax: '+18179200709',
  email: 'info@marshallhbrown.com',
  address: {
    street: '1818 8th Avenue',
    city: 'Fort Worth',
    region: 'TX',
    zip: '76110',
  },
  // Approximate coordinates for 1818 8th Ave, Fort Worth 76110 — verify on Google Maps.
  geo: { lat: 32.7146, lng: -97.3452 },
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '08:00', closes: '16:00', label: 'Mon–Thu 8:00am–4:00pm' },
    { days: ['Friday'], opens: '08:00', closes: '12:00', label: 'Fri 8:00am–12:00pm' },
  ],
  rating: { value: 4.7, count: 269 },
  founded: '1990',
  areaServed: ['Fort Worth', 'Arlington', 'Burleson'],
};

export const DOCTORS = [
  {
    name: 'Marshall H. Brown, DDS',
    role: 'Founder · Practicing since 1990',
    img: 'dr-marshall-brown-dds-fort-worth-dentist',
    bio: 'Dr. Brown has cared for Fort Worth families for more than three decades. He founded the practice in 1990 and has placed and restored dental implants for over 30 years, guiding thousands of patients back to healthy, confident smiles.',
  },
  {
    name: 'Patrick Kamgang, DDS',
    role: 'Implant & Family Dentistry',
    img: 'dr-patrick-kamgang-dds-fort-worth-dentist',
    bio: 'Dr. Kamgang combines modern implant techniques with 3D imaging and digital treatment planning. Patients know him for his calm, thorough chairside manner — he walks you through every step so there are no surprises.',
  },
];

/* Images: slug → renditions written by tools/process-images.sh.
   Every rendition of a slug shares one aspect ratio; w/h are the largest. */
export const IMAGES = {
  hero: {
    slug: 'dental-implant-exam-fort-worth-dentist',
    widths: [480, 800, 1200, 1600, 1920],
    w: 1920, h: 1280,
    alt: 'Dr. Patrick Kamgang smiling with a patient in a treatment room at Marshall H. Brown, DDS in Fort Worth, Texas',
  },
  imaging: {
    slug: 'dental-implant-3d-imaging-fort-worth',
    widths: [480, 800, 1200],
    w: 1200, h: 800,
    alt: '3D cone-beam imaging scanner used for dental implant planning at Marshall H. Brown, DDS in Fort Worth',
  },
  consult: {
    slug: 'dental-implant-consultation-fort-worth',
    widths: [480, 800, 1200],
    w: 1200, h: 800,
    alt: 'Dentist reviewing dental implant treatment options chairside with a patient in Fort Worth',
  },
  waiting: {
    slug: 'dental-office-waiting-room-fort-worth',
    widths: [480, 800, 1200],
    w: 1200, h: 800,
    alt: 'Warm, comfortable waiting room at the Marshall H. Brown, DDS dental office in Fort Worth',
  },
  team: {
    slug: 'marshall-h-brown-dds-dental-team-fort-worth',
    widths: [480, 800, 1200, 1600],
    w: 1600, h: 1066,
    alt: 'The full dental team at Marshall H. Brown, DDS in Fort Worth, Texas — doctors, hygienists, and front-office staff',
  },
  drBrown: {
    slug: 'dr-marshall-brown-dds-fort-worth-dentist',
    widths: [480, 800],
    w: 800, h: 1000,
    alt: 'Portrait of Dr. Marshall H. Brown, DDS, founding dentist in Fort Worth, Texas',
  },
  drKamgang: {
    slug: 'dr-patrick-kamgang-dds-fort-worth-dentist',
    widths: [480, 800],
    w: 800, h: 1000,
    alt: 'Portrait of Dr. Patrick Kamgang, DDS, implant dentist at Marshall H. Brown, DDS in Fort Worth',
  },
  hallway: {
    slug: 'dental-office-hallway-fort-worth',
    widths: [480, 800, 1200],
    w: 1200, h: 800,
    alt: 'Hallway of the Marshall H. Brown, DDS dental office in Fort Worth with Texas longhorn decor',
  },
  operatory: {
    slug: 'modern-dental-operatory-fort-worth',
    widths: [480, 800, 1200],
    w: 1200, h: 800,
    alt: 'Modern dental treatment room with advanced equipment at Marshall H. Brown, DDS in Fort Worth',
  },
  teamSmall: {
    slug: 'dental-team-members-fort-worth',
    widths: [480, 800, 1200],
    w: 1200, h: 799,
    alt: 'Dental team members at Marshall H. Brown, DDS in Fort Worth, Texas',
  },
};

export const STATS = [
  { value: '98%', label: 'Implant success rate' },
  { value: 'Lifetime', label: 'How long implants can last' },
  { value: '30+', label: 'Years of experience' },
];

export const ANATOMY = {
  eyebrow: 'The Gold Standard',
  title: 'What Exactly Is a Dental Implant?',
  paragraphs: [
    'A dental implant is a small titanium post — about the size of a natural tooth root — that is surgically placed into your jawbone. Over the following three to six months, the bone fuses with the titanium in a process called osseointegration, creating an anchor as stable as a natural root.',
    'An abutment connector is then attached to the post, and a custom porcelain crown is secured on top. The result looks, feels, and functions exactly like a natural tooth. Unlike bridges, implants never require grinding down healthy neighboring teeth. Unlike dentures, they are permanent, secure, and actually preserve your jawbone.',
  ],
  parts: [
    { name: 'Titanium post', desc: 'Acts as the artificial tooth root, fused permanently into the jawbone.' },
    { name: 'Abutment', desc: 'The connector piece linking the post to the crown above.' },
    { name: 'Porcelain crown', desc: 'The visible tooth — custom-shaded to match your smile.' },
  ],
};

export const TYPES = {
  eyebrow: 'Solutions for Every Situation',
  title: 'Types of Dental Implants We Offer in Fort Worth',
  items: [
    {
      icon: 'tooth',
      tag: 'Most common',
      name: 'Single Tooth Implant',
      desc: 'One titanium post and one custom crown replace a single missing tooth — without touching the healthy teeth on either side.',
    },
    {
      icon: 'bridge',
      tag: '2+ adjacent teeth',
      name: 'Implant-Supported Bridge',
      desc: 'Two or more implant posts anchor a bridge that replaces several adjacent missing teeth — stronger and longer-lasting than a traditional bridge.',
    },
    {
      icon: 'denture',
      tag: 'Full arch',
      name: 'Implant-Supported Dentures',
      desc: 'Four or more implants permanently anchor a full-arch prosthetic. No slipping, no adhesives — eat, speak, and smile with total confidence.',
    },
  ],
};

export const STEPS = {
  eyebrow: 'Step by Step',
  title: 'Your Dental Implant Journey at Our Fort Worth Office',
  items: [
    { name: 'Consultation & Evaluation', meta: 'Day 1', desc: 'A comprehensive exam with 3D imaging to map your bone structure and design your treatment plan. Free, and with zero pressure.' },
    { name: 'Preparatory Procedures', meta: 'If needed', desc: 'Some patients need a bone graft or extraction first. We handle everything in one familiar office.' },
    { name: 'Implant Post Placement', meta: '1–2 hours', desc: 'The titanium post is placed under local anesthesia. Most patients are surprised how comfortable the procedure is.' },
    { name: 'Osseointegration', meta: '3–6 months', desc: 'Your jawbone fuses naturally with the titanium post, creating a foundation as strong as a natural root.' },
    { name: 'Abutment Placement', meta: 'Short visit', desc: 'The small connector that will hold your new crown is attached in a quick, simple appointment.' },
    { name: 'Crown Placement', meta: 'Final visit', desc: 'Your custom porcelain crown is secured, shade-matched to your smile. Walk out with a complete, permanent new tooth.' },
  ],
  note: 'Bone loss begins within 3 months of tooth extraction. The sooner you act, the more bone you preserve — and the simpler your treatment will be.',
};

export const COMPARISON = {
  eyebrow: 'Why Implants Win',
  title: 'Dental Implants vs. Bridges vs. Dentures',
  caption: 'Comparison of dental implants, bridges, and dentures across lifespan, bone health, care, and cost',
  columns: ['Dental Implants', 'Bridges', 'Dentures'],
  rows: [
    { label: 'Lifespan', cells: ['Lifetime (post)', '5–15 years', '5–8 years'], win: 0 },
    { label: 'Preserves jawbone', cells: ['Yes — stimulates bone', 'No', 'No — accelerates loss'], win: 0 },
    { label: 'Affects healthy teeth', cells: ['No', 'Yes — adjacent teeth ground down', 'No'], win: 0 },
    { label: 'Stability', cells: ['Fixed — like natural teeth', 'Fixed', 'Removable, can slip'], win: 0 },
    { label: 'Daily care', cells: ['Brush & floss normally', 'Special floss threaders', 'Nightly removal & soaking'], win: 0 },
    { label: 'Long-term cost', cells: ['Lowest — rarely replaced', 'Moderate — replaced periodically', 'Ongoing — relines, adhesives, replacements'], win: 0 },
  ],
};

export const CANDIDATE = {
  eyebrow: 'Are Implants Right for You?',
  title: 'Who Is a Good Candidate for Dental Implants?',
  intro:
    'Most healthy adults are excellent candidates for dental implants — and age is rarely a barrier. We have successfully placed implants for patients well into their 80s. You are likely a good candidate if:',
  checklist: [
    'You are missing one or more teeth, or facing an extraction',
    'You want a permanent alternative to bridges or dentures',
    'Your gums are healthy (or treatable) and you are in reasonably good overall health',
    'You have adequate jawbone — and if not, bone grafting can rebuild it',
    'You are ready to invest in a solution that can last a lifetime',
  ],
  outro:
    'Not sure? A free consultation with 3D imaging gives you a definitive answer — with no pressure and no obligation. Second opinions are always welcome.',
};

export const FINANCING = {
  eyebrow: 'Investment in Your Smile',
  title: 'Dental Implant Cost & Financing in Fort Worth, TX',
  intro:
    'Every smile is different, so implant costs depend on how many implants you need, whether bone grafting is required, and your insurance coverage. What never changes: you receive a transparent, itemized estimate up front — before any treatment begins.',
  points: [
    'CareCredit accepted, with low and 0% interest financing available',
    'Flexible monthly payment plans to fit your budget',
    'Most major dental insurance plans accepted — we verify your benefits before treatment',
    'Transparent, itemized cost estimates at your free consultation',
  ],
  outro:
    'While implants cost more up front than bridges or dentures, they typically cost less over a lifetime — no replacements, no relines, no adhesives. It is the last tooth-replacement decision most patients ever make.',
  insurers: ['CareCredit', 'Delta Dental', 'Cigna', 'MetLife', 'Aetna', 'Guardian'],
};

export const REAL_CARE = {
  eyebrow: 'Real Patients, Real Care',
  title: 'What Our Implant Patients Say',
  sub: 'Rated 4.7 stars on Google across 269+ verified reviews — and every photo on this page is our real team and our real Fort Worth office.',
};

export const TESTIMONIALS = [
  {
    quote:
      'I had been living with a gap in my smile for three years. Dr. Brown placed my implant and I honestly cannot tell the difference from my real teeth.',
    name: 'Karen S.',
    detail: 'Fort Worth, TX · Single implant',
  },
  {
    quote:
      'I was terrified of the surgery but the doctor walked me through every step. Now it feels and looks exactly like my natural tooth.',
    name: 'Michael R.',
    detail: 'Arlington, TX · Single implant',
  },
  {
    quote:
      'After years of struggling with ill-fitting dentures, my implant-supported dentures have completely changed my life. I can eat steak again!',
    name: 'Barbara T.',
    detail: 'Burleson, TX · Implant-supported denture',
  },
];

export const FAQS = [
  {
    q: 'How long do dental implants last?',
    a: 'The titanium post is designed to last a lifetime once it fuses with your jawbone. The porcelain crown on top typically lasts 15–25 years before it may need replacement — far longer than bridges or dentures.',
  },
  {
    q: 'Is dental implant surgery painful?',
    a: 'The placement is performed under local anesthesia, so you feel no pain during the procedure. Most patients describe only mild soreness for two to three days afterward, easily managed with over-the-counter ibuprofen.',
  },
  {
    q: 'How long does the whole process take?',
    a: 'Start to finish, most implant treatments take three to six months. The majority of that time is simply healing while the implant fuses with your bone — you will only visit the office a handful of times. Bone grafting, if needed, adds some healing time.',
  },
  {
    q: 'Am I too old for dental implants?',
    a: 'There is no upper age limit. We have placed successful implants for patients in their 80s. Your overall health and bone density matter far more than your age.',
  },
  {
    q: 'Will my implant look natural?',
    a: 'Yes. Your crown is custom-crafted from porcelain and shade-matched to your surrounding teeth. Once healed, implants are indistinguishable from natural teeth — to you and to everyone else.',
  },
  {
    q: 'How do I care for a dental implant?',
    a: 'Exactly like a natural tooth: brush twice a day, floss daily, and keep your six-month checkups. No special products, soaking, or adhesives required.',
  },
];

export const CTA = {
  eyebrow: 'Fort Worth Dental Implants',
  title: 'Ready to Reclaim Your Smile?',
  body: 'Schedule your free implant consultation today. Same-week appointments are available, second opinions are welcome, and there is never any pressure — just honest answers about your options.',
};
