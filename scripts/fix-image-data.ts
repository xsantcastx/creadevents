import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAUz7FJezTXW-k4SxVKWPkxtPJ1h6s4xTQ",
  authDomain: "creadevents-437a8.firebaseapp.com",
  projectId: "creadevents-437a8",
  storageBucket: "creadevents-437a8.firebasestorage.app",
  messagingSenderId: "256034995785",
  appId: "1:256034995785:web:813f895fa2a4754de0c998",
  measurementId: "G-0R00HG63S1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

class ImageDataFixer {
  
  async fixAllImageData(): Promise<void> {
    console.log('🔧 FIXING IMAGE DATA STRUCTURE FOR WEBSITE COMPATIBILITY');
    console.log('='.repeat(60));
    console.log('This will update your Firestore data to match the expected format.\n');

    try {
      // Get all existing images
      const imagesRef = collection(firestore, 'images');
      const snapshot = await getDocs(imagesRef);
      
      console.log(`📄 Found ${snapshot.docs.length} image documents to fix`);
      
      let fixedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Create properly structured data
        const fixedData = {
          id: docSnapshot.id,
          fileName: data.fileName || 'unknown.jpg',
          originalName: data.originalFileName || data.fileName || 'unknown.jpg',
          category: data.category || 'uncategorized',
          subcategory: data.subcategory || null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          uploadedAt: data.uploadDate || new Date(),
          updatedAt: data.uploadDate || new Date(),
          storageUrl: data.downloadURL || '',
          downloadURL: data.downloadURL || '',
          thumbnailUrl: data.downloadURL || '', // Use same URL for now
          metadata: {
            size: data.metadata?.size || 0,
            type: data.metadata?.contentType || 'image/jpeg',
            width: data.metadata?.width || 800,
            height: data.metadata?.height || 600
          },
          description: data.description || `Beautiful ${data.category || 'floral'} arrangement`,
          altText: data.altText || data.fileName || 'Floral arrangement',
          featured: data.featured || false,
          sortOrder: data.sortOrder || Math.floor(Math.random() * 1000),
          phase: data.phase || 'phase1-critical'
        };
        
        // Update the document
        await setDoc(doc(firestore, 'images', docSnapshot.id), fixedData);
        
        console.log(`✅ Fixed: ${fixedData.fileName} (${fixedData.category})`);
        fixedCount++;
      }
      
      console.log(`\n🎉 FIXED ${fixedCount} IMAGE DOCUMENTS!`);
      console.log('\n✅ All images now have proper data structure');
      console.log('✅ Missing fields filled with defaults');
      console.log('✅ Type compatibility ensured');
      
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Refresh your website: http://localhost:4200');
      console.log('2. Check gallery: http://localhost:4200/portfolio/gallery');
      console.log('3. Images should now load properly!');
      
    } catch (error) {
      console.error('❌ Error fixing image data:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const fixer = new ImageDataFixer();
  
  try {
    await fixer.fixAllImageData();
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  main().catch(console.error);
}

export { ImageDataFixer };