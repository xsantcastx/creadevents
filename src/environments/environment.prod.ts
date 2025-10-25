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
    // IMPORTANT: Replace this with your PRODUCTION reCAPTCHA site key
    // Get your production key from: https://www.google.com/recaptcha/admin
    // Add your production domain to the allowed domains list
    siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
  },
  useEmulators: false
};
