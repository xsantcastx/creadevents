# CI/CD Setup Guide

## 🔐 GitHub Secrets Configuration

# CI/CD Setup Guide

## 🔐 GitHub Secrets Configuration

### **Step 1: Add Firebase CI Token**
You already generated the token (see terminal output from `firebase login:ci`)

### **Step 2: Add Secrets to GitHub**
Go to: `https://github.com/xsantcastx/creadevents/settings/secrets/actions`

Add these secrets:

#### Firebase Authentication:
- `FIREBASE_TOKEN` → (Use the token generated from `firebase login:ci`)

#### Firebase Configuration (from your local environment files):
- `FIREBASE_API_KEY` → (Your Firebase API key)
- `FIREBASE_APP_ID` → (Your Firebase App ID)  
- `FIREBASE_MEASUREMENT_ID` → (Your Google Analytics ID)

#### Other Services:
- `RECAPTCHA_SITE_KEY` → (Your reCAPTCHA site key)

#### Existing Secrets (Already Configured):
- `GITHUB_TOKEN` → Automatically provided by GitHub
- `FIREBASE_SERVICE_ACCOUNT_CREADEVENTS_437A8` → Firebase service account

## 🚀 How It Works:

1. **Local Development**: Use your local `environment.ts` files (ignored by git)
2. **CI/CD Pipeline**: GitHub Actions creates environment files from secrets
3. **Security**: Real API keys never exist in your git repository
4. **Deployment**: Firebase receives a built app with proper configuration

## 📋 Current Setup Status:

✅ Environment files are gitignored for security
✅ Template files exist for reference
✅ GitHub Actions workflow updated to use secrets
✅ Local development works with real API keys
⚠️ **TODO**: Add secrets to GitHub repository settings

## 🔄 Deployment Flow:

```
1. Push to main branch
2. GitHub Actions triggers
3. Checkout code (no environment files)
4. Create environment files from secrets
5. Build Angular application
6. Deploy to Firebase Hosting
```

This approach keeps your API keys secure while enabling automated deployments!