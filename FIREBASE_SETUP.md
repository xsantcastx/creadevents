# Firebase Setup Guide

## Step 1: Get Firebase Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `creadevents-437a8`
3. **Go to Project Settings** (gear icon)
4. **Scroll down to "Your apps"** section
5. **Click on the web app** (</> icon) or **create a new web app** if none exists
6. **Copy the Firebase configuration object**

Your Firebase config should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "creadevents-437a8.firebaseapp.com",
  projectId: "creadevents-437a8",
  storageBucket: "creadevents-437a8.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 2: Enable Required Services

### Enable Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll deploy security rules later)
4. Select your preferred location (closest to your users)

### Enable Firebase Storage
1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Choose **Start in test mode**
4. Select the same location as Firestore

### Enable Authentication (Optional - for admin panel)
1. Go to **Authentication** in Firebase Console
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider

## Step 3: Deploy Firebase Configuration

After getting your credentials, run these commands:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage
```

## Step 4: Update Environment Files

Replace the placeholder values in:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

With your actual Firebase configuration values.

## Step 5: Seed Initial Data

After configuration, run the data seeding script:

```bash
npm run seed-data
```

This will populate your Firestore database with sample data from your existing components.