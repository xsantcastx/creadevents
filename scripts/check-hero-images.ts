/**
 * Debug script to check hero images in Firestore
 * 
 * Run in browser console after logging in as admin:
 * 
 * 1. Open browser console (F12)
 * 2. Navigate to the app
 * 3. Paste this code and run it
 */

import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

async function checkHeroImages() {
  const firestore = getFirestore();
  
  console.log('=== Checking Hero Images in Firestore ===');
  
  // Check app document
  const appDocRef = doc(firestore, 'settings', 'app');
  const appDoc = await getDoc(appDocRef);
  
  console.log('\n--- settings/app document ---');
  if (appDoc.exists()) {
    const data = appDoc.data();
    console.log('Document exists: YES');
    console.log('heroImagesJson field exists:', 'heroImagesJson' in data);
    console.log('heroImagesJson value:', data.heroImagesJson);
    console.log('heroImagesJson type:', typeof data.heroImagesJson);
    console.log('heroImagesJson length:', data.heroImagesJson?.length || 0);
  } else {
    console.log('Document exists: NO');
  }
  
  // Check public document
  const publicDocRef = doc(firestore, 'settings', 'public');
  const publicDoc = await getDoc(publicDocRef);
  
  console.log('\n--- settings/public document ---');
  if (publicDoc.exists()) {
    const data = publicDoc.data();
    console.log('Document exists: YES');
    console.log('heroImagesJson field exists:', 'heroImagesJson' in data);
    console.log('heroImagesJson value:', data.heroImagesJson);
    console.log('heroImagesJson type:', typeof data.heroImagesJson);
    console.log('heroImagesJson length:', data.heroImagesJson?.length || 0);
  } else {
    console.log('Document exists: NO');
  }
  
  console.log('\n=== End Check ===');
}

// Run the check
checkHeroImages().catch(console.error);
