// Quick admin setup script for CreaDEvents
// Run this with: node admin-setup.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createAdminUser() {
  try {
    // Create admin user
    const email = 'admin@creadevents.com';
    const password = 'admin123'; // Change this!
    
    console.log('Creating admin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Creating admin profile in Firestore...');
    // Create admin profile in Firestore
    const adminProfile = {
      uid: user.uid,
      email: user.email,
      displayName: 'Admin User',
      photoURL: null,
      role: 'admin',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      permissions: {
        canManageContent: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canUploadFiles: true
      }
    };
    
    await setDoc(doc(db, 'users', user.uid), adminProfile);
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('🔐 Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();