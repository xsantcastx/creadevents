// Development environment configuration TEMPLATE
// Copy this to environment.ts and replace with your actual API keys
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY_HERE",
    authDomain: "creadevents-437a8.firebaseapp.com",
    projectId: "creadevents-437a8",
    storageBucket: "creadevents-437a8.firebasestorage.app",
    messagingSenderId: "256034995785",
    appId: "YOUR_FIREBASE_APP_ID_HERE",
    measurementId: "YOUR_MEASUREMENT_ID_HERE"
  },
  recaptcha: {
    siteKey: "YOUR_RECAPTCHA_SITE_KEY_HERE"
  }
};