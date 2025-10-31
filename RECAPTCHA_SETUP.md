# reCAPTCHA Setup Guide

## Current Issue

You're seeing the error: `Invalid site key or not loaded in api.js: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`

This happens because the project is using Google's test reCAPTCHA key, which often fails to load properly.

## Solution: Get Your Own reCAPTCHA v3 Key (FREE)

### Step 1: Create Your reCAPTCHA Key

1. Go to: https://www.google.com/recaptcha/admin/create
2. Sign in with your Google account
3. Fill in the registration form:
   - **Label**: TheLuxMining (or any name you want)
   - **reCAPTCHA type**: Choose **reCAPTCHA v3**
   - **Domains**: 
     - For development: Add `localhost`
     - For production: Add your domain (e.g., `theluxmining.com`)
4. Accept the terms
5. Click **Submit**

### Step 2: Copy Your Site Key

After creating, you'll see two keys:
- **Site Key** (starts with `6Le...`) - This is what you need
- **Secret Key** - Keep this secret, use it in Firebase Functions/backend only

### Step 3: Update Environment Files

1. Open `src/environments/environment.ts`
2. Replace the `siteKey` with your new key:
   ```typescript
   recaptcha: {
     siteKey: 'YOUR_NEW_SITE_KEY_HERE', // Replace with your actual key
     enabled: true // Enable reCAPTCHA
   },
   ```

3. Open `src/environments/environment.prod.ts`
4. Do the same for production (you can use the same key or create a separate one):
   ```typescript
   recaptcha: {
     siteKey: 'YOUR_PRODUCTION_SITE_KEY_HERE',
     enabled: true
   },
   ```

### Step 4: Enable CAPTCHA in Settings

The app has a setting to enable/disable CAPTCHA. By default, it's **disabled**.

To enable it:
1. Run your app
2. Go to Admin Panel > Settings
3. Find "Enable CAPTCHA" toggle
4. Turn it ON
5. Save settings

## Temporary Solution: Disable reCAPTCHA

If you want to test login without setting up reCAPTCHA:

The reCAPTCHA is already **disabled by default** because:
- `environment.recaptcha.enabled = false`
- Admin settings `enableCaptcha = false`

Just make sure both are set to `false` and you can log in without any CAPTCHA verification.

## How It Works

1. **RecaptchaService** checks if CAPTCHA is enabled in both:
   - Environment config (`environment.recaptcha.enabled`)
   - Admin settings (`settings.enableCaptcha`)

2. If **either** is disabled, the CAPTCHA script won't load and login will work without it

3. When enabled, the script loads from Google and validates users invisibly

## Notes

- reCAPTCHA v3 is **FREE** and works invisibly (no clicking checkboxes)
- The test key from Google is unreliable and often causes errors
- It takes less than 2 minutes to create your own key
- You can use the same key for localhost and production, or create separate keys

## Testing

After setup, test by:
1. Opening login page
2. Check browser console - you should see:
   - `[RecaptchaService] reCAPTCHA is disabled in environment config` (if disabled)
   - `[RecaptchaService] reCAPTCHA script loaded successfully` (if enabled)
3. Try logging in - should work without errors
