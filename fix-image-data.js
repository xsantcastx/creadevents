import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
// SECURITY: Replace with your actual Firebase config - DO NOT commit real API keys!
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE", // Replace with your actual API key
  authDomain: "creadevents-437a8.firebaseapp.com",
  projectId: "creadevents-437a8",
  storageBucket: "creadevents-437a8.firebasestorage.app",
  messagingSenderId: "256034995785",
  appId: "1:256034995785:web:813f895fa2a4754de0c998"
};

/**
 * ImageDataFixer - Standardize Firestore image data structure
 * Fixes the data structure mismatch between sync script output and website expectations
 */

async function main() {
    console.log('🔧 ImageDataFixer - Standardizing Firestore data structure...');
    
    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Get all documents from the galleries collection
        console.log('📊 Fetching image documents from Firestore...');
        const galleriesRef = collection(db, 'galleries');
        const snapshot = await getDocs(galleriesRef);
        
        let processedCount = 0;
        let fixedCount = 0;
        
        for (const docSnap of snapshot.docs) {
            processedCount++;
            const docData = docSnap.data();
            const docId = docSnap.id;
            
            console.log(`Processing document ${docId}...`);
            
            // Check what fields need to be fixed
            const updateData = {};
            let needsUpdate = false;
            
            // 1. Ensure originalName exists
            if (!docData['originalName']) {
                // Try to derive from fileName or use fileName
                if (docData['fileName']) {
                    updateData.originalName = docData['fileName'];
                } else {
                    updateData.originalName = `image_${docId}`;
                }
                needsUpdate = true;
                console.log(`  ➕ Adding originalName: ${updateData.originalName}`);
            }
            
            // 2. Ensure uploadedAt exists and is properly formatted
            if (!docData['uploadedAt']) {
                // Use createdAt if available, otherwise current time
                if (docData['createdAt']) {
                    updateData.uploadedAt = docData['createdAt'];
                } else {
                    updateData.uploadedAt = new Date();
                }
                needsUpdate = true;
                console.log(`  ➕ Adding uploadedAt: ${updateData.uploadedAt}`);
            }
            
            // 3. Ensure storageUrl exists (mapped from url or downloadURL)
            if (!docData['storageUrl']) {
                if (docData['downloadURL']) {
                    updateData.storageUrl = docData['downloadURL'];
                } else if (docData['url']) {
                    updateData.storageUrl = docData['url'];
                } else {
                    console.log(`  ⚠️ No URL found for document ${docId}`);
                    continue;
                }
                needsUpdate = true;
                console.log(`  ➕ Adding storageUrl: ${updateData.storageUrl}`);
            }
            
            // 4. Ensure downloadURL exists for backward compatibility
            if (!docData['downloadURL']) {
                if (docData['storageUrl']) {
                    updateData.downloadURL = docData['storageUrl'];
                } else if (docData['url']) {
                    updateData.downloadURL = docData['url'];
                }
                if (updateData.downloadURL) {
                    needsUpdate = true;
                    console.log(`  ➕ Adding downloadURL: ${updateData.downloadURL}`);
                }
            }
            
            // 5. Ensure standard metadata fields exist
            const standardFields = {
                fileName: `image_${docId}.jpg`,
                category: 'uncategorized',
                tags: [],
                altText: '',
                description: '',
                size: 0,
                width: 0,
                height: 0
            };
            
            for (const [field, defaultValue] of Object.entries(standardFields)) {
                if (docData[field] === undefined || docData[field] === null) {
                    updateData[field] = defaultValue;
                    needsUpdate = true;
                    console.log(`  ➕ Adding ${field}: ${defaultValue}`);
                }
            }
            
            // Update the document if needed
            if (needsUpdate) {
                try {
                    const docRef = doc(db, 'galleries', docId);
                    await updateDoc(docRef, updateData);
                    fixedCount++;
                    console.log(`  ✅ Updated document ${docId}`);
                } catch (error) {
                    console.log(`  ❌ Failed to update document ${docId}:`, error);
                }
            } else {
                console.log(`  ✅ Document ${docId} already has correct structure`);
            }
        }
        
        console.log(`\n🎉 Data standardization complete!`);
        console.log(`📊 Processed: ${processedCount} documents`);
        console.log(`🔧 Fixed: ${fixedCount} documents`);
        console.log(`✅ Your images should now display properly on the website!`);
        
    } catch (error) {
        console.error('❌ Error during data fixing:', error);
        process.exit(1);
    }
}

main();