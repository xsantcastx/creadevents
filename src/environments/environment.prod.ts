export const environment = {
  production: true,
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
    publishableKey: 'pk_live_51SIVcmFOqjxrWe4OwHsMcqTsTeX4CVSIdjfOmxjFxcRGWvdPSwCKJ7KrwENlT70tZiQpBqyydU6LkfcGO4IF3GrJ0053YImAH6' // Replace with live key for production
  },
  recaptcha: {
    // reCAPTCHA v3 site key for production
    // Registered at: https://www.google.com/recaptcha/admin
    siteKey: '6LdFI_0rAAAAAIPZmBwJzFGKoWhsssuH5Agnt1ET',
    enabled: true
  },
  appCheck: {
    // Using standard reCAPTCHA v3 (free) for App Check
    // Get your key from: https://www.google.com/recaptcha/admin (same as above)
    // OR register in Firebase Console > App Check with reCAPTCHA v3
    provider: 'recaptcha',
    siteKey: '6LdFI_0rAAAAAIPZmBwJzFGKoWhsssuH5Agnt1ET' // Use same reCAPTCHA v3 key
  },
  useEmulators: false
};
