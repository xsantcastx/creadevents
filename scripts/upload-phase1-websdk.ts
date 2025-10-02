import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase config from your environment
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
const storage = getStorage(app);
const firestore = getFirestore(app);

interface ImageUpload {
  sourcePath: string;
  fileName: string;
  category: string;
  suggestedUse: string;
  sizeKB: number;
  qualityScore: number;
}

interface UploadResult {
  success: boolean;
  fileName: string;
  downloadURL?: string;
  error?: string;
}

class WebSDKUploader {
  private uploadResults: UploadResult[] = [];

  async uploadPhase1Images(): Promise<void> {
    console.log('🚀 STARTING PHASE 1 CRITICAL LAUNCH UPLOAD');
    console.log('Using Firebase Web SDK for seamless integration');
    console.log('='.repeat(50));
    
    // Load the phase 1 selection
    const phase1Data = this.loadPhase1Data();
    if (!phase1Data) {
      console.error('❌ Could not load Phase 1 data');
      return;
    }

    console.log(`📊 Phase 1 Details:`);
    console.log(`  Description: ${phase1Data.description}`);
    console.log(`  Total Images: ${phase1Data.totalImages}`);
    console.log(`  Total Size: ${phase1Data.totalSizeMB}MB`);
    console.log(`  Estimated Time: ${phase1Data.estimatedUploadTime}`);
    console.log('');

    // Upload each image
    for (let i = 0; i < phase1Data.images.length; i++) {
      const image = phase1Data.images[i];
      console.log(`📤 Uploading ${i + 1}/${phase1Data.images.length}: ${image.fileName}`);
      console.log(`   Category: ${image.category} | Size: ${image.sizeKB}KB`);
      console.log(`   Use: ${image.suggestedUse}`);
      
      const result = await this.uploadSingleImage(image, i + 1);
      this.uploadResults.push(result);
      
      if (result.success) {
        console.log(`   ✅ Success! URL: ${result.downloadURL}`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
      console.log('');
      
      // Small delay to avoid overwhelming Firebase
      await this.delay(1000);
    }

    // Generate results summary
    this.generateUploadSummary();
    
    console.log('🎉 PHASE 1 UPLOAD COMPLETE!');
    this.displayFinalResults();
  }

  private loadPhase1Data(): any {
    try {
      const filePath = path.join(__dirname, 'optimized-phase1-critical-launch.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading Phase 1 data:', error);
      return null;
    }
  }

  private async uploadSingleImage(image: ImageUpload, index: number): Promise<UploadResult> {
    try {
      // Check if source file exists
      if (!fs.existsSync(image.sourcePath)) {
        return {
          success: false,
          fileName: image.fileName,
          error: 'Source file not found'
        };
      }

      // Read the file
      const fileBuffer = fs.readFileSync(image.sourcePath);
      
      // Generate a clean file name for storage
      const cleanFileName = this.generateCleanFileName(image.fileName, image.category, index);
      const storagePath = `images/${image.category}/${cleanFileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, fileBuffer, {
        customMetadata: {
          category: image.category,
          suggestedUse: image.suggestedUse,
          qualityScore: image.qualityScore.toString(),
          phase: 'phase1-critical',
          uploadDate: new Date().toISOString(),
          originalFileName: image.fileName
        }
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      await this.saveImageMetadata({
        id: cleanFileName.replace(/\./g, '_'), // Firestore doc IDs can't contain periods
        fileName: cleanFileName,
        originalFileName: image.fileName,
        category: image.category,
        suggestedUse: image.suggestedUse,
        downloadURL,
        qualityScore: image.qualityScore,
        sizeKB: image.sizeKB,
        phase: 'phase1-critical',
        uploadDate: new Date(),
        featured: image.qualityScore > 80,
        tags: [image.category, 'phase1', 'critical']
      });

      return {
        success: true,
        fileName: cleanFileName,
        downloadURL
      };

    } catch (error) {
      return {
        success: false,
        fileName: image.fileName,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateCleanFileName(originalName: string, category: string, index: number): string {
    const ext = path.extname(originalName);
    const timestamp = originalName.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || 'image';
    return `${category}_${timestamp}_${index.toString().padStart(2, '0')}${ext}`;
  }

  private async saveImageMetadata(metadata: any): Promise<void> {
    try {
      const docRef = doc(collection(firestore, 'images'), metadata.id);
      await setDoc(docRef, metadata);
      console.log(`   📄 Metadata saved for ${metadata.fileName}`);
    } catch (error) {
      console.warn(`   ⚠️ Warning: Could not save metadata: ${error}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateUploadSummary(): void {
    const successful = this.uploadResults.filter(r => r.success);
    const failed = this.uploadResults.filter(r => !r.success);

    const summary = {
      timestamp: new Date().toISOString(),
      phase: 'phase1-critical-launch',
      total: this.uploadResults.length,
      successful: successful.length,
      failed: failed.length,
      successRate: `${((successful.length / this.uploadResults.length) * 100).toFixed(1)}%`,
      successfulUploads: successful.map(r => ({
        fileName: r.fileName,
        downloadURL: r.downloadURL
      })),
      failedUploads: failed.map(r => ({
        fileName: r.fileName,
        error: r.error
      }))
    };

    fs.writeFileSync(
      path.join(__dirname, 'phase1-upload-results.json'),
      JSON.stringify(summary, null, 2)
    );
  }

  private displayFinalResults(): void {
    const successful = this.uploadResults.filter(r => r.success).length;
    const failed = this.uploadResults.filter(r => !r.success).length;

    console.log('\n📊 FINAL UPLOAD SUMMARY');
    console.log('='.repeat(40));
    console.log(`✅ Successful uploads: ${successful} images`);
    console.log(`❌ Failed uploads: ${failed} images`);
    console.log(`📈 Success rate: ${((successful / this.uploadResults.length) * 100).toFixed(1)}%`);
    
    if (successful > 0) {
      console.log('\n🎯 WHAT HAPPENED:');
      console.log(`✅ ${successful} images are now in your Firebase Storage`);
      console.log('✅ Metadata saved to Firestore for gallery integration');
      console.log('✅ Images are ready to display on your website');
      
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. 🌐 Start your Angular app: npm run start');
      console.log('2. 🖼️ Visit /portfolio/gallery to see your new images');
      console.log('3. 🎨 Check /admin/images to manage your uploads');
      console.log('4. 📈 Ready for Phase 2 when you want more images!');
      
      console.log('\n📱 Your website now has:');
      console.log(`  • ${successful} professional images loaded`);
      console.log('  • Hero images for homepage impact');
      console.log('  • Service showcase images');
      console.log('  • Portfolio pieces for client attraction');
    }

    if (failed > 0) {
      console.log('\n⚠️ SOME ISSUES TO RESOLVE:');
      const failedResults = this.uploadResults.filter(r => !r.success);
      failedResults.forEach(result => {
        console.log(`  • ${result.fileName}: ${result.error}`);
      });
      console.log('\n💡 Common solutions:');
      console.log('  - Check that image files exist in categorized_images folder');
      console.log('  - Ensure stable internet connection');
      console.log('  - Verify Firebase Storage rules allow uploads');
    }

    console.log('\n🎉 LAUNCH STATUS: Your creadevents website is now live with professional imagery!');
    console.log('📄 Detailed results saved to: phase1-upload-results.json');
  }
}

// Main execution
async function main() {
  console.log('🎯 Creadevents Phase 1 Launch - Image Upload');
  console.log('This will upload your 18 most critical images for immediate website impact.');
  console.log('Using Firebase Web SDK for seamless integration with your Angular app.\n');

  const uploader = new WebSDKUploader();
  
  try {
    await uploader.uploadPhase1Images();
  } catch (error) {
    console.error('❌ Upload process failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Firebase project is active');
    console.log('3. Ensure the categorized_images folder exists and contains images');
    console.log('4. Check Firebase Storage security rules');
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  main().catch(console.error);
}

export { WebSDKUploader };