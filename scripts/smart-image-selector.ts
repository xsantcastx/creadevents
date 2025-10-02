import * as fs from 'fs';
import * as path from 'path';

interface ImageAnalysis {
  filePath: string;
  fileName: string;
  category: string;
  subcategory?: string;
  size: number;
  priority: 'hero' | 'portfolio' | 'service' | 'gallery' | 'skip';
  qualityScore: number;
  suggestedSection: string;
  tags: string[];
}

class SmartImageSelector {
  private baseDir: string;
  private imageAnalysis: ImageAnalysis[] = [];

  constructor(baseDirectory: string) {
    this.baseDir = baseDirectory;
  }

  async analyzeAndSelectImages(): Promise<void> {
    console.log('🔍 Analyzing your 1,828 images for strategic selection...');
    
    // Get all image files
    const allImages = this.getAllImageFiles();
    console.log(`📊 Found ${allImages.length} images to analyze`);

    // Analyze each image
    for (const image of allImages) {
      const analysis = this.analyzeImage(image);
      this.imageAnalysis.push(analysis);
    }

    // Generate selection report
    this.generateSelectionReport();
    this.generateUploadBatches();
  }

  private getAllImageFiles(): Array<{
    filePath: string;
    fileName: string;
    category: string;
    subcategory?: string;
    size: number;
  }> {
    const imageFiles: Array<{
      filePath: string;
      fileName: string;
      category: string;
      subcategory?: string;
      size: number;
    }> = [];
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // Read all directories in the base folder
    const categories = fs.readdirSync(this.baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    categories.forEach(category => {
      const categoryPath = path.join(this.baseDir, category);
      
      try {
        const files = fs.readdirSync(categoryPath, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isFile()) {
            const ext = path.extname(file.name).toLowerCase();
            if (imageExtensions.includes(ext)) {
              const filePath = path.join(categoryPath, file.name);
              const stats = fs.statSync(filePath);
              
              imageFiles.push({
                filePath,
                fileName: file.name,
                category: category.toLowerCase(),
                size: stats.size
              });
            }
          } else if (file.isDirectory()) {
            // Handle subcategories
            const subcategoryPath = path.join(categoryPath, file.name);
            const subFiles = fs.readdirSync(subcategoryPath, { withFileTypes: true });
            
            subFiles.forEach(subFile => {
              if (subFile.isFile()) {
                const ext = path.extname(subFile.name).toLowerCase();
                if (imageExtensions.includes(ext)) {
                  const filePath = path.join(subcategoryPath, subFile.name);
                  const stats = fs.statSync(filePath);
                  
                  imageFiles.push({
                    filePath,
                    fileName: subFile.name,
                    category: category.toLowerCase(),
                    subcategory: file.name.toLowerCase(),
                    size: stats.size
                  });
                }
              }
            });
          }
        });
      } catch (error) {
        console.error(`❌ Error reading category ${category}:`, error);
      }
    });
    
