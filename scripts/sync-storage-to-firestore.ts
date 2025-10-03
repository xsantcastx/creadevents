import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE", // Replace with your actual API key
  authDomain: "creadevents-437a8.firebaseapp.com",
  projectId: "creadevents-437a8",
  storageBucket: "creadevents-437a8.firebasestorage.app",
  messagingSenderId: "256034995785",
  appId: "1:256034995785:web:813f895fa2a4754de0c998",
  measurementId: "G-0R00HG63S1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);

interface ImageData {
  id: string;
  fileName: string;
  category: string;
  downloadURL: string;
  uploadDate: Date;
  featured: boolean;
  tags: string[];
  metadata: {
    size: number;
    contentType: string;
  };
  phase: string;
}

class StorageToFirestoreSync {
  
  async syncAllImages(): Promise<void> {
    console.log('🔄 SYNCING FIREBASE STORAGE TO FIRESTORE');
    console.log('='.repeat(50));
    console.log('This will make your uploaded images visible on the website.\n');

    const categories = ['boho', 'carnation', 'garden', 'hydrangea', 'iris', 'modern'];
    let totalSynced = 0;

    for (const category of categories) {
      console.log(`📂 Processing ${category} category...`);
      const synced = await this.syncCategory(category);
      totalSynced += synced;
      console.log(`   ✅ ${synced} images synced from ${category}\n`);
    }

    console.log('🎉 SYNC COMPLETE!');
    console.log(`📊 Total images synced to Firestore: ${totalSynced}`);
    console.log('\n🌐 Your website should now display images at:');
    console.log('   • http://localhost:4200/portfolio/gallery');
    console.log('   • http://localhost:4200/admin/images');
  }

  private async syncCategory(category: string): Promise<number> {
    try {
      // List all files in this category folder
      const categoryRef = ref(storage, `gallery/${category}`);
      const listResult = await listAll(categoryRef);
      
      let syncedCount = 0;

      for (const itemRef of listResult.items) {
        try {
          // Get download URL and metadata
          const downloadURL = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          // Create Firestore document
          const imageData: ImageData = {
            id: this.generateImageId(itemRef.name, category),
            fileName: itemRef.name,
            category: category,
            downloadURL: downloadURL,
            uploadDate: new Date(),
            featured: this.determineFeatured(category, itemRef.name),
            tags: this.generateTags(category, itemRef.name),
            metadata: {
              size: metadata.size || 0,
              contentType: metadata.contentType || 'image/jpeg'
            },
            phase: 'phase1-critical'
          };

          // Save to Firestore
          const docRef = doc(collection(firestore, 'images'), imageData.id);
          await setDoc(docRef, imageData);
          
          console.log(`     ✅ ${itemRef.name} → Firestore`);
          syncedCount++;

        } catch (error) {
          console.log(`     ❌ Failed to sync ${itemRef.name}:`, error);
        }
      }

      return syncedCount;

    } catch (error) {
      console.log(`   ❌ Error processing ${category} category:`, error);
      return 0;
    }
  }

  private generateImageId(fileName: string, category: string): string {
    // Remove file extension and create clean ID
    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
    return `${category}_${cleanName}`;
  }

  private determineFeatured(category: string, fileName: string): boolean {
    // Mark hero categories as featured
    const heroCategories = ['garden', 'modern'];
    return heroCategories.includes(category);
  }

  private generateTags(category: string, fileName: string): string[] {
    const tags = [category, 'phase1'];
    
    // Add style tags based on category
    const categoryTags: { [key: string]: string[] } = {
      'garden': ['outdoor', 'natural', 'landscape'],
      'modern': ['contemporary', 'sleek', 'professional'],
      'boho': ['bohemian', 'rustic', 'free-spirited'],
      'hydrangea': ['centerpiece', 'elegant', 'blue'],
      'carnation': ['classic', 'versatile', 'affordable'],
      'iris': ['spring', 'purple', 'elegant']
    };

    if (categoryTags[category]) {
      tags.push(...categoryTags[category]);
    }

    return tags;
  }
}

// Main execution
async function main() {
  console.log('🎯 Firebase Storage to Firestore Sync Tool');
  console.log('This will make your uploaded images visible on the website.\n');

  const syncer = new StorageToFirestoreSync();
  
  try {
    await syncer.syncAllImages();
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Refresh your browser at http://localhost:4200/portfolio/gallery');
    console.log('2. Check that images now appear in the gallery');
    console.log('3. Test the category filters');
    console.log('4. Enjoy your professional website! 🎉');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check that Firestore security rules allow writes');
    console.log('2. Verify Firebase project configuration');
    console.log('3. Ensure internet connection is stable');
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  main().catch(console.error);
}

export { StorageToFirestoreSync };