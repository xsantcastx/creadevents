We are developing this project using Angular and Firebase. The client’s current website is creadevents.com, which focuses on floral design for events and decorations.
The goal is to redesign and modernize the site with the following enhancements:
•	A fresh, seasonally adaptive design that changes its look and feel throughout the year (spring, summer, autumn, winter).
•	An inspiring and visually engaging interface that captures attention and reflects the creativity of the brand.
•	Key sections such as a gallery, services, and an intuitive contact page to encourage inquiries and bookings.
Sitemap (Top-level)
•	Home
•	Services
•	Portfolio / Gallery
•	Seasonal Collections (Spring · Summer · Autumn · Winter)
•	About
•	Testimonials
•	Blog / Updates (optional)
•	FAQ (optional)
•	Contact / Inquiry
•	(Footer) Privacy, Terms, Instagram, WhatsApp, Email
Key Pages & Features
Home
•	Hero with seasonal background + headline (auto-switches by season)
•	Quick “Featured Works” carousel
•	Services highlights (Weddings, Corporate, Private Events, Installations)
•	Social proof: logos, testimonials snippet
•	Primary CTA: “Request a Quote” · Secondary: “View Gallery”
Services
•	Service detail cards (scope, inclusions, min. budget)
•	Add-ons (delivery, setup, teardown, rentals)
•	CTA banner to Contact
Portfolio / Gallery
•	Filters: Event Type, Style, Season, Color Palette, Location
•	Masonry or grid with lazy-loading and lightbox
•	Each project page: photos, brief story, florals used, venue, testimonial
Seasonal Collections
•	4 subpages (Spring/Summer/Autumn/Winter)
•	Seasonal color palettes, moodboards, featured arrangements
•	“Book this season’s look” CTA
About
•	Brand story, team photos, approach & process
•	Certifications/press badges if any
Testimonials
•	Photo + quote + event tag; slider on mobile
Blog / Updates (optional)
•	“Behind the blooms” posts, venue spotlights, trend guides
Contact / Inquiry
•	Short form (Name, Email, Phone)
•	Event details (Date, Venue/City, Guest count, Budget range, Style notes)
•	File upload for inspiration (jpg/pdf)
•	reCAPTCHA + success page
•	Google Maps embed (studio/coverage area)
Seasonal Adaptation (Auto + Manual)
•	Auto logic: switch by month (e.g., Mar–May = Spring, Jun–Aug = Summer, etc.)
•	Theme tokens: palette, hero image/video, accent illustrations, copy snippets
•	Content slots: seasonal banner, featured collections, gallery filter default
•	Admin override: force a season for promos or hemispheres
Tech Stack (Angular + Firebase)
•	Angular: Standalone components, route-level lazy loading, Angular Animations
•	Firebase Hosting (+ optional Angular Universal for pre-render/SSR)
•	Firestore: content (services, projects, posts, testimonials, settings)
•	Storage: images & documents (with responsive sizes)
•	Cloud Functions: form emailer (SendGrid/Mailgun), image thumbnail generator, reCAPTCHA verification
•	Auth (optional): Admin dashboard login
•	GA4: events for form submits, gallery interactions
Content Model (Firestore Collections)
•	services { title, slug, summary, inclusions[], minBudget, images[] }
•	projects { title, slug, eventType, season[], palette[], location, date, heroImage, gallery[], testimonialRef }
•	testimonials { author, role/event, quote, photo }
•	posts { title, slug, excerpt, body, coverImage, tags[] }
•	settings { themeBySeason { spring: {...}, ... }, contactEmail, socialLinks }
•	inquiries (write-only) { contact fields, event fields, files[], createdAt, status }
Angular Routes (example)
•	/ → HomeComponent
•	/services → ServicesListComponent
•	/services/:slug → ServiceDetailComponent
•	/portfolio → GalleryComponent
•	/portfolio/:slug → ProjectDetailComponent
•	/season/:id → SeasonPageComponent (id: spring|summer|autumn|winter)
•	/about → AboutComponent
•	/testimonials → TestimonialsComponent
•	/blog & /blog/:slug (optional)
•	/contact → ContactComponent
•	/admin (guarded) → content manager
UX & Copy Hooks (client-friendly)
•	Seasonal hero line examples:
o	Spring: “Light, airy blooms for fresh beginnings.”
o	Summer: “Bold color, joyful abundance.”
o	Autumn: “Textured warmth, copper and amber tones.”
o	Winter: “Elegant whites, evergreens, and sparkle.”
•	CTAs: “Request a Quote”, “Plan Your Event”, “Explore Seasonal Looks”
SEO & Performance
•	Prerender key routes (Home, Services, Gallery, Contact)
•	Structured data (Organization, Product/Service, ImageObject)
•	Alt text from Firestore; OpenGraph images per page
•	Lazy-load images; WebP/AVIF; generate responsive sizes in Functions
•	Clean, accessible color contrast and focus states
Admin Dashboard (light CMS)
•	Login with Google (restricted)
•	CRUD for Services, Projects, Testimonials
•	Drag-and-drop gallery ordering
•	Season theme editor (palette, hero, copy)
•	Inquiry inbox (read-only from Firestore; forward via email)
Contact Form (fields)
•	Full name, email, phone (intl mask)
•	Event date (date picker) & flexibility flag
•	Venue/city, guest count
•	Budget range (select)
•	Style selector (chips) + free-text notes
•	Upload inspirations (3–5 files)
•	Consent checkbox (privacy)
Delivery Plan
Phase 1 (Week 1–2): IA, design system, seasonal tokens, Home + Services + Contact
Phase 2 (Week 3–4): Gallery, Project pages, Testimonials, Seasonal pages, form emailer
Phase 3 (Week 5): Admin CMS, SEO, analytics events, polish & launch
If you want, I can turn this into a quick one-page proposal PDF with timelines and budget ranges, or scaffold the Angular routes and Firestore schemas to jump-start dev.

