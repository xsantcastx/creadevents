# Firebase App Check Setup Guide (reCAPTCHA v3 - Free)

## Overview
App Check is configured to use **standard reCAPTCHA v3** (completely free) to protect your Firebase resources from abuse.

## Current Configuration
- ✅ App Check configured in `app.config.ts`
- ✅ Development mode uses debug tokens (auto-enabled for localhost)
- ✅ Production uses standard reCAPTCHA v3 (same key as user forms)
- 💰 **100% FREE** - No costs for reCAPTCHA v3

## Setup Steps

### Step 1: Get reCAPTCHA v3 Site Key

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account
3. Click **+** to create a new site
4. Configure:
   - **Label**: TheLuxMining
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add all your domains:
     - `localhost` (for testing)
     - `theluxmining-91ab1.web.app`
     - `theluxmining-91ab1.firebaseapp.com`
     - Your custom domain (if any)
   - Accept terms and click **Submit**
5. Copy the **Site Key** (starts with `6Le...`)

### Step 2: Update Environment Files

Replace the test key in both environment files:

**`src/environments/environment.ts`** (development):
```typescript
recaptcha: {
  siteKey: 'YOUR_SITE_KEY_HERE' // Paste your key
}
```

**`src/environments/environment.prod.ts`** (production):
```typescript
recaptcha: {
  siteKey: 'YOUR_SITE_KEY_HERE' // Same key
},
appCheck: {
  provider: 'recaptcha',
  siteKey: 'YOUR_SITE_KEY_HERE' // Same key - already configured
}
```

### Step 3: Register App Check in Firebase Console

1. Go to [Firebase Console > App Check](https://console.firebase.google.com/project/theluxmining-91ab1/appcheck)
2. Click **Get Started** (if first time)
3. Find your web app and click **Register**
4. Select **reCAPTCHA v3** (NOT Enterprise)
5. Paste the same site key from Step 1
6. Click **Save**

### Step 4: Enable App Check Enforcement (Recommended)

Start with monitoring mode, then enforce:

1. In Firebase Console > App Check > **APIs** tab
2. For each service:
   - **Firestore**: Click menu → **Update enforcement**
     - Start with **Metrics only** (monitor without blocking)
     - After 24-48 hours, switch to **Enforce**
   - **Storage**: Same process
   - **Functions**: Same process (if using)

### Step 5: Verify It's Working

1. Deploy your app or test locally
2. Firebase Console > App Check > **Metrics**
3. Should show:
   - ✅ Verified requests increasing
   - ❌ Unverified requests = 0%
4. Check browser console - no App Check errors

## Development vs Production

### Development (localhost)
- Uses debug tokens (automatically enabled)
- No reCAPTCHA challenges shown to users
- All requests marked as verified

### Production (deployed)
- Uses reCAPTCHA v3 (invisible, no user interaction)
- Automatically scores user behavior
- Blocks suspicious/bot traffic

## Cost

**reCAPTCHA v3**: 
- ✅ **FREE** - Unlimited requests
- ✅ No pricing tiers
- ✅ No credit card required

**vs reCAPTCHA Enterprise**:
- ❌ $1 per 1,000 requests after 10k/month
- Not needed for most apps

## Troubleshooting

### "100% Unverified Requests"
This happens because App Check is not yet configured with a valid provider:
- ✅ **Development**: Debug tokens are auto-enabled, should show as verified
- ❌ **Production**: Need to complete steps above to get reCAPTCHA Enterprise key

### Console Errors
- Check browser console for App Check errors
- Verify the site key is correct
- Ensure your domain is added to reCAPTCHA Enterprise allowed domains

### Firestore/Storage Access Denied
If enforcement is enabled and App Check fails:
1. Check that App Check is initialized correctly
2. Verify the reCAPTCHA Enterprise key is valid
3. Check browser console for specific errors
4. Temporarily disable enforcement to test

## Additional Resources
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [App Check Web SDK](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)

## Cost Considerations
- reCAPTCHA Enterprise: First 10,000 assessments/month are free
- After that: $1 per 1,000 assessments
- Monitor usage in Google Cloud Console > reCAPTCHA Enterprise > Metrics
