import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // You'll need to add your Firebase service account key
  // For now, we'll use the default credentials
  admin.initializeApp({
    projectId: 'creadevents-8ad80', // Replace with your actual project ID
    storageBucket: 'creadevents-8ad80.appspot.com' // Replace with your actual bucket
  });
}

const storage = admin.storage();
const firestore = admin.firestore();

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

class Phase1Uploader {
  private bucket = storage.bucket();
  private uploadResults: UploadResult[] = [];

  async uploadPhase1Images(): Promise<void> {
    console.log('🚀 STARTING PHASE 1 CRITICAL LAUNCH UPLOAD');
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
      console.log(`   Category: ${image.category} | Size: ${image.sizeKB}KB | Use: ${image.suggestedUse}`);
      
      const result = await this.uploadSingleImage(image, i + 1);
      this.uploadResults.push(result);
      
      if (result.success) {
        console.log(`   ✅ Success: ${result.downloadURL}`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
      console.log('');
      
      // Small delay to avoid overwhelming Firebase
      await this.delay(500);
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

      // Generate a clean file name for storage
      const cleanFileName = this.generateCleanFileName(image.fileName, image.category, index);
      const destination = `images/${image.category}/${cleanFileName}`;

      // Upload to Firebase Storage
      const [file] = await this.bucket.upload(image.sourcePath, {
        destination,
        metadata: {
          metadata: {
            category: image.category,
            suggestedUse: image.suggestedUse,
            qualityScore: image.qualityScore.toString(),
            phase: 'phase1-critical',
            uploadDate: new Date().toISOString(),
            originalFileName: image.fileName
          }
        }
      });

      // Make the file publicly accessible
      await file.makePublic();

      // Get the download URL
      const downloadURL = `https://storage.googleapis.com/${this.bucket.name}/${destination}`;

      // Save metadata to Firestore
      await this.saveImageMetadata({
        fileName: cleanFileName,
        originalFileName: image.fileName,
        category: image.category,
        suggestedUse: image.suggestedUse,
        downloadURL,
        qualityScore: image.qualityScore,
        sizeKB: image.sizeKB,
        phase: 'phase1-critical',
        uploadDate: new Date(),
        featured: image.qualityScore > 80
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
      await firestore.collection('images').doc(metadata.fileName).set(metadata);
    } catch (error) {
      console.warn('Warning: Could not save metadata to Firestore:', error);
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
      results: this.uploadResults
    };

    fs.writeFileSync(
      path.join(__dirname, 'phase1-upload-results.json'),
      JSON.stringify(summary, null, 2)
    );
  }

  private displayFinalResults(): void {
    const successful = this.uploadResults.filter(r => r.success).length;
    const failed = this.uploadResults.filter(r => !r.success).length;

    console.log('\n📊 UPLOAD SUMMARY');
    console.log('='.repeat(30));
    console.log(`✅ Successful: ${successful} images`);
    console.log(`❌ Failed: ${failed} images`);
    console.log(`📈 Success Rate: ${((successful / this.uploadResults.length) * 100).toFixed(1)}%`);
    
    if (successful > 0) {
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Check your Firebase Storage console to see uploaded images');
      console.log('2. Test your website gallery to see the new images');
      console.log('3. Review phase1-upload-results.json for detailed results');
      console.log('4. Ready for Phase 2 when you want more images!');
    }

    if (failed > 0) {
      console.log('\n⚠️ ISSUES TO RESOLVE:');
      const failedResults = this.uploadResults.filter(r => !r.success);
      failedResults.forEach(result => {
        console.log(`  - ${result.fileName}: ${result.error}`);
      });
    }

    console.log('\n🔥 Your website now has professional images ready to impress visitors!');
  }
}

// Main execution
async function main() {
  console.log('🎯 Creadevents Phase 1 Image Upload');
  console.log('This will upload your 18 most critical images for immediate website impact.\n');

  const uploader = new Phase1Uploader();
  
  try {
    await uploader.uploadPhase1Images();
  } catch (error) {
    console.error('❌ Upload failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Firebase credentials are properly configured');
    console.log('2. Check that your Firebase project has Storage enabled');
    console.log('3. Verify the image files exist in the categorized_images folder');
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  main().catch(console.error);
}

export { Phase1Uploader };