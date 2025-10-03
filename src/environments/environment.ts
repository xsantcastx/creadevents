// Development environment configuration
// DO NOT commit real API keys to version control!
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY_HERE", // Replace with your actual API key
    authDomain: "creadevents-437a8.firebaseapp.com",
    projectId: "creadevents-437a8",
    storageBucket: "creadevents-437a8.firebasestorage.app",
    messagingSenderId: "256034995785",
    appId: "1:256034995785:web:813f895fa2a4754de0c998",
    measurementId: "G-0R00HG63S1"
  },
  recaptcha: {
    siteKey: "6LcyJtwrAAAAAJKVjBVZUtWWNXVeVtHE6nC-XkqY"
  }
};