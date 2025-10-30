/**
 * Script to update site statistics in Firestore
 * Run this manually or via Cloud Function/Scheduled Task
 * 
 * This updates the settings/public document with current stats
 * so they can be read by the frontend without authentication
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, query, where } from 'firebase/firestore';

// You'll need to add your Firebase config here
const firebaseConfig = {
  // Copy from your environment.ts
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateStats() {
  console.log('Fetching stats...');

  // Get total completed sales
  const ordersRef = collection(db, 'orders');
  const completedOrdersQuery = query(
    ordersRef,
    where('status', 'in', ['shipped', 'delivered', 'completed'])
  );
  const ordersSnapshot = await getDocs(completedOrdersQuery);
  const totalSales = ordersSnapshot.size;

  // Get average customer satisfaction from surveys
  const surveysRef = collection(db, 'surveys');
  const surveysSnapshot = await getDocs(surveysRef);
  
  let customerSatisfaction = 98; // Default
  if (!surveysSnapshot.empty) {
    let totalRating = 0;
    let count = 0;

    surveysSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.rating) {
        const rating = data.rating;
        const normalizedRating = rating <= 5 ? (rating / 5) * 100 : rating;
        totalRating += normalizedRating;
        count++;
      }
    });

    if (count > 0) {
      customerSatisfaction = Math.round(totalRating / count);
    }
  }

  // Update the public settings document
  const publicSettingsRef = doc(db, 'settings/public');
  
  // Get existing settings first
  const existingDoc = await getDoc(publicSettingsRef);
  const existingData = existingDoc.exists() ? existingDoc.data() : {};

  // Merge with new stats
  await setDoc(publicSettingsRef, {
    ...existingData,
    stats: {
      totalSales,
      customerSatisfaction,
      uptimeGuarantee: 99.9,
      lastUpdated: new Date().toISOString()
    }
  }, { merge: true });

  console.log('Stats updated successfully!');
  console.log({
    totalSales,
    customerSatisfaction,
    uptimeGuarantee: 99.9
  });
}

updateStats()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error updating stats:', error);
    process.exit(1);
  });
