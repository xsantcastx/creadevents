export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY_HERE',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  },
  stripe: {
    publishableKey: 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE' // Stripe test key
  },
  useEmulators: true // Set to false in production
};

// IMPORTANT: Never commit actual API keys to the repository!
// 1. Copy this file to environment.ts
// 2. Replace the placeholder values with your actual Firebase config
// 3. Add your Stripe test publishable key (starts with pk_test_)
// 4. The actual environment.ts file is gitignored for security