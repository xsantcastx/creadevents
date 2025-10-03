1) New, simple IA (5 pages max)

Top nav (desktop & mobile):

Home

Services

Portfolio

About

Contact

Hide/remove for now: Seasonal Looks, Client Stories, Journal, Search, Admin Dashboard (keep admin URLs, just don’t show them in the public header).

2) Page blueprints (with image slots you already manage)

Home

Hero → home.header

3 promo tiles → home.promo1, home.promo2, home.promo3

Featured gallery (pull 8–12 newest from section='gallery' or tag featured)

Mini testimonials (optional, text later)

CTA band → home.cta

Services

Header → services.header

3–6 cards (Weddings, Corporate, Private, Installations)

Process steps (Inquiry → Design → Install)

FAQ + CTA

Portfolio

Header → portfolio.header

Filter chips: Weddings, Corporate, Private, Seasonal
(filter by image tag; see Admin improvement below)

Masonry/grid gallery (lazy-loaded)

About

Header → about.header

Story + team photo → about.team

Studio/atelier photo → about.studio

CTA

Contact

Header → contact.header

Lead form (Name, Email/Phone, Event date, Venue/city, Guests, Budget range, Message)

Optional calendar link / WhatsApp

3) Slim slot catalog (so no one needs to “guess” keys)

Update your SITE_SLOTS to only the keys used above:

// src/app/admin/slot-manager/site-slots.ts
export const SITE_SLOTS = {
  home: [
    { key: 'header', label: 'Home Header', section: 'hero' },
    { key: 'cta', label: 'Home CTA Banner', section: 'gallery' },
    { key: 'promo1', label: 'Promo 1', section: 'gallery' },
    { key: 'promo2', label: 'Promo 2', section: 'gallery' },
    { key: 'promo3', label: 'Promo 3', section: 'gallery' },
  ],
  services: [{ key: 'header', label: 'Services Header', section: 'hero' }],
  portfolio: [{ key: 'header', label: 'Portfolio Header', section: 'hero' }],
  about: [
    { key: 'header', label: 'About Header', section: 'hero' },
    { key: 'team', label: 'Team Photo', section: 'about' as any },
    { key: 'studio', label: 'Studio Photo', section: 'about' as any },
  ],
  contact: [{ key: 'header', label: 'Contact Header', section: 'hero' }],
  footer: [{ key: 'logo', label: 'Footer Logo', section: 'footer' as any }],
};


Admins now select Page + Position—no free typing.

4) Routes/layout cleanup (Angular)
// src/app/app.routes.ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'services', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent) },
  { path: 'portfolio', loadComponent: () => import('./pages/portfolio/portfolio.component').then(m => m.PortfolioComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },

  // Admin (not in header)
  { path: 'admin/images', loadComponent: () => import('./admin/images-dashboard/images-dashboard.component').then(m => m.ImagesDashboardComponent) },
  { path: 'admin/slots', loadComponent: () => import('./admin/slot-manager/slot-manager.component').then(m => m.SlotManagerComponent) },

  { path: '**', redirectTo: '' }
];


Header nav (hide Admin, Search, etc.):

<!-- header.component.html -->
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/services">Services</a>
  <a routerLink="/portfolio">Portfolio</a>
  <a routerLink="/about">About</a>
  <a routerLink="/contact">Contact</a>
</nav>


Use your slot images directly:

<!-- home.component.html -->
<slot-img key="home.header" class="hero"></slot-img>

<section class="promos">
  <slot-img key="home.promo1" class="promo"></slot-img>
  <slot-img key="home.promo2" class="promo"></slot-img>
  <slot-img key="home.promo3" class="promo"></slot-img>
</section>

<section class="cta">
  <slot-img key="home.cta" class="cta-img"></slot-img>
</section>

5) Admin improvements (fast wins)

A. Image Tags (for Portfolio filters)

Extend your images with a tags: string[] field in Firestore (/images/{id}).

In Images Dashboard, add a small tags input (comma-separated) and persist to tags.

Portfolio page: query images by tag (or fetch and filter on client for now).

B. “Create defaults for page”

Already supported in Slot Manager upgrade—seed all required slots with one click.

C. Edit-mode overlay

Keep your inline <slot-img> overlay for Change/Clear in place (admin mode). That’s the easiest non-technical workflow.

6) Visual + content system (consistent, elegant)

