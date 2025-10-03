/* Test Firebase Connection
 * This script tests if your Firebase Admin SDK setup is working correctly
 * Run this first before running the backfill script
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Testing Firebase Admin SDK Setup...\n');

// Check environment variables
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!saPath) {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not set');
  console.error('Run: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccount.json"');
  process.exit(1);
}

console.log(`✅ Environment variable set: ${saPath}`);

// Check if file exists
if (!fs.existsSync(saPath)) {
  console.error(`❌ Service account file not found: ${saPath}`);
  process.exit(1);
}

console.log('✅ Service account file exists');

// Try to load and parse the JSON
let sa;
try {
  sa = require(path.resolve(saPath));
  console.log('✅ Service account file loaded successfully');
} catch (error) {
  console.error(`❌ Error loading service account: ${error.message}`);
  process.exit(1);
}

// Check required fields
const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
const missingFields = requiredFields.filter(field => !sa[field]);

if (missingFields.length > 0) {
  console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

console.log('✅ Service account file has all required fields');
console.log(`✅ Project ID: ${sa.project_id}`);

// Check bucket name
const bucketName = process.env.STORAGE_BUCKET || `${sa.project_id}.appspot.com`;
console.log(`✅ Using bucket: ${bucketName}`);

// Try to initialize Firebase Admin
try {
  const admin = require('firebase-admin');
  
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    storageBucket: bucketName,
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
  
  // Test Firestore connection
  const db = admin.firestore();
  console.log('✅ Firestore connection established');
  
  // Test Storage connection
  const bucket = admin.storage().bucket();
  console.log('✅ Storage connection established');
  
  console.log('\n🎉 All tests passed! You can now run the backfill script.');
  
} catch (error) {
  console.error(`❌ Firebase initialization error: ${error.message}`);
  process.exit(1);
}