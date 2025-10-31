export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBBo66ZTXf74r-zBIHf5uq0suXftnHKvRo",
    authDomain: "theluxmining-91ab1.firebaseapp.com",
    projectId: "theluxmining-91ab1",
    storageBucket: "theluxmining-91ab1.firebasestorage.app",
    messagingSenderId: "28140566611",
    appId: "1:28140566611:web:14f73bcbf1dc43eac9aea6",
    measurementId: "G-L3NM33F382"
  },
  stripe: {
    // TEST MODE - Use Stripe test keys (pk_test_...)
    // Get your test keys from: https://dashboard.stripe.com/test/apikeys
    publishableKey: 'pk_test_51SIbUgJhHEcCQBgB11y69LG7vPrQBYipNgsjNR9fMD9i4ckCX0pPPRc4wowgdDQnGKjUkfjnkOamBj1Jw06DWYq1001YVRKi1r'
  },
  recaptcha: {
    // reCAPTCHA v3 site key for invisible verification
    // Registered at: https://www.google.com/recaptcha/admin
    // TEMPORARILY DISABLED - Key validation failing, check domain configuration
    siteKey: '6LenxPwrAAAAALzJ56cCqq1EbENfdZuwhNHBwzEW',
    enabled: false // Disabled until key is properly configured
  },
  appCheck: {
    // reCAPTCHA v3 site key for App Check
    // For development/localhost, use the debug token provider
    // Get your App Check reCAPTCHA key from Firebase Console > App Check
    provider: 'debug', // Use 'recaptcha' for production
    debugToken: true // Automatically generates debug token for localhost
  },
  useEmulators: true // Use Firebase emulators for local development
};
