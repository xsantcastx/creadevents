# Analytics & Cookie Consent

## Status

✅ **FULLY IMPLEMENTED & GDPR COMPLIANT**

- Google Consent Mode v2
- Cookie consent banner
- Firebase Analytics (production-only)
- Automatic page tracking

---

## Cookie Consent

### User Options

1. **Accept All** - Enables all tracking
2. **Reject All** - Only essential cookies
3. **Customize** - Granular control

### Consent Categories

- **Analytics:** Firebase Analytics tracking
- **Marketing:** Ad storage, personalization
- **Preferences:** User settings
- **Security:** Always allowed (essential)

### Implementation

**Service:** `src/app/services/consent.service.ts`  
**Component:** `src/app/shared/components/cookie-banner/`  
**Integration:** Active in `app.ts` and `app.html`

---

## Firebase Analytics

### Tracked Events

| Event | Status |
|-------|--------|
| Page views | ✅ Automatic |
| Contact form submissions | ✅ Active |
| Form start/complete/error | ✅ Active |
| Product clicks | Available |
| Gallery clicks | Available |
| CTA buttons | Available |

### Configuration

**Production Only:** Analytics disabled in development.

```typescript
// In app.config.ts
...(environment.production ? [
  provideAnalytics(() => getAnalytics()),
  ScreenTrackingService,
  UserTrackingService
] : [])
```

### Adding Tracking

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

---

## Testing

### Cookie Consent

1. Open site in incognito/private window
2. Cookie banner should appear
3. Click "Accept All" → Banner disappears
4. Refresh → Banner stays hidden
5. Check localStorage: `theluxmining_user_consent`

### Analytics (Production)

1. Build: `ng build --configuration=production`
2. Accept cookies
3. Navigate between pages
4. Check Firebase Console → Analytics → Realtime

---

## GDPR Compliance

✅ Default deny (all cookies denied until user accepts)  
✅ User choice (Accept/Reject/Customize)  
✅ Granular control (separate toggles)  
✅ Persistence (saved to localStorage)  
✅ Revocable (can reset consent)  
✅ No tracking before consent  
✅ Clear information  
✅ Easy to decline
