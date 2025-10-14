// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBo66ZTXf74r-zBIHf5uq0suXftnHKvRo",
  authDomain: "theluxmining-91ab1.firebaseapp.com",
  projectId: "theluxmining-91ab1",
  storageBucket: "theluxmining-91ab1.firebasestorage.app",
  messagingSenderId: "28140566611",
  appId: "1:28140566611:web:14f73bcbf1dc43eac9aea6",
  measurementId: "G-L3NM33F382"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);