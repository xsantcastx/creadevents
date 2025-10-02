import { SmartImageSelector } from './smart-image-selector';

async function runAnalysis() {
  console.log('🎯 SMART IMAGE SELECTION FOR CREADEVENTS');
  console.log('='.repeat(50));
  console.log('This will analyze your 1,828 images and select the best ones for your website.');
  console.log('Instead of uploading everything, we\'ll choose strategically!\n');

  // Update this path to point to your categorized_images folder
  const imageDirectory = 'C:\\Users\\xsanc\\Documents\\7.creadevents.com\\creadevents\\categorized_images';
  
  const selector = new SmartImageSelector(imageDirectory);
  
  try {
    await selector.analyzeAndSelectImages();
    
    console.log('\n🎉 SUCCESS! Here\'s what I created for you:');
    console.log('\n📊 Analysis Reports:');
    console.log('  • image-analysis-report.json - Complete breakdown of all images');
    console.log('\n🚀 Upload Plans:');
    console.log('  • upload-phase1-critical.json - 40 essential images (start here!)');
    console.log('  • upload-phase2-portfolio.json - 50 portfolio expansion images');
    console.log('  • upload-phase3-gallery.json - 60 gallery collection images');
    
    console.log('\n📋 RECOMMENDED APPROACH:');
    console.log('1. 🎯 Start with Phase 1 (40 critical images)');
    console.log('   - Hero images for homepage');
    console.log('   - Key service showcase images');
    console.log('   - Top portfolio pieces');
    console.log('\n2. 💼 Add Phase 2 (50 portfolio images)');
    console.log('   - Expand your portfolio sections');
    console.log('   - Add variety to project galleries');
    console.log('\n3. 🖼️ Complete with Phase 3 (60 gallery images)');
    console.log('   - Fill out the main gallery');
    console.log('   - Add seasonal collections');
    
    console.log('\n💡 TOTAL: ~150 carefully selected images instead of 1,828!');
    console.log('   - 91% reduction in upload time');
    console.log('   - Higher quality user experience');
    console.log('   - Faster website performance');
    
    console.log('\n🎯 Next Step: Check the generated files and let me know if you want to:');
    console.log('   A) Proceed with Phase 1 upload (40 images)');
    console.log('   B) Adjust the selection criteria');
    console.log('   C) See examples of what was selected');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check that the image directory path is correct');
    console.log('2. Ensure you have read permissions for the folder');
    console.log('3. Verify the folder structure matches expected format');
  }
}

// Run the analysis
runAnalysis().catch(console.error);