Palette: off-white background, deep green (#0f3d3e), soft rose (#e7c6c2) accents, charcoal text.

Typography: Playfair Display (headlines), Inter (body).

Spacing: 8px scale (8/16/24/32/48).

Cards: soft shadows, 12–14px radius, generous whitespace.

Buttons: primary (filled green), secondary (ghost).

Image ratios: Hero 16:9, promos 4:3, portfolio 3:2; use object-fit: cover.

7) What to remove right now

Old pages: Seasonal Looks, Client Stories, Journal, Search components/routes.

Any duplicate “galleries” or legacy image grids not using your images collection.

Header links to admin and non-core pages.

Old services/components you’re not rendering after the route reset.

8) Performance & SEO quick wins

Add Cache-Control for /assets/** in firebase.json (1 year, immutable).

Use <link rel="preload" as="image"> for hero.

Add OG/Twitter meta tags per page (title, description, hero image).

Alt text from slot metadata; encourage admins to fill it in.

9) Minimal tasks to land this (today)

Trim routes to the 5 pages and hide extra nav items.

Update SITE_SLOTS to the short list above.

Wire Home/Services/About/Portfolio/Contact to their slot keys (swap hard-coded <img> to <slot-img>).

Add tags to Images Dashboard (optional quick textarea; save as array).

Remove legacy components not used by new routes



A) Minimal 5-page public site (standalone components)
1) Routes (thin IA)

src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'services', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent) },
  { path: 'portfolio', loadComponent: () => import('./pages/portfolio/portfolio.component').then(m => m.PortfolioComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },

  // Admin (keep URLs, hide from public header)
  { path: 'admin/images', loadComponent: () => import('./admin/images-dashboard/images-dashboard.component').then(m => m.ImagesDashboardComponent) },
  { path: 'admin/slots', loadComponent: () => import('./admin/slot-manager/slot-manager.component').then(m => m.SlotManagerComponent) },

  { path: '**', redirectTo: '' }
];


In your public header, keep only: Home, Services, Portfolio, About, Contact.

2) Home

src/app/pages/home/home.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotImgComponent } from '../../components/slot-img/slot-img.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, SlotImgComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}


src/app/pages/home/home.component.html

<slot-img key="home.header" class="hero-img" altDefault="CreaDEvents – Floral Studio"></slot-img>

<section class="promos">
  <slot-img key="home.promo1" class="promo"></slot-img>
  <slot-img key="home.promo2" class="promo"></slot-img>
  <slot-img key="home.promo3" class="promo"></slot-img>
</section>

<section class="cta-band">
  <slot-img key="home.cta" class="cta-img"></slot-img>
</section>


src/app/pages/home/home.component.css

.hero-img { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; border-radius:12px; }
.promos { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; margin:24px 0; }
.promo { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:12px; display:block; }
.cta-band .cta-img { width:100%; aspect-ratio:21/9; object-fit:cover; border-radius:12px; display:block; }

3) Services

src/app/pages/services/services.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotImgComponent } from '../../components/slot-img/slot-img.component';

@Component({
  standalone: true,
  selector: 'app-services',
  imports: [CommonModule, SlotImgComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {}


src/app/pages/services/services.component.html

<slot-img key="services.header" class="hero-img" altDefault="Services"></slot-img>

<section class="cards">
  <article>
    <h3>Weddings</h3>
    <p>Bridal bouquets, ceremony installations, and reception florals tailored to your style.</p>
  </article>
  <article>
    <h3>Corporate</h3>
    <p>Brand-aligned florals for launches, galas, conferences, and seasonal decor.</p>
  </article>
  <article>
    <h3>Private Events</h3>
    <p>Birthdays, showers, intimate dinners — lush arrangements that set the mood.</p>
  </article>
  <article>
    <h3>Installations</h3>
    <p>Large-scale pieces and photo-worthy backdrops for venues and storefronts.</p>
  </article>
</section>

<section class="process">
  <h3>Our Process</h3>
  <ol>
    <li><strong>Inquiry</strong> — tell us date, venue, budget, mood.</li>
    <li><strong>Design</strong> — palette, blooms, mockups, logistics.</li>
    <li><strong>Install</strong> — delivery, setup, strike.</li>
  </ol>
</section>


src/app/pages/services/services.component.css

.hero-img { width:100%; aspect-ratio:16/6; object-fit:cover; border-radius:12px; display:block; }
.cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; margin:24px 0; }
.cards article { background:#fff; border:1px solid #eee; border-radius:12px; padding:16px; }
.process { margin:24px 0; }

4) Portfolio (with tag filters)

Add tags to images — see Section B below — then use this page.

src/app/pages/portfolio/portfolio.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotImgComponent } from '../../components/slot-img/slot-img.component';
import { ImageAssetService, ImageDoc } from '../../services/image-asset.service';

@Component({
  standalone: true,
  selector: 'app-portfolio',
  imports: [CommonModule, SlotImgComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  images: ImageDoc[] = [];
  tags: string[] = [];
  active = 'All';

  constructor(private assets: ImageAssetService) {}

  async ngOnInit() {
    // pull the gallery section in display order; we'll filter on client
    this.images = await this.assets.list('gallery');
    this.tags = Array.from(new Set(this.images.flatMap(i => i.tags || []))).sort();
  }

  get filtered() {
    if (this.active === 'All') return this.images;
    const tag = this.active.toLowerCase();
    return this.images.filter(i => (i.tags || []).map(t=>t.toLowerCase()).includes(tag));
  }

  setTag(t: string) { this.active = t; }
}


src/app/pages/portfolio/portfolio.component.html

<slot-img key="portfolio.header" class="hero-img" altDefault="Portfolio"></slot-img>

<div class="filters">
  <button [class.active]="active==='All'" (click)="setTag('All')">All</button>
  <button *ngFor="let t of tags" [class.active]="active===t" (click)="setTag(t)">{{ t }}</button>
</div>

<section class="grid">
  <figure *ngFor="let img of filtered">
    <img [src]="img.url" [alt]="img.alt || img.name" loading="lazy" />
    <figcaption>{{ img.caption }}</figcaption>
  </figure>
</section>


src/app/pages/portfolio/portfolio.component.css

.hero-img { width:100%; aspect-ratio:16/6; object-fit:cover; border-radius:12px; display:block; }
.filters { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
.filters button { border:1px solid #ddd; border-radius:999px; padding:6px 12px; background:#fff; cursor:pointer; }
.filters button.active { background:#0f3d3e; color:#fff; border-color:#0f3d3e; }
.grid { columns: 320px; column-gap: 16px; } /* Masonry-like */
.grid figure { break-inside: avoid; margin: 0 0 16px 0; border-radius:12px; overflow:hidden; border:1px solid #eee; background:#fff; }
.grid img { width:100%; height:auto; display:block; }
figcaption { padding:8px 12px; color:#555; font-size:14px; }

5) About

src/app/pages/about/about.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotImgComponent } from '../../components/slot-img/slot-img.component';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule, SlotImgComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {}


