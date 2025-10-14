# Firebase Analytics Implementation - TopStone

## ✅ Implementation Complete

Firebase Analytics with GDPR-compliant cookie consent has been successfully integrated into the TopStone website.

## 🎯 Features Implemented

### 1. **Firebase Analytics Configuration**
- ✅ Analytics enabled in `app.config.ts`
- ✅ Production-only activation (disabled in development)
- ✅ Auto screen tracking (`ScreenTrackingService`)
- ✅ Auto user engagement tracking (`UserTrackingService`)

### 2. **GDPR Consent Mode v2**
- ✅ **ConsentService** (`src/app/services/consent.service.ts`)
  - Google Consent Mode v2 implementation
  - Default to "denied" until user accepts (GDPR compliant)
  - Saves user preferences to localStorage
  - Supports: Analytics, Marketing, Preferences, Essential cookies

### 3. **Cookie Consent Banner**
- ✅ **CookieBannerComponent** (`src/app/shared/components/cookie-banner/`)
  - Beautiful, responsive GDPR-compliant banner
  - Shows on first visit only
  - Three options:
    - "Aceptar todas" - Accept all cookies
    - "Solo esenciales" - Reject analytics/marketing
    - "Personalizar" - Custom preferences modal
  - Persistent across sessions
  - Spanish language interface

### 4. **Analytics Service**
- ✅ **AnalyticsService** (`src/app/services/analytics.service.ts`)
  - Page view tracking (automatic on route changes)
  - Contact form events (`generate_lead`)
  - Product/gallery clicks (`select_content`)
  - CTA tracking
  - Outbound link tracking
  - File download tracking
  - 404 tracking
  - Search tracking
  - Form funnel tracking (start, submit, error)
  - Custom events support

### 5. **Event Tracking Integration**
- ✅ Contact form tracking:
  - `form_start` - When user starts filling form
  - `form_submit` - Successful submission
  - `generate_lead` - Lead generation event
  - `form_error` - Submission errors

## 📁 File Structure

```
src/app/
├── services/
│   ├── consent.service.ts        # GDPR consent management
│   └── analytics.service.ts      # Event tracking & analytics
├── shared/components/
│   └── cookie-banner/
│       ├── cookie-banner.component.ts
│       ├── cookie-banner.component.html
│       └── cookie-banner.component.scss
├── app.config.ts                 # Analytics providers
└── app.ts                        # Analytics initialization
```

## 🚀 How It Works

### First Visit Flow:
1. User visits the website
2. **Consent Mode defaults to "denied"** (no tracking)
3. Cookie banner appears at bottom of screen
4. User chooses:
   - Accept all → Analytics tracking starts
   - Reject → Only essential cookies
   - Customize → Choose specific preferences

### Tracking Flow:
1. User accepts analytics cookies
2. Consent Mode updates to "granted"
3. Firebase Analytics activates
4. Events are tracked:
   - Page views on navigation
   - Form interactions
   - CTA clicks
   - Product/gallery interactions

## 📊 Events Being Tracked

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `page_view` | Route change | page_path, page_location, page_title |
| `generate_lead` | Contact form submit | method, page_location, empresa |
| `form_start` | User starts filling form | form_id, page_location |
| `form_submit` | Form submission | form_id, success, page_location |
| `form_error` | Form validation error | form_id, field_name, page_location |
| `select_content` | Product/gallery click | content_type, item_id, item_category |
| `cta_click` | CTA button click | cta, cta_location |
| `click` | Outbound link | link_domain, link_url, outbound |
| `file_download` | File download | file_name, file_extension |
| `page_not_found` | 404 error | page_path, page_location |
| `search` | Search query | search_term, result_count |

## 🔧 Usage Examples

### Track Contact Form Submission (Already Implemented)
```typescript
// In contacto.page.ts
this.analyticsService.trackContactSubmit('form', {
  empresa: !!formData.empresa,
  form_location: 'contacto_page'
});
```

### Track Product Click
```typescript
// Example for productos page
this.analyticsService.trackProductClick('Black Gold 12mm', '12mm');
```

### Track Gallery Click
```typescript
// Example for galeria page
this.analyticsService.trackGalleryClick('Cocina Moderna', 'cocinas');
```

### Track CTA Click
```typescript
// Example for hero CTA
this.analyticsService.trackCTAClick('ver_productos', 'home_hero');
```

