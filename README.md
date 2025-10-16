# TheLuxMining

**Luxury Stone Products E-commerce Platform**

Angular 18 | Firebase | Stripe | Multi-language | SSR

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

---

## 📖 Documentation

**Read the full documentation:** [`docs/PROJECT_DOCUMENTATION.md`](./docs/PROJECT_DOCUMENTATION.md)

### Quick Links

- **[Theme Guide](./docs/THEME_GUIDE.md)** - ⚠️ **IMPORTANT: LIGHT GRAY theme!**
- **[Loading Component Guide](./docs/LOADING_COMPONENT_BASE.md)** - How to use LoadingComponentBase
- **[Analytics & Cookies](./docs/ANALYTICS_AND_COOKIES.md)** - GDPR compliance & tracking

---

## ⚠️ CRITICAL: Theme Colors

**This project uses LIGHT GRAY, NOT DARK GRAY!**

When creating new components:
- ✅ Use `bg-ts-bg` (light gray)
- ✅ Use `text-ts-ink` (dark text)
- ❌ Don't use dark backgrounds (`bg-bitcoin-dark`, `bg-gray-900`)

See **[Theme Guide](./docs/THEME_GUIDE.md)** for details.

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── classes/
│   │   │   └── loading-component.base.ts  ← Core architecture
│   │   └── components/                     ← Header, Footer, Navbar
│   ├── pages/                              ← All page components
│   │   ├── admin/                          ← Admin panel
│   │   └── ...                             ← Public pages
│   ├── services/                           ← Business logic
│   └── shared/                             ← Reusable components
└── assets/
    ├── i18n/                               ← Translations (es, en, fr, it)
    └── ...
```

---

## ✨ Features

- 🌐 **Multi-language** (ES, EN, FR, IT)
- 🛒 **E-commerce** with Stripe integration
- 👨‍💼 **Admin Panel** for content management
- 📊 **Analytics** with Firebase (GDPR compliant)
- 🖼️ **Gallery** with Firebase Storage
- 📱 **Responsive Design** with Tailwind CSS
- 🚀 **SSR** for SEO optimization
- ⚡ **Performance Optimized** with LoadingComponentBase

---

## 🛠️ Tech Stack

- **Frontend:** Angular 18 (standalone components)
- **Backend:** Firebase (Firestore, Storage, Analytics, Auth)
- **Styling:** Tailwind CSS + SCSS
- **Payments:** Stripe
- **Email:** Brevo
- **i18n:** @ngx-translate/core
- **Deployment:** Firebase Hosting

---

## 📦 Key Services

| Service | Purpose |
|---------|---------|
| `LoadingComponentBase` | Centralized loading state management |
| `AnalyticsService` | Firebase Analytics tracking |
| `ConsentService` | Cookie consent & GDPR |
| `ProductFirestoreService` | Product CRUD operations |
| `GalleryService` | Gallery management |
| `CartService` | Shopping cart logic |
| `OrderService` | Order management |
| `EmailService` | Email integration (Brevo) |

---

## 🧪 Development

### Create New Component

Always extend `LoadingComponentBase` for Firebase operations:

```typescript
import { LoadingComponentBase } from '../../core/classes/loading-component.base';

export class YourComponent extends LoadingComponentBase {
  constructor(private firestore: Firestore) {
    super();
  }
  
  async ngOnInit() {
    await this.withLoading(async () => {
      this.data = await this.loadData();
    });
  }
}
```

### Follow Theme Guidelines

```html
<!-- ✅ Correct -->
<div class="bg-ts-bg text-ts-ink">
  <h1 class="font-serif text-luxury-gold">Title</h1>
</div>

<!-- ❌ Wrong -->
<div class="bg-bitcoin-dark text-white">
  Don't use dark theme!
</div>
```

---

## 📊 Analytics

**Production Only:** Analytics disabled in development mode.

**Tracked Events:**
- Page views (automatic)
- Contact form submissions
- User interactions

**Check Analytics:** Firebase Console → Analytics → Realtime

---

## 🔐 Security

- ✅ Firebase API keys (public, safe to commit)
- ✅ Firestore security rules
- ✅ Admin guard for protected routes
- ⚠️ Update Stripe live key before production

---

## 🚀 Deployment

```bash
# Build production
ng build --configuration=production

# Deploy to Firebase
firebase deploy

# Deploy hosting only
firebase deploy --only hosting
```

---

## ✅ Status

**Current Version:** 2.0  
**Branch:** feature/cart  
**Status:** Production Ready ✅

### Completed

- ✅ LoadingComponentBase migration (10 components)
- ✅ Firebase Analytics & GDPR compliance
- ✅ Multi-language support
- ✅ Stripe integration
- ✅ Admin panel
- ✅ Performance optimization
- ✅ SSR configuration

### Testing

- [ ] Final production testing
- [ ] Stripe live mode testing
- [ ] Multi-device testing
- [ ] SEO verification

---

## 📞 Support

**Documentation:** See `docs/` folder  
**Issues:** Check legacy docs in `docs/legacy/` for historical context

---

**Built with ❤️ by xsantcastx**