src/app/pages/about/about.component.html

<slot-img key="about.header" class="hero-img" altDefault="About"></slot-img>

<section class="two">
  <slot-img key="about.team" class="photo"></slot-img>
  <div class="copy">
    <h3>Our Story</h3>
    <p>We’re a floral studio crafting timeless arrangements for weddings, events, and brands.</p>
    <p>From concept to install, we design with seasonality, texture, and place in mind.</p>
  </div>
</section>

<section class="two reverse">
  <slot-img key="about.studio" class="photo"></slot-img>
  <div class="copy">
    <h3>The Studio</h3>
    <p>Located in Castellón / Valencia, we source from trusted growers and local markets.</p>
  </div>
</section>


src/app/pages/about/about.component.css

.hero-img { width:100%; aspect-ratio:16/6; object-fit:cover; border-radius:12px; display:block; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:center; margin:24px 0; }
.two.reverse { direction: rtl; }
.two.reverse .copy { direction: ltr; }
.photo { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:12px; }
.copy h3 { margin:0 0 8px; }
@media (max-width:900px){ .two{ grid-template-columns:1fr; } .two.reverse{ direction:ltr; } }

6) Contact

src/app/pages/contact/contact.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotImgComponent } from '../../components/slot-img/slot-img.component';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [CommonModule, SlotImgComponent, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  model = { name:'', email:'', phone:'', date:'', city:'', guests:'', budget:'', message:'' };
  submit() {
    alert('Thanks! We received your inquiry. (Wire this to email/Firestore later.)');
    this.model = { name:'', email:'', phone:'', date:'', city:'', guests:'', budget:'', message:'' };
  }
}


src/app/pages/contact/contact.component.html

<slot-img key="contact.header" class="hero-img" altDefault="Contact"></slot-img>

