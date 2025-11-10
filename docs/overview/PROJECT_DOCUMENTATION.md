# TheLuxMining - Complete Project Documentation

**Last Updated:** October 16, 2025  
**Status:** ✅ Production Ready  
**Framework:** Angular 18 SSR  
**Database:** Firebase (Firestore + Storage + Analytics)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Architecture](#architecture)
4. [Theme System](#theme-system)
5. [Key Features](#key-features)
6. [Technical Implementation](#technical-implementation)
7. [Development Guidelines](#development-guidelines)
8. [Deployment](#deployment)

---

## 🎯 Project Overview

**TheLuxMining** is a luxury stone products e-commerce platform built with Angular 18 featuring:

- 🌐 **Multi-language Support** (ES, EN, FR, IT)
- 🛒 **E-commerce System** with Stripe integration
- 👨‍💼 **Admin Panel** for product/gallery/order management
- 📊 **Analytics & GDPR Compliance** with cookie consent
- 🖼️ **Dynamic Gallery** with Firebase Storage
- 📱 **Responsive Design** with modern luxury aesthetics
- 🚀 **SSR (Server-Side Rendering)** for SEO optimization

---

## ✅ Current Status

### Completed Features

✅ **Core Infrastructure**
- LoadingComponentBase architecture (eliminates code duplication)
- Firebase integration (Firestore + Storage + Analytics)
- Multi-language i18n system
- SSR configuration

✅ **User-Facing Features**
- Product catalog with categories & filters
- Technical specifications viewer
- Gallery with categorization
- Contact form with email integration (Brevo)
- Shopping cart functionality
- Stripe checkout integration

✅ **Admin Panel**
- Product management (CRUD operations)
- Quick add/edit forms with templates
- Gallery upload & management
- Order tracking system
- User management
- Catalog structure editor
- Benefit templates system

✅ **Analytics & Privacy**
- Firebase Analytics (production-only)
- Google Consent Mode v2
- Cookie consent banner
- GDPR compliant

✅ **Performance**
- Scroll-to-load bug FIXED
- 10 components migrated to LoadingComponentBase
- ~150 lines of duplicate code eliminated
- User confirmed "100% faster"

---

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── classes/
│   │   │   └── loading-component.base.ts  ← IMPORTANT!
│   │   ├── components/
│   │   │   ├── footer/
│   │   │   ├── header/
│   │   │   └── navbar/
│   │   └── services/            # Shared services
│   ├── features/                # Feature modules
│   │   ├── contacto/
│   │   ├── datos-tecnicos/
│   │   ├── galeria/
│   │   ├── home/
│   │   └── productos/
│   ├── pages/                   # Page components
│   │   ├── admin/               # Admin panel
│   │   ├── client/              # Client area
│   │   ├── cart/
│   │   ├── contacto/
│   │   ├── datos-tecnicos/
│   │   ├── galeria/
│   │   ├── home/
│   │   ├── not-found/
│   │   └── productos/
│   ├── services/                # Business logic services
│   ├── shared/                  # Shared components/utilities
│   └── models/                  # TypeScript interfaces
├── assets/
│   ├── data/                    # JSON data files
│   ├── i18n/                    # Translation files (es, en, fr, it)
│   ├── productos/               # Product images
│   └── galeria/                 # Gallery images
├── environments/                # Environment configs
└── styles/                      # Global styles
```

### Key Services

| Service | Purpose | Location |
|---------|---------|----------|
| `LoadingComponentBase` | Centralized loading state management | `core/classes/` |
| `AnalyticsService` | Firebase Analytics tracking | `services/` |
| `ConsentService` | Cookie consent & GDPR compliance | `services/` |
| `ProductFirestoreService` | Product CRUD operations | `services/` |
| `GalleryService` | Gallery management | `services/` |
| `MediaService` | Firebase Storage uploads | `services/` |
| `CartService` | Shopping cart logic | `services/` |
| `OrderService` | Order management | `services/` |
| `EmailService` | Brevo email integration | `services/` |

---

## 🎨 Theme System

### ⚠️ CRITICAL: Color Scheme

**IMPORTANT:** The theme uses **LIGHT GRAY, NOT DARK GRAY**

When creating new sections or components, always use:

```scss
// ✅ CORRECT - Light gray theme
background-color: #f5f5f5;  // Light gray
background-color: #e0e0e0;  // Medium light gray
color: #333333;             // Dark text on light background

// ❌ WRONG - Don't use dark grays
background-color: #1a1a1a;  // Too dark!
background-color: #2a2a2a;  // Too dark!
```

### Theme Variables (Tailwind)

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      ts: {
        bg: "var(--ts-bg)",           // Light background
        'bg-soft': "var(--ts-bg-soft)", // Softer light bg
        ink: "var(--ts-ink)",         // Dark text
        'ink-soft': "var(--ts-ink-soft)", // Medium text
        accent: "var(--ts-accent)",   // Accent color
        line: "var(--ts-line)",       // Border color
        paper: "var(--ts-paper)"      // Card background (light)
      },
      bitcoin: {
        orange: '#f7931a',   // Bitcoin orange
        gold: '#ffb81c',     // Gold accent
        'dark': '#0a0b0d',   // Only for Bitcoin-themed elements
        'gray': '#13151a',   // Only for Bitcoin-themed elements
      },
      luxury: {
        gold: '#d4af37',     // Luxury gold
        silver: '#c0c0c0',   // Luxury silver
        bronze: '#cd7f32',   // Luxury bronze
      }
    }
  }
}
```

### Font System

```scss
font-family: {
  serif: "Playfair Display"  // Headings & luxury elements
  sans: "Inter"              // Body text & UI elements
}
```

### Using the Theme

```html
<!-- ✅ CORRECT - Light theme example -->
<div class="bg-ts-bg text-ts-ink">
  <h1 class="font-serif text-luxury-gold">Luxury Products</h1>
  <p class="font-sans text-ts-ink-soft">Description text...</p>
  <div class="bg-ts-paper border border-ts-line rounded-lg p-6">
    Card content...
  </div>
</div>

<!-- ❌ WRONG - Don't use bitcoin-dark for general sections -->
<div class="bg-bitcoin-dark text-white">
  This should only be used for Bitcoin-themed elements!
</div>
```

---

## ✨ Key Features

### 1. LoadingComponentBase Architecture

**Purpose:** Eliminates code duplication in components loading Firebase data.

**How to Use:**
```typescript
import { LoadingComponentBase } from '../../core/classes/loading-component.base';

export class YourComponent extends LoadingComponentBase implements OnInit {
  
  constructor(private firestore: Firestore) {
    super(); // ← Required if you have a constructor
  }
  
  async ngOnInit() {
    // Automatic loading state & change detection
    await this.withLoading(async () => {
      this.data = await this.loadData();
    });
  }
}
```

**Benefits:**
- ✅ Automatic `isLoading` state management
- ✅ Automatic change detection (`cdr.detectChanges()`)
- ✅ Built-in error handling
- ✅ 10-15 fewer lines per component
- ✅ Fixes scroll-to-load issues

**Migrated Components (10 total):**
1. galeria.page.ts
2. productos.page.ts
3. home.page.ts
4. products-admin.page.ts
5. quick-add-product.page.ts
6. gallery-admin.page.ts
7. catalog-admin.page.ts
8. dashboard.page.ts
9. users-admin.page.ts
10. benefit-templates-admin.page.ts

### 2. Firebase Analytics & Cookie Consent

**Status:** ✅ 100% GDPR Compliant

**Features:**
- Google Consent Mode v2
- Cookie consent banner (Accept/Reject/Customize)
- Production-only analytics (no tracking in dev)
- Automatic page view tracking
- Custom event tracking ready

**Tracked Events:**
- Page views (automatic)
- Contact form submissions
- Form interactions (start/submit/error)
- Ready for: product clicks, gallery clicks, CTAs

**Consent Categories:**
- Analytics (Firebase Analytics)
- Marketing (ad storage, personalization)
- Preferences (user settings)
- Security (always granted - essential cookies)

**How to Add Tracking:**
```typescript
// In any component
constructor(private analyticsService: AnalyticsService) {}

// Track custom event
trackProductClick(product: Product) {
  this.analyticsService.trackProductClick(
    product.name, 
    product.categoryId
  );
}
```

### 3. Multi-Language Support

**Languages:** ES (Spanish), EN (English), FR (French), IT (Italian)

**Translation Files:** `src/assets/i18n/[lang].json`

**Usage:**
```html
<!-- In templates -->
<h1>{{ 'home.title' | translate }}</h1>
<p>{{ 'products.description' | translate }}</p>

<!-- With parameters -->
<p>{{ 'cart.total' | translate: {price: totalPrice} }}</p>
```

```typescript
// In components
constructor(private translate: TranslateService) {}

ngOnInit() {
  this.translate.use('es'); // Set language
}
```

### 4. Admin Panel Features

**Product Management:**
- Full CRUD operations
- Quick add/edit with templates
- Benefit templates system
- Image upload to Firebase Storage
- Category & material management
- SEO-friendly slug generation

**Gallery Management:**
- Upload images with tags/captions
- Organize by categories
- Publish/unpublish control
- Firebase Storage integration

**Order Management:**
- View all orders
- Track order status
- Email notifications via Brevo

**User Management:**
- View registered users
- Manage admin roles
- Track user activity

### 5. E-commerce System

**Cart Functionality:**
- Add/remove products
- Quantity management
- Real-time price calculation
- Persist cart in localStorage
- Shipping calculator

**Stripe Integration:**
- Secure checkout
- Test mode configured
- Webhook for order confirmation
- Production-ready (needs live key)

**Order Flow:**
1. User adds products to cart
2. Fills shipping information
3. Proceeds to Stripe checkout
4. Payment processed
5. Webhook confirms order
6. Order saved to Firestore
7. Email confirmation sent (Brevo)

---

## 🛠️ Technical Implementation

### LoadingComponentBase (Core Architecture)

**File:** `src/app/core/classes/loading-component.base.ts`

**What It Does:**
- Provides base class for all components loading Firebase data
- Automatically manages `isLoading` state
- Automatically triggers change detection
- Eliminates 150+ lines of duplicate code

**API:**

```typescript
// Wrap async operations
await this.withLoading(async () => {
  this.data = await this.service.getData();
}, showError?: boolean);

// Manual control
this.setLoading(true);
this.setLoading(false);
this.setError('Error message');
this.clearError();
this.forceUpdate(); // Force change detection
```

**Migration Pattern:**
1. Import `LoadingComponentBase`
2. Extend class: `extends LoadingComponentBase`
3. Remove manual `isLoading`, `cdr` declarations
4. Add `super()` in constructor (if exists)
5. Wrap async operations with `withLoading()`
6. Remove manual `cdr.detectChanges()` calls

### Firebase Configuration

**Services Used:**
- Firestore (database)
- Storage (images)
- Analytics (user tracking)
- Authentication (admin login)

**Security:**
- Firebase API keys are public (safe to commit)
- Security handled by Firestore rules
- Admin access controlled by custom claims

**Environment Files:**
```typescript
// environment.ts (development)
{
  production: false,
  firebase: { /* config */ },
  useEmulators: true  // Local development
}

// environment.prod.ts (production)
{
  production: true,
  firebase: { /* config */ },
  useEmulators: false  // Live Firebase
}
```

### Firestore Collections

```
firestore/
├── products/           # Product catalog
├── media/              # Gallery images metadata
├── categories/         # Product categories
├── materials/          # Stone materials
├── sizeGroups/         # Size configurations
├── benefitTemplates/   # Product benefit templates
├── orders/             # Customer orders
└── users/              # User accounts
```

### SSR (Server-Side Rendering)

**Configured for:**
- SEO optimization
- Faster initial page load
- Social media preview cards

**Important:** All browser-only code wrapped in:
```typescript
if (isPlatformBrowser(this.platformId)) {
  // Browser-only code
}
```

---

## 📖 Development Guidelines

### Creating New Components

**Always Follow This Pattern:**

```typescript
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingComponentBase } from '../../core/classes/loading-component.base';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonModule, /* ... */],
  templateUrl: './your-component.html',
  styleUrl: './your-component.scss'
})
export class YourComponent extends LoadingComponentBase implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  constructor(private yourService: YourService) {
    super(); // ← Required!
  }
  
  async ngOnInit() {
    // Browser-only code
    if (isPlatformBrowser(this.platformId)) {
      await this.withLoading(async () => {
        this.data = await this.yourService.getData();
      });
    }
  }
}
```

### Styling Guidelines

**ALWAYS use LIGHT GRAY theme:**

```scss
// ✅ CORRECT
.your-section {
  background-color: #f5f5f5;  // Light gray
  color: #333333;              // Dark text
  border: 1px solid #e0e0e0;  // Light border
  
  .card {
    background-color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
}

// ❌ WRONG
.your-section {
  background-color: #1a1a1a;  // Too dark!
  color: white;                // Light text on dark (wrong theme)
}
```

**Use Tailwind Classes:**

```html
<!-- Light theme components -->
<div class="bg-ts-bg text-ts-ink">
  <h1 class="font-serif text-luxury-gold text-4xl">Heading</h1>
  <div class="bg-ts-paper border border-ts-line rounded-lg p-6">
    <p class="text-ts-ink-soft">Content...</p>
  </div>
</div>
```

### Adding Firebase Data

**Always Use LoadingComponentBase:**

```typescript
// Load data from Firestore
async loadProducts() {
  await this.withLoading(async () => {
    const productsRef = collection(this.firestore, 'products');
    const snapshot = await getDocs(productsRef);
    this.products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
}

// Upload to Storage
async uploadImage(file: File) {
  await this.withLoading(async () => {
    const path = `products/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    this.imageUrl = await getDownloadURL(snapshot.ref);
  }, true); // Show errors
}
```

### Analytics Tracking

**Add Tracking to User Interactions:**

```typescript
// In component
constructor(private analyticsService: AnalyticsService) {}

// Track events
trackProductView(product: Product) {
  this.analyticsService.trackProductClick(
    product.name,
    product.categoryId
  );
}

trackFormSubmit() {
  this.analyticsService.trackFormSubmit('contact_form');
}

trackCTA(buttonName: string) {
  this.analyticsService.trackCTAClick(buttonName, 'homepage');
}
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build production bundle
ng build --configuration=production

# Output in dist/ folder
# Ready to deploy to Firebase Hosting or any static host
```

### Firebase Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

### Environment Setup

**Production Checklist:**

1. ✅ Update `environment.prod.ts` with production Firebase config
2. ✅ Add Stripe live key (replace test key)
3. ✅ Configure Brevo API key for email
4. ✅ Set up Firestore security rules
5. ✅ Configure Storage rules
6. ✅ Set up custom domain (if needed)
7. ✅ Enable Firebase Analytics in console

### Stripe Setup

**Test Mode (Current):**
- Using test key: `pk_test_...`
- Test card: `4242 4242 4242 4242`

**Production Mode:**
1. Get live key from Stripe dashboard
2. Update `environment.prod.ts`:
   ```typescript
   stripePublicKey: 'pk_live_...' // Replace
   ```
3. Set up webhook endpoint
4. Configure webhook secret
5. Test with real payment method

### Email Setup (Brevo)

**Current Config:**
- API key in environment files
- Contact form sends emails
- Order confirmation emails ready

**To Verify:**
1. Check Brevo dashboard for API key
2. Test contact form submission
3. Verify email templates
4. Set up order notification templates

---

## 📊 Analytics & Monitoring

### Firebase Analytics

**Check Analytics:**
1. Open Firebase Console
2. Navigate to Analytics → Dashboard
3. View real-time data
4. Check Events → page_view

**Tracked Events:**
- `page_view` (automatic)
- `contact_form_start`
- `contact_form_submit`
- `contact_form_error`

**Add More Tracking:**
- Product views/clicks
- Gallery interactions
- CTA button clicks
- Add to cart events
- Checkout initiated
- Purchase completed

### Error Monitoring

**Console Errors:**
All errors logged to browser console in development.

**Recommendations:**
- Add Sentry for production error tracking
- Set up Firebase Crashlytics
- Monitor Firebase Console for quota issues

---

## 🔐 Security

### API Keys (Safe to Commit)

✅ **Firebase API Keys:** Public by design, safe in code  
✅ **Stripe Test Key:** Public test key, safe in code  
⚠️ **Stripe Live Key:** Add to environment.prod.ts (public, but track usage)  
⚠️ **Brevo API Key:** Currently in environment files (consider moving to server)

### Firestore Security Rules

**Location:** `firestore.rules`

**Current Rules:**
- Products: Public read, admin write
- Gallery: Public read, admin write
- Orders: User read own, admin read all
- Users: User read own, admin read all

### Admin Access

**Auth Guards:**
- `auth.guard.ts` - Protects authenticated routes
- `admin.guard.ts` - Protects admin routes

**Admin User Setup:**
```typescript
// Use seed script
npm run seed-admin

// Or manually in Firebase Console
// Add custom claim: { admin: true }
```

---

## 🧪 Testing

### Manual Testing Checklist

**Before Production:**

- [ ] Test all public pages (home, products, gallery, contact)
- [ ] Test product filtering and search
- [ ] Test cart add/remove/update
- [ ] Test Stripe checkout (test mode)
- [ ] Test contact form submission
- [ ] Test multi-language switching
- [ ] Test cookie consent banner
- [ ] Test admin login
- [ ] Test product CRUD operations
- [ ] Test gallery upload
- [ ] Test order management
- [ ] Test on mobile devices
- [ ] Test SEO meta tags
- [ ] Verify analytics in Firebase Console

### Unit Tests

```bash
# Run unit tests
ng test

# Run with coverage
ng test --code-coverage
```

### E2E Tests

```bash
# Install Playwright (recommended)
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

---

## 📝 Important Notes

### Theme Reminder

**⚠️ CRITICAL: ALWAYS USE LIGHT GRAY, NOT DARK GRAY**

When AI or developers create new components:
- Default to light backgrounds (#f5f5f5, white)
- Use dark text on light backgrounds
- Only use dark colors for accents/Bitcoin elements
- Follow existing component patterns

### Performance

**Current Status:**
- ✅ Scroll-to-load bug FIXED
- ✅ LoadingComponentBase reduces re-renders
- ✅ SSR improves initial load
- ✅ Images optimized in Firebase Storage

**Recommendations:**
- Add lazy loading for images
- Implement virtual scrolling for long lists
- Add pagination to product catalog
- Cache Firebase queries

### SEO

**Current:**
- ✅ SSR enabled
- ✅ Meta tags configured
- ✅ Sitemap ready

**Improve:**
- Add structured data (JSON-LD)
- Generate dynamic meta tags per product
- Add Open Graph tags for social sharing
- Submit sitemap to Google Search Console

---

## 🔄 Migration Status

### Completed Migrations

**LoadingComponentBase (10 components):**
1. ✅ galeria.page.ts
2. ✅ productos.page.ts
3. ✅ home.page.ts
4. ✅ products-admin.page.ts
5. ✅ quick-add-product.page.ts
6. ✅ gallery-admin.page.ts
7. ✅ catalog-admin.page.ts
8. ✅ dashboard.page.ts
9. ✅ users-admin.page.ts
10. ✅ benefit-templates-admin.page.ts

**Result:**
- ~150 lines of code eliminated
- Performance improved dramatically
- User confirmed "100% faster"

### Future Migrations

**Consider Migrating:**
- Client area pages (profile, orders)
- Datos técnicos page
- Any new admin pages

---

## 📞 Support & Resources

### Documentation

- **This Document:** Complete project overview
- **LOADING_COMPONENT_BASE.md:** API reference for base class
- **ANALYTICS_AND_COOKIES.md:** Analytics implementation details
- **Legacy Docs:** Moved to `docs/legacy/` folder

### External Resources

- [Angular Documentation](https://angular.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [TranslateModule](https://github.com/ngx-translate/core)

### Quick Commands

```bash
# Development
npm start                    # Start dev server
npm run build               # Build production
npm run test                # Run tests

# Firebase
firebase serve              # Local Firebase hosting
firebase deploy             # Deploy to production
firebase deploy --only hosting  # Deploy hosting only

# Admin Seed
npm run seed-admin          # Create admin user
```

---

## ✅ Summary

**TheLuxMining is production-ready with:**

- ✅ Modern Angular 18 architecture
- ✅ Firebase backend fully integrated
- ✅ GDPR-compliant analytics
- ✅ Multi-language support
- ✅ E-commerce with Stripe
- ✅ Admin panel for content management
- ✅ **LIGHT GRAY theme** (not dark!)
- ✅ Performance optimized
- ✅ SEO ready with SSR

**Next Steps:**
1. Final testing on staging
2. Update production environment variables
3. Deploy to Firebase Hosting
4. Monitor analytics and errors
5. Collect user feedback

---

**Last Updated:** October 16, 2025  
**Version:** 2.0  
**Branch:** feature/cart  
**Maintainer:** xsantcastx
