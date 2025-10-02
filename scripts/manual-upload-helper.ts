import * as fs from 'fs';
import * as path from 'path';

interface ImageInfo {
  sourcePath: string;
  fileName: string;
  category: string;
  suggestedUse: string;
  sizeKB: number;
  relativeDestination: string;
}

class ManualUploadHelper {
  
  async generateUploadInstructions(): Promise<void> {
    console.log('🎯 MANUAL UPLOAD HELPER FOR CREADEVENTS');
    console.log('='.repeat(50));
    console.log('Since Firebase requires permission setup, let\'s create upload instructions');
    console.log('for you to use through your admin interface.\n');
    
    // Load Phase 1 data
    const phase1Data = this.loadPhase1Data();
    if (!phase1Data) {
      console.error('❌ Could not load Phase 1 data');
      return;
    }

    console.log('📊 PHASE 1 IMAGES TO UPLOAD:');
    console.log(`Total: ${phase1Data.totalImages} images (${phase1Data.totalSizeMB}MB)`);
    console.log('');

    // Group images by category for easier upload
    const categoryGroups = this.groupImagesByCategory(phase1Data.images);
    
    // Generate organized upload folders
    await this.createUploadFolders(categoryGroups);
    
    // Generate upload instructions
    this.generateInstructions(categoryGroups);
    
    console.log('🎉 UPLOAD PREPARATION COMPLETE!');
    console.log('\n📋 WHAT WAS CREATED:');
    console.log('  📁 upload-ready/ - Organized folders with your Phase 1 images');
    console.log('  📄 upload-instructions.txt - Step-by-step upload guide');
    console.log('  📄 image-checklist.json - Detailed image information');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. 🔧 Update Firebase Storage rules (see firebase-storage-rules.rules)');
    console.log('2. 🌐 Start your website: npm run start');
    console.log('3. 🔐 Go to /admin/images and login as admin');
    console.log('4. 📤 Upload images from the upload-ready/ folders');
    console.log('5. 🎨 Check your gallery to see the results!');
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

  private groupImagesByCategory(images: any[]): { [category: string]: ImageInfo[] } {
    const groups: { [category: string]: ImageInfo[] } = {};
    
    images.forEach((img, index) => {
      if (!groups[img.category]) {
        groups[img.category] = [];
      }
      
      groups[img.category].push({
        sourcePath: img.sourcePath,
        fileName: img.fileName,
        category: img.category,
        suggestedUse: img.suggestedUse,
        sizeKB: img.sizeKB,
        relativeDestination: `upload-ready/${img.category}/${img.fileName}`
      });
    });
    
    return groups;
  }

  private async createUploadFolders(categoryGroups: { [category: string]: ImageInfo[] }): Promise<void> {
    console.log('📁 Creating organized upload folders...');
    
    // Create main upload-ready directory
    const uploadDir = path.join(__dirname, 'upload-ready');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Copy images to organized folders
    for (const [category, images] of Object.entries(categoryGroups)) {
      console.log(`  Creating ${category} folder (${images.length} images)...`);
      
      const categoryDir = path.join(uploadDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      // Copy each image
      for (const image of images) {
        try {
          if (fs.existsSync(image.sourcePath)) {
            const destPath = path.join(__dirname, image.relativeDestination);
            fs.copyFileSync(image.sourcePath, destPath);
          } else {
            console.warn(`    ⚠️ Source not found: ${image.fileName}`);
          }
        } catch (error) {
          console.warn(`    ❌ Failed to copy ${image.fileName}:`, error);
        }
      }
    }
    
    console.log('  ✅ Upload folders created successfully!');
  }

  private generateInstructions(categoryGroups: { [category: string]: ImageInfo[] }): void {
    const instructions = this.buildInstructionsText(categoryGroups);
    const checklist = this.buildChecklistData(categoryGroups);
    
    // Save instructions
    fs.writeFileSync(
      path.join(__dirname, 'upload-instructions.txt'),
      instructions
    );
    
    // Save detailed checklist
    fs.writeFileSync(
      path.join(__dirname, 'image-checklist.json'),
      JSON.stringify(checklist, null, 2)
    );
  }

  private buildInstructionsText(categoryGroups: { [category: string]: ImageInfo[] }): string {
    const totalImages = Object.values(categoryGroups).reduce((sum, images) => sum + images.length, 0);
    
    return `
🎯 CREADEVENTS PHASE 1 UPLOAD INSTRUCTIONS
===========================================

OVERVIEW:
- Total Images: ${totalImages}
- Categories: ${Object.keys(categoryGroups).length}
- Purpose: Critical launch images for immediate website impact

BEFORE YOU START:
1. Update Firebase Storage Rules:
   - Go to Firebase Console -> Storage -> Rules
   - Copy the rules from firebase-storage-rules.rules
   - Deploy the new rules

2. Start Your Website:
   - Run: npm run start
   - Website will be available at http://localhost:4200

UPLOAD PROCESS:
1. Navigate to: http://localhost:4200/admin/images
2. Login with your admin credentials
3. Upload images category by category:

${Object.entries(categoryGroups).map(([category, images]) => `
   📁 ${category.toUpperCase()} CATEGORY (${images.length} images):
   - Select category: "${category}"
   - Upload images from: upload-ready/${category}/
   - Suggested uses:
${images.map(img => `     • ${img.fileName} → ${img.suggestedUse}`).join('\n')}
`).join('\n')}

VERIFICATION:
After uploading each category:
1. Check the gallery: http://localhost:4200/portfolio/gallery
2. Filter by category to see your new images
3. Verify images display correctly

TROUBLESHOOTING:
- If uploads fail: Check Firebase Storage rules
- If images don't appear: Check browser console for errors
- If gallery is empty: Verify Firestore connection

SUCCESS INDICATORS:
✅ All ${totalImages} images uploaded without errors
✅ Gallery displays images in correct categories
✅ Admin interface shows upload statistics
✅ Homepage can use hero images

Next: Ready for Phase 2 (Portfolio Expansion) - 35 more images!

Questions? Check the image-checklist.json for detailed information.
`;
  }

  private buildChecklistData(categoryGroups: { [category: string]: ImageInfo[] }): any {
    return {
      phase: 'phase1-critical-launch',
      generatedAt: new Date().toISOString(),
      totalImages: Object.values(categoryGroups).reduce((sum, images) => sum + images.length, 0),
      categories: Object.keys(categoryGroups).length,
      uploadOrder: [
        { category: 'garden', priority: 'high', reason: 'Hero images for homepage' },
        { category: 'modern', priority: 'high', reason: 'Professional portfolio showcase' },
        { category: 'romantic', priority: 'medium', reason: 'Wedding portfolio content' },
        { category: 'hydrangea', priority: 'medium', reason: 'Service showcase images' },
        { category: 'boho', priority: 'medium', reason: 'Style diversity' },
        { category: 'orchid', priority: 'low', reason: 'Premium service examples' },
        { category: 'carnation', priority: 'low', reason: 'Gallery variety' },
        { category: 'iris', priority: 'low', reason: 'Seasonal content' }
      ],
      categoryBreakdown: Object.entries(categoryGroups).map(([category, images]) => ({
        category,
        count: images.length,
        totalSizeKB: images.reduce((sum, img) => sum + img.sizeKB, 0),
        files: images.map(img => ({
          fileName: img.fileName,
          suggestedUse: img.suggestedUse,
          sizeKB: img.sizeKB,
          location: img.relativeDestination
        }))
      })),
      nextSteps: [
        'Update Firebase Storage rules',
        'Start Angular development server', 
        'Login to admin interface',
        'Upload images by category',
        'Verify gallery functionality',
        'Prepare for Phase 2 expansion'
      ]
    };
  }
}

// Main execution
async function main() {
  const helper = new ManualUploadHelper();
  
  try {
    await helper.generateUploadInstructions();
  } catch (error) {
    console.error('❌ Error generating upload instructions:', error);
    process.exit(1);
  }
}

// Run the helper
if (require.main === module) {
  main().catch(console.error);
}

export { ManualUploadHelper };