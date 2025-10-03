// Production environment configuration TEMPLATE
// This file is safe to commit - real values injected at CI time
export const environment = {
  production: true,
  firebase: {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "creadevents-437a8.firebaseapp.com",
    projectId: "creadevents-437a8",
    storageBucket: "creadevents-437a8.firebasestorage.app",
    messagingSenderId: "256034995785",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__"
  },
  recaptcha: {
    siteKey: "__RECAPTCHA_SITE_KEY__"
  }
};