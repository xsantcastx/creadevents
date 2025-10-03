#!/usr/bin/env node

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    console.log('🔧 Admin User Setup Tool\n');

    // Get user email
    const email = await askQuestion('Enter the email address of the user to make admin: ');
    
    if (!email || !email.includes('@')) {
      console.error('❌ Please enter a valid email address');
      process.exit(1);
    }

    // Check if user exists in Firebase Auth
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log(`✅ Found user in Firebase Auth: ${user.uid}`);
    } catch (error) {
      console.error(`❌ User not found in Firebase Auth: ${email}`);
      console.log('The user must sign up first before being made an admin.');
      process.exit(1);
    }

    // Create or update user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      permissions: {
        canManageContent: true,
        canManageUsers: true,
        canAccessAdminPanel: true,
        canManageFiles: true,
        canViewAnalytics: true,
        canManageSettings: true
      }
    };

    console.log('\n📝 Creating/updating user profile in Firestore...');
    await db.collection('users').doc(user.uid).set(userProfile, { merge: true });

    console.log(`✅ Successfully set up ${email} as admin!`);
    console.log('\n👤 User Profile:');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: admin`);
    console.log(`   Permissions: Full admin access`);
    
    console.log('\n🎉 Setup complete! The user can now access the admin panel.');
    console.log('💡 Note: The user may need to log out and log back in for changes to take effect.');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();