    return imageFiles;
  }

  private analyzeImage(image: {
    filePath: string;
    fileName: string;
    category: string;
    subcategory?: string;
    size: number;
  }): ImageAnalysis {
    const fileName = image.fileName.toLowerCase();
    const category = image.category.toLowerCase();
    
    // Quality scoring based on file size and naming patterns
    let qualityScore = this.calculateQualityScore(image);
    
    // Priority assignment based on content analysis
    const priority = this.determinePriority(fileName, category, image.subcategory);
    
    // Suggested section for website
    const suggestedSection = this.suggestWebsiteSection(fileName, category, priority);
    
    // Generate tags
    const tags = this.generateTags(fileName, category, image.subcategory);

    return {
      filePath: image.filePath,
      fileName: image.fileName,
      category: image.category,
      subcategory: image.subcategory,
      size: image.size,
      priority,
      qualityScore,
      suggestedSection,
      tags
    };
  }

  private calculateQualityScore(image: {
    fileName: string;
    size: number;
  }): number {
    let score = 0;
    const fileName = image.fileName.toLowerCase();
    
    // File size scoring (larger generally better for web)
    if (image.size > 2000000) score += 30; // > 2MB
    else if (image.size > 1000000) score += 25; // > 1MB
    else if (image.size > 500000) score += 20; // > 500KB
    else if (image.size > 200000) score += 15; // > 200KB
    else score += 5; // Small files

    // Filename quality indicators
    const qualityKeywords = [
      'hero', 'main', 'featured', 'best', 'final', 'edited', 'professional',
      'highlight', 'showcase', 'portfolio', 'cover', 'banner'
    ];
    
    const lowQualityKeywords = [
      'raw', 'unedited', 'test', 'backup', 'draft', 'temp', 'copy',
      'old', 'archive', 'duplicate', 'thumb', 'small'
    ];

    qualityKeywords.forEach(keyword => {
      if (fileName.includes(keyword)) score += 15;
    });

    lowQualityKeywords.forEach(keyword => {
      if (fileName.includes(keyword)) score -= 25;
    });

    // Professional naming patterns
    if (/\d{4}-\d{2}-\d{2}/.test(fileName)) score += 10; // Date pattern
    if (fileName.includes('wedding') || fileName.includes('event')) score += 10;
    if (fileName.includes('dsc') || fileName.includes('img')) score += 5; // Camera naming

    return Math.max(0, Math.min(100, score));
  }

  private determinePriority(fileName: string, category: string, subcategory?: string): 'hero' | 'portfolio' | 'service' | 'gallery' | 'skip' {
    const fn = fileName.toLowerCase();
    
    // Hero image candidates
    const heroKeywords = ['hero', 'banner', 'main', 'cover', 'landscape', 'wide', 'overview'];
    if (heroKeywords.some(keyword => fn.includes(keyword))) {
      return 'hero';
    }

    // Portfolio priority based on event type and quality
    const portfolioKeywords = ['wedding', 'ceremony', 'reception', 'corporate', 'gala', 'event'];
    const portfolioCategories = ['wedding', 'corporate', 'private'];
    
    if (portfolioKeywords.some(keyword => fn.includes(keyword)) || 
        portfolioCategories.includes(category)) {
      if (fn.includes('featured') || fn.includes('best') || fn.includes('highlight')) {
        return 'portfolio';
      }
    }

    // Service showcase images
    const serviceKeywords = ['centerpiece', 'bouquet', 'arrangement', 'installation', 'setup'];
    if (serviceKeywords.some(keyword => fn.includes(keyword))) {
      return 'service';
    }

    // Skip low-quality or duplicate images
    const skipKeywords = ['raw', 'unedited', 'test', 'backup', 'duplicate', 'thumb'];
    if (skipKeywords.some(keyword => fn.includes(keyword))) {
      return 'skip';
    }

    return 'gallery';
  }

  private suggestWebsiteSection(fileName: string, category: string, priority: string): string {
    const fn = fileName.toLowerCase();
    
    if (priority === 'hero') {
      return `Homepage Hero - ${this.getSeasonFromCategory(category)} Collection`;
    }
    
    if (priority === 'portfolio') {
      if (fn.includes('wedding')) return 'Portfolio - Wedding Projects';
      if (fn.includes('corporate')) return 'Portfolio - Corporate Events';
      if (fn.includes('private') || fn.includes('party')) return 'Portfolio - Private Parties';
      return 'Portfolio - Featured Projects';
    }
    
    if (priority === 'service') {
      if (fn.includes('bouquet') || fn.includes('bridal')) return 'Services - Wedding Florals';
      if (fn.includes('corporate') || fn.includes('modern')) return 'Services - Corporate Events';
      if (fn.includes('centerpiece') || fn.includes('table')) return 'Services - Table Settings';
      return 'Services - General Showcase';
    }
    
    return `Gallery - ${this.getCategoryDisplay(category)} Collection`;
  }

  private getSeasonFromCategory(category: string): string {
    const seasonMap: { [key: string]: string } = {
      'spring': 'Spring',
      'summer': 'Summer', 
      'autumn': 'Autumn',
      'winter': 'Winter'
    };
    return seasonMap[category] || 'Seasonal';
  }

  private getCategoryDisplay(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'boho': 'Bohemian Style',
      'minimalist': 'Minimalist Design',
      'modern': 'Modern Contemporary',
      'romantic': 'Romantic Elegance',
      'rustic': 'Rustic Charm',
      'vintage': 'Vintage Classic',
      'rose': 'Rose Collection',
      'peony': 'Peony Collection',
      'orchid': 'Orchid Collection',
      'hydrangea': 'Hydrangea Collection',
      'sunflower': 'Sunflower Collection',
      'garden': 'Garden Mix'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  private generateTags(fileName: string, category: string, subcategory?: string): string[] {
    const tags: string[] = [];
    const fn = fileName.toLowerCase();
    
    // Add category
    tags.push(category);
    if (subcategory) tags.push(subcategory);
    
    // Event type tags
    const eventTypes = ['wedding', 'corporate', 'birthday', 'anniversary', 'gala', 'reception', 'ceremony'];
    eventTypes.forEach(type => {
      if (fn.includes(type)) tags.push(type);
    });
    
    // Style tags
    const styles = ['elegant', 'romantic', 'modern', 'rustic', 'boho', 'minimalist', 'vintage'];
    styles.forEach(style => {
      if (fn.includes(style)) tags.push(style);
    });
    
    // Color tags
    const colors = ['white', 'pink', 'red', 'purple', 'yellow', 'blue', 'green', 'gold', 'silver'];
    colors.forEach(color => {
      if (fn.includes(color)) tags.push(color);
    });
    
    // Arrangement type tags
    const arrangements = ['bouquet', 'centerpiece', 'arch', 'installation', 'backdrop', 'table'];
    arrangements.forEach(arrangement => {
      if (fn.includes(arrangement)) tags.push(arrangement);
    });
    
    return [...new Set(tags)]; // Remove duplicates
  }

  private generateSelectionReport(): void {
    const report = {
      total: this.imageAnalysis.length,
      byPriority: {
        hero: this.imageAnalysis.filter(img => img.priority === 'hero').length,
        portfolio: this.imageAnalysis.filter(img => img.priority === 'portfolio').length,
        service: this.imageAnalysis.filter(img => img.priority === 'service').length,
        gallery: this.imageAnalysis.filter(img => img.priority === 'gallery').length,
        skip: this.imageAnalysis.filter(img => img.priority === 'skip').length
      },
      recommended: this.getRecommendedImages()
    };

    console.log('\n📊 IMAGE ANALYSIS REPORT');
    console.log('='.repeat(50));
    console.log(`Total Images Analyzed: ${report.total}`);
    console.log(`\n📈 Priority Breakdown:`);
    console.log(`  🎯 Hero Images: ${report.byPriority.hero}`);
    console.log(`  💼 Portfolio Images: ${report.byPriority.portfolio}`);
    console.log(`  🛠️  Service Images: ${report.byPriority.service}`);
    console.log(`  🖼️  Gallery Images: ${report.byPriority.gallery}`);
    console.log(`  ⏭️  Skip (Low Quality): ${report.byPriority.skip}`);
    
    console.log(`\n✨ RECOMMENDED SELECTION:`);
    console.log(`  Phase 1 (Critical): ${report.recommended.phase1.length} images`);
    console.log(`  Phase 2 (Portfolio): ${report.recommended.phase2.length} images`);
    console.log(`  Phase 3 (Gallery): ${report.recommended.phase3.length} images`);
    console.log(`  Total Recommended: ${report.recommended.total} images`);
    console.log(`  Reduction: ${((1 - report.recommended.total / report.total) * 100).toFixed(1)}%`);

    // Save detailed report
    fs.writeFileSync(
      path.join(process.cwd(), 'image-analysis-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n📄 Detailed report saved: image-analysis-report.json`);
  }

  private getRecommendedImages() {
    // Sort by quality score and priority
    const sorted = this.imageAnalysis
      .filter(img => img.priority !== 'skip')
      .sort((a, b) => {
        // Priority weight
        const priorityWeight: Record<string, number> = { hero: 4, portfolio: 3, service: 2, gallery: 1 };
        const aPriority = priorityWeight[a.priority] || 0;
        const bPriority = priorityWeight[b.priority] || 0;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return b.qualityScore - a.qualityScore;
      });

    // Phase 1: Critical images (40)
    const phase1 = [
      ...sorted.filter(img => img.priority === 'hero').slice(0, 8),
      ...sorted.filter(img => img.priority === 'service').slice(0, 12),
      ...sorted.filter(img => img.priority === 'portfolio').slice(0, 20)
    ];

    // Phase 2: Portfolio expansion (50)
    const phase2 = sorted
      .filter(img => img.priority === 'portfolio' && !phase1.includes(img))
      .slice(0, 50);

    // Phase 3: Gallery content (60)
    const phase3 = sorted
      .filter(img => img.priority === 'gallery')
      .slice(0, 60);

    return {
      phase1,
      phase2, 
      phase3,
      total: phase1.length + phase2.length + phase3.length
    };
  }

  private generateUploadBatches(): void {
    const recommended = this.getRecommendedImages();
    
    // Generate upload scripts for each phase
    this.generateUploadScript('phase1-critical', recommended.phase1);
    this.generateUploadScript('phase2-portfolio', recommended.phase2);
    this.generateUploadScript('phase3-gallery', recommended.phase3);
    
    console.log(`\n🚀 Upload scripts generated:`);
    console.log(`  📄 upload-phase1-critical.json`);
    console.log(`  📄 upload-phase2-portfolio.json`);
    console.log(`  📄 upload-phase3-gallery.json`);
  }

  private generateUploadScript(phase: string, images: ImageAnalysis[]): void {
    const uploadData = {
      phase,
      totalImages: images.length,
      estimatedUploadTime: `${Math.ceil(images.length / 5)} minutes`,
      images: images.map(img => ({
        sourcePath: img.filePath,
        fileName: img.fileName,
        category: img.category,
        subcategory: img.subcategory,
        tags: img.tags,
        priority: img.priority,
        suggestedSection: img.suggestedSection,
        qualityScore: img.qualityScore,
        featured: img.qualityScore > 70
      }))
    };

    fs.writeFileSync(
      path.join(process.cwd(), `upload-${phase}.json`),
      JSON.stringify(uploadData, null, 2)
    );
  }
}

// Main execution
async function main() {
  const baseDirectory = 'C:\\Users\\xsanc\\Documents\\7.creadevents.com\\categorized_images';
  
  if (!fs.existsSync(baseDirectory)) {
    console.error(`❌ Directory not found: ${baseDirectory}`);
    console.log('Please update the baseDirectory path to point to your categorized_images folder.');
    process.exit(1);
  }
  
  const selector = new SmartImageSelector(baseDirectory);
  
  try {
    await selector.analyzeAndSelectImages();
    console.log('\n🎉 Analysis complete! Review the generated reports and upload scripts.');
    console.log('\n📋 Next Steps:');
    console.log('1. Review image-analysis-report.json');
    console.log('2. Start with upload-phase1-critical.json (40 best images)');
    console.log('3. Test your website with Phase 1 images');
    console.log('4. Continue with Phase 2 and 3 as needed');
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { SmartImageSelector };