### Track Outbound Link
```typescript
// Example for social media links
this.analyticsService.trackOutboundLink('https://instagram.com/topstone', 'Instagram');
```

## 🎨 Customization

### Change Cookie Banner Text
Edit: `src/app/shared/components/cookie-banner/cookie-banner.component.html`

### Modify Consent Categories
Edit: `src/app/services/consent.service.ts`

### Add Custom Events
```typescript
// Inject AnalyticsService
private analyticsService = inject(AnalyticsService);

// Track custom event
this.analyticsService.trackCustomEvent('custom_event_name', {
  param1: 'value1',
  param2: 'value2'
});
```

## 📈 Firebase Console

### View Analytics Data:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select "tstone-e1de6" project
3. Navigate to **Analytics → Dashboard**
4. View real-time events in **DebugView**:
   - Add `?firebase_analytics_debug_mode=true` to URL

### Set Up Conversions:
1. Go to **Analytics → Events**
2. Mark important events as conversions:
   - `generate_lead`
   - `form_submit`
   - `cta_click`

### Enable BigQuery Export (Optional):
1. Go to **Analytics → Settings**
2. Enable **BigQuery Export** for advanced analysis

## 🔒 Privacy & GDPR Compliance

### Features:
- ✅ **Consent Mode v2** (GDPR compliant)
- ✅ **Default to denied** (no tracking without consent)
- ✅ **Persistent consent** (localStorage)
- ✅ **User control** (customize preferences)
- ✅ **No tracking in development** (production only)
- ✅ **No PII collected** (user properties are non-identifiable)

### Privacy Policy Requirements:
- ⚠️ **Action Required**: Update your Privacy Policy to include:
  - Google Analytics usage
  - Cookie types (Analytics, Marketing, Preferences)
  - Data retention policies
  - User rights (access, deletion, opt-out)
  - Third-party data processors (Google)

### Cookie Policy Requirements:
- ⚠️ **Action Required**: Create/update Cookie Policy page explaining:
  - What cookies are used
  - Why they're used
  - How to manage preferences
  - How long cookies are stored

## 🧪 Testing

### Test Cookie Banner:
```typescript
// Reset consent (for testing)
import { ConsentService } from './services/consent.service';

constructor(private consentService: ConsentService) {}

resetCookies() {
  this.consentService.resetConsent();
  window.location.reload();
}
```

### Test Analytics Events:
1. Open browser DevTools → Network tab
2. Filter by "google-analytics.com" or "analytics.google.com"
3. Perform actions (submit form, click product, etc.)
4. Verify events are sent

### Debug Mode:
```
http://localhost:4200?firebase_analytics_debug_mode=true
```

## 📝 Next Steps

### High Priority:
1. ✅ Add tracking to productos page (product clicks)
2. ✅ Add tracking to galeria page (gallery clicks)
3. ✅ Add tracking to home page CTAs
4. ⚠️ Create Privacy Policy page
5. ⚠️ Create Cookie Policy page

### Medium Priority:
6. Configure conversions in GA4
7. Set up custom audiences
8. Enable BigQuery export
9. Add user properties (language, theme, region)
10. Track search queries

### Low Priority:
11. Add Performance Monitoring
12. Add Remote Config for A/B testing
13. Track scroll depth
14. Track video plays (if applicable)

## 🐛 Troubleshooting

### Analytics Not Working?
1. Check if you're in production mode (`environment.production = true`)
2. Check if user has accepted analytics cookies
3. Check browser console for errors
4. Verify Measurement ID in environment files

### Cookie Banner Not Showing?
1. Clear localStorage: `localStorage.removeItem('tstone_user_consent')`
2. Refresh page
3. Check if `ConsentService` is injected properly

### Events Not Appearing in GA4?
1. Wait 24-48 hours for initial data processing
2. Use DebugView for real-time testing
3. Verify consent is granted
4. Check Network tab for outgoing requests

## 📞 Support

For issues or questions:
- Check Firebase Analytics [documentation](https://firebase.google.com/docs/analytics/get-started?platform=web)
- Check Google Analytics 4 [help center](https://support.google.com/analytics)
- Review Consent Mode v2 [guide](https://developers.google.com/tag-platform/security/guides/consent)

---

**Implementation Date:** October 9, 2025  
**Measurement ID:** G-WNH3VXFY4S  
**Project ID:** tstone-e1de6  
**Status:** ✅ Production Ready
