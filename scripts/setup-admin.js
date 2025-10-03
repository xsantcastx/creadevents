/* Setup Admin User
 * This script helps you create or update a user to have admin privileges
 * Run this after you've signed up/logged in at least once
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check setup
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!saPath || !fs.existsSync(saPath)) {
  console.error('❌ Please set GOOGLE_APPLICATION_CREDENTIALS first');
  console.error('Run: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccount.json"');
  process.exit(1);
}

const sa = require(path.resolve(saPath));
const bucketName = process.env.STORAGE_BUCKET || `${sa.project_id}.appspot.com`;

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(sa),
  storageBucket: bucketName,
});

const db = admin.firestore();

async function setupAdminUser() {
  console.log('🔧 Admin User Setup Tool\n');
  
  // Get email from command line or prompt
  const email = process.argv[2];
  if (!email) {
    console.error('❌ Please provide an email address');
    console.error('Usage: npm run setup:admin your-email@example.com');
    process.exit(1);
  }
  
  console.log(`📧 Setting up admin access for: ${email}`);
  
  try {
    // Get user by email
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log(`✅ Found Firebase Auth user: ${userRecord.uid}`);
    } catch (error) {
      console.error(`❌ User not found in Firebase Auth: ${email}`);
      console.error('Make sure the user has signed up first through your app');
      process.exit(1);
    }
    
    // Check if user profile exists in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists()) {
      console.log('✅ User profile exists in Firestore');
      const userData = userDoc.data();
      console.log(`   Current role: ${userData.role || 'none'}`);
    } else {
      console.log('⚠️  User profile does not exist in Firestore - will create one');
    }
    
    // Create/update user profile with admin permissions
    const adminProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || 'Admin User',
      photoURL: userRecord.photoURL || null,
      role: 'admin',
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      permissions: {
        // Content Management
        canManageContent: true,
        canManageProjects: true,
        canManageServices: true,
        canManageBlog: true,
        canManageTestimonials: true,
        
        // User Management  
        canManageUsers: true,
        canViewUsers: true,
        
        // System
        canManageFiles: true,
        canManageSeasonalThemes: true,
        canAccessAdminPanel: true,
        canExportData: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageInquiries: true
      }
    };
    
    // Save to Firestore
    await userDocRef.set(adminProfile, { merge: true });
    
    console.log('✅ Admin profile created/updated successfully!');
    console.log('\n📋 Admin Permissions Granted:');
    console.log('   ✓ Full content management access');
    console.log('   ✓ User management access');  
    console.log('   ✓ File management access');
    console.log('   ✓ Admin panel access');
    console.log('   ✓ Analytics access');
    console.log('   ✓ All system permissions');
    
    console.log('\n🎉 Setup complete! You can now access /admin routes');
    console.log('💡 Try logging out and back in to refresh your session');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    process.exit(1);
  }
}

setupAdminUser();