<form class="form" (ngSubmit)="submit()">
  <input placeholder="Name" [(ngModel)]="model.name" name="name" required />
  <input placeholder="Email" [(ngModel)]="model.email" type="email" name="email" required />
  <input placeholder="Phone" [(ngModel)]="model.phone" name="phone" />
  <input placeholder="Event date" [(ngModel)]="model.date" type="date" name="date" />
  <input placeholder="City / Venue" [(ngModel)]="model.city" name="city" />
  <input placeholder="Guest count" [(ngModel)]="model.guests" name="guests" />
  <select [(ngModel)]="model.budget" name="budget">
    <option value="" disabled selected>Budget range</option>
    <option>€1k–€3k</option><option>€3k–€6k</option><option>€6k–€10k</option><option>€10k+</option>
  </select>
  <textarea placeholder="Tell us about your event…" [(ngModel)]="model.message" name="message" rows="5"></textarea>
  <button type="submit">Send Inquiry</button>
</form>


src/app/pages/contact/contact.component.css

.hero-img { width:100%; aspect-ratio:16/6; object-fit:cover; border-radius:12px; display:block; }
.form { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0 24px; }
.form textarea, .form button { grid-column: 1 / -1; }
input, select, textarea { padding:10px; border:1px solid #ddd; border-radius:10px; }
button { padding:12px; border-radius:10px; border:1px solid #0f3d3e; background:#0f3d3e; color:#fff; cursor:pointer; }
@media (max-width:800px){ .form{ grid-template-columns:1fr; } }

B) Add “tags” to Images Dashboard (for Portfolio filters)
1) Extend the type + update method

src/app/services/image-asset.service.ts — make sure your interface & update allow tags:

export interface ImageDoc {
  id: string;
  section: 'hero'|'gallery'|'services'|'about'|'footer';
  path: string; url: string; name: string;
  order: number; alt?: string; caption?: string; createdAt?: any;
  tags?: string[]; // <-- add
}

// allow patching tags too:
async updateMeta(id: string, patch: Partial<Pick<ImageDoc, 'alt'|'caption'|'tags'>>): Promise<void> { /* unchanged body */ }

2) Add a simple tags input to Images Dashboard

In src/app/admin/images-dashboard/images-dashboard.component.ts:

Extend your edited map to include tags:

this.edited.set(i.id, {
  alt: i.alt ?? '',
  caption: i.caption ?? '',
  tags: (i.tags ?? []).join(', '), // CSV in UI
  dirty: false
});


When marking changes, set dirty = true on tags input as well.

In saveMeta(img), send tags array:

const m = this.meta(img.id);
await this.svc.updateMeta(img.id, {
  alt: m.alt,
  caption: m.caption,
  tags: (m.tags || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
});
m.dirty = false;


In images-dashboard.component.html, add a “Tags” field under Alt/Caption:

<label>
  <span>Tags (comma separated)</span>
  <input
    type="text"
    [ngModel]="meta(img.id)?.tags"
    (ngModelChange)="meta(img.id).tags = $event; markDirty(img.id)" />
</label>


That’s it — admins can tag images like Weddings, Corporate, Private. The Portfolio page auto-pulls the unique tag list and filters on click.

C) Slim slot catalog (only what you use)

src/app/admin/slot-manager/site-slots.ts

import type { Section } from '../../services/image-asset.service';
export type PageKey = 'home'|'services'|'portfolio'|'about'|'contact'|'footer';
export interface SlotDef { key:string; label:string; section:Section; }
export const SITE_SLOTS: Record<PageKey, SlotDef[]> = {
  home: [
    { key:'header', label:'Home Header', section:'hero' },
    { key:'cta',    label:'Home CTA Banner', section:'gallery' },
    { key:'promo1', label:'Promo 1', section:'gallery' },
    { key:'promo2', label:'Promo 2', section:'gallery' },
    { key:'promo3', label:'Promo 3', section:'gallery' },
  ],
  services: [{ key:'header', label:'Services Header', section:'hero' }],
  portfolio: [{ key:'header', label:'Portfolio Header', section:'hero' }],
  about: [
    { key:'header', label:'About Header', section:'hero' },
    { key:'team',   label:'Team Photo',   section:'about' },
    { key:'studio', label:'Studio Photo', section:'about' },
  ],
  contact: [{ key:'header', label:'Contact Header', section:'hero' }],
  footer:  [{ key:'logo',   label:'Footer Logo',    section:'footer' }],
};


(Your Slot Manager with selectors already reads this.)

D) What to delete to reduce clutter

Routes/components: Seasonal Looks, Client Stories, Journal, Search (and their menu items).

