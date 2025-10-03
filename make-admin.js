#!/usr/bin/env node

/**
 * CreaDEvents Admin Setup Utility
 * Run this after registering a user account to promote yourself to admin
 * 
 * Usage: node make-admin.js <email>
 * Example: node make-admin.js your-email@example.com
 */

const path = require('path');
const fs = require('fs');

// Read Firebase config from environment file
function getFirebaseConfig() {
  const envPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Environment file not found. Please ensure you have Firebase configured.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract Firebase config (this is a simple parser, real projects should use proper parsing)
  const configMatch = envContent.match(/firebase:\s*{([^}]+)}/s);
  if (!configMatch) {
    console.error('❌ Firebase config not found in environment file.');
    process.exit(1);
  }
  
  console.log('✅ Firebase config found');
  return true;
}

function displayInstructions(email) {
  const instructions = `
🔐 **CreaDEvents Admin Setup Instructions**

${email ? `Email: ${email}` : 'Step 1: Get your user email from the registration'}

**Method 1: Browser Console (Recommended)**
1. Open your app at http://localhost:4200
2. Log in with your account
3. Open browser console (F12)
4. Copy and paste this command:

\`\`\`javascript
(async () => {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');
    
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ Please log in first');
      return;
    }
    
    console.log('👤 Promoting user:', user.email);
    
    await updateDoc(doc(db, 'users', user.uid), {
      role: 'admin',
      permissions: {
        canManageContent: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canUploadFiles: true
      },
      updatedAt: new Date()
    });
    
    console.log('✅ Successfully promoted to admin!');
    console.log('🔄 Refreshing page to apply changes...');
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
\`\`\`

**Method 2: Firebase Console (Manual)**
1. Go to https://console.firebase.google.com
2. Select your project → Firestore Database
3. Find collection 'users' → your user document
4. Edit the document and set:
   - role: "admin"
   - permissions.canManageContent: true
   - permissions.canManageUsers: true
   - permissions.canViewAnalytics: true
   - permissions.canUploadFiles: true

**Method 3: Firebase CLI**
\`firebase firestore:update users/USER_ID role=admin\`

🎉 **After completing any method:**
- Navigate to /admin in your app
- You should now have full admin access!

`;

  console.log(instructions);
}

// Main execution
const email = process.argv[2];

console.log('🚀 CreaDEvents Admin Setup Utility\n');

// Check if Firebase is configured
getFirebaseConfig();

// Display instructions
displayInstructions(email);

console.log('📝 Need help? Check PERMISSIONS_SETUP.md for detailed instructions.');