Any old galleries not powered by /images.

Header links to Admin; keep admin pages discoverable via direct URL for you.

E) Quick style polish (global)

Use Inter body, Playfair Display headings.

Keep lots of whitespace, 12–14px rounded corners, soft borders (#eee), and consistent image ratios (we set above).

In firebase.json, add long cache for assets (if not already):

{
  "hosting": {
    "public": "dist/creadevents/browser",
    "headers": [
      { "source": "/assets/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
    ],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}

Commit checklist
git checkout feature/dashboard
# create directories:
mkdir -p src/app/pages/home src/app/pages/services src/app/pages/portfolio src/app/pages/about src/app/pages/contact




1) Global theme (colors, fonts, spacing)

src/styles.css (append or replace with this base)

/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap');

:root{
  --bg:#fffaf7;
  --surface:#ffffff;
  --text:#1c1c1c;
  --muted:#6b6b6b;
  --border:#eee;
  --brand:#0f3d3e;      /* deep green */
  --brand-ghost:#e9f4f3;/* soft tint */
  --accent:#e7c6c2;     /* soft rose */
  --radius:14px;
  --container:1120px;
  --pad:16px;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;background:var(--bg);color:var(--text);
  font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  line-height:1.55;
}
h1,h2,h3,.display{
  font-family:"Playfair Display", Georgia, Cambria, "Times New Roman", serif;
  line-height:1.15; letter-spacing:.2px; margin:0 0 .6em;
}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

/* layout helpers */
.container{max-width:var(--container);margin:0 auto;padding:0 var(--pad)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}

/* buttons */
.btn{
  display:inline-flex;align-items:center;gap:8px;
  border:1px solid var(--brand);background:var(--brand);color:#fff;
  padding:10px 14px;border-radius:999px;cursor:pointer;font-weight:600;
}
.btn.ghost{background:transparent;color:var(--brand);border-color:var(--brand)}
.btn.ghost:hover{background:var(--brand-ghost)}
.btn:hover{opacity:.95}

/* utilities */
.stack-24>*{margin-bottom:24px}
.stack-24>*:last-child{margin-bottom:0}

/* hero and common image look */
.hero{border-radius:var(--radius);overflow:hidden}
.hero img{width:100%;height:auto;display:block}


This gives you fonts (Playfair + Inter), soft palette, rounded corners, and simple utilities.

2) Public header (responsive with burger menu)

src/app/components/site-header/site-header.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminModeService } from '../../services/admin-mode.service';

@Component({
  standalone: true,
  selector: 'app-site-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent {
  open = signal(false);
  constructor(public admin: AdminModeService) {}
  toggle(){ this.open.set(!this.open()); }
  close(){ this.open.set(false); }
}


src/app/components/site-header/site-header.component.html

<header class="header">
  <div class="container bar">
    <!-- Brand -->
    <a routerLink="/" class="brand" (click)="close()">
      <div class="brand-mark">
        <span class="logo">CreaDEvents</span>
        <small>Floral Studio & Event Design</small>
      </div>
    </a>

    <!-- Desktop nav -->
    <nav class="nav desktop">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
      <a routerLink="/services" routerLinkActive="active">Services</a>
      <a routerLink="/portfolio" routerLinkActive="active">Portfolio</a>
      <a routerLink="/about" routerLinkActive="active">About</a>
      <a routerLink="/contact" class="btn">Contact</a>
    </nav>

    <!-- Admin chip (only when signed-in; no public link to admin) -->
    <a *ngIf="admin.authed()" routerLink="/admin/slots" class="admin-chip">Admin</a>

    <!-- Burger -->
    <button class="burger" (click)="toggle()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>

  <!-- Mobile drawer -->
  <nav class="nav mobile" [class.open]="open()">
    <a routerLink="/" (click)="close()">Home</a>
    <a routerLink="/services" (click)="close()">Services</a>
    <a routerLink="/portfolio" (click)="close()">Portfolio</a>
    <a routerLink="/about" (click)="close()">About</a>
    <a routerLink="/contact" class="btn" (click)="close()">Contact</a>
    <a *ngIf="admin.authed()" routerLink="/admin/slots" (click)="close()">Admin</a>
  </nav>
</header>


src/app/components/site-header/site-header.component.css

.header{position:sticky;top:0;z-index:50;background:rgba(255,250,247,.9);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--border)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:64px}
.brand{display:flex;align-items:center;gap:10px}
.brand .logo{font-family:"Playfair Display",serif;font-size:22px;font-weight:700;letter-spacing:.2px}
.brand small{color:var(--muted)}

.nav.desktop{display:none;gap:18px;align-items:center}
.nav.desktop a{padding:8px 10px;border-radius:10px}
.nav.desktop a.active{background:var(--brand-ghost);color:var(--brand)}
.nav.desktop .btn{padding:8px 14px}

.admin-chip{display:none;margin-left:auto;margin-right:12px;border:1px solid var(--border);padding:6px 10px;border-radius:999px;background:#fff;color:#444}

.burger{border:1px solid var(--border);background:#fff;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:4px}
.burger span{display:block;width:20px;height:2px;background:#333;border-radius:2px}

.nav.mobile{display:none;border-top:1px solid var(--border);padding:10px}
.nav.mobile a{display:block;padding:10px 4px;border-radius:10px}
.nav.mobile a.btn{margin-top:6px}

@media (min-width:900px){
  .nav.desktop{display:flex}
  .burger{display:none}
  .admin-chip{display:inline-flex}
}
@media (max-width:899px){
  .nav.mobile{display:block;max-height:0;overflow:hidden;transition:max-height .25s ease}
  .nav.mobile.open{max-height:320px}
}

3) Public footer

src/app/components/site-footer/site-footer.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlotImgComponent } from '../slot-img/slot-img.component';

@Component({
  standalone: true,
  selector: 'app-site-footer',
  imports: [CommonModule, RouterLink, SlotImgComponent],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.css']
})
export class SiteFooterComponent {}


src/app/components/site-footer/site-footer.component.html

<footer class="footer">
  <div class="container grid">
    <div class="brand">
      <slot-img key="footer.logo" class="logo" altDefault="CreaDEvents"></slot-img>
      <p class="muted">Floral studio crafting elegant arrangements for weddings, events, and brands.</p>
    </div>

    <nav class="links">
      <a routerLink="/">Home</a>
      <a routerLink="/services">Services</a>
      <a routerLink="/portfolio">Portfolio</a>
      <a routerLink="/about">About</a>
      <a routerLink="/contact">Contact</a>
    </nav>

    <div class="contact">
      <h4>Contact</h4>
      <p>Email: <a href="mailto:hello@creadevents.com">hello@creadevents.com</a></p>
      <p>Instagram: <a href="https://instagram.com" target="_blank" rel="noopener">/creadevents</a></p>
    </div>
  </div>

  <div class="container sub">
    <small>© {{ (new Date()).getFullYear() }} CreaDEvents. All rights reserved.</small>
  </div>
</footer>


src/app/components/site-footer/site-footer.component.css

.footer{margin-top:40px;padding:28px 0 16px;border-top:1px solid var(--border);background:#fff}
.grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:24px}
.brand .logo{width:140px;aspect-ratio:3/1;object-fit:contain;background:#fff;border-radius:10px}
.muted{color:var(--muted)}
.links{display:grid;gap:8px}
.links a{color:#333}
.contact h4{margin:0 0 8px}
.sub{display:flex;justify-content:space-between;padding-top:12px;color:var(--muted)}
@media (max-width:900px){
  .grid{grid-template-columns:1fr;gap:16px}
  .sub{flex-direction:column;gap:8px}
}

4) Drop header + footer into your app shell

Open your root template (usually src/app/app.component.html; if you don’t have one, create it in your root component). Replace its contents with:

<app-site-header></app-site-header>

<main class="container stack-24" style="padding:16px 0 40px;">
  <router-outlet></router-outlet>
</main>

<app-site-footer></app-site-footer>

<!-- Keep the floating admin toolbar for inline edit mode -->
<app-admin-toolbar></app-admin-toolbar>


If your root is a standalone component, import the two components in its imports: [] array:

// app.component.ts (snippet)
imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent, AdminToolbarComponent]

5) (Optional) tiny visual polish on pages

Use the new helpers: wrap page content in <div class="container"> or the <main class="container"> we added already. Replace ad-hoc paddings with stack-24 and the card look for text sections:

<section class="card" style="padding:16px;">
  <h2>Section title</h2>
  <p>Nice copy here.</p>
</section>


What this gives you

Clean, sticky header with mobile drawer and active-link highlight.

Footer with logo slot (footer.logo) and quick links.

Cohesive typography/colors, generous whitespace, rounded cards.

Admin link only visible when signed in; public users see just the 5-page IA.

Everything plays nicely with your slot-based image CMS and inline edit mode.