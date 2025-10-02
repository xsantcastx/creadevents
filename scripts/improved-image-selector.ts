import * as fs from 'fs';
import * as path from 'path';

interface ImageInfo {
  filePath: string;
  fileName: string;
  category: string;
  size: number;
  sizeScore: number;
  diversityScore: number;
  selected: boolean;
  priority: 'hero' | 'portfolio' | 'service' | 'gallery';
  suggestedUse: string;
}

interface CategoryStats {
  name: string;
  totalImages: number;
  averageSize: number;
  selectedCount: number;
  priority: number;
}

class ImprovedImageSelector {
  private baseDir: string;
  private allImages: ImageInfo[] = [];
  private categoryStats: CategoryStats[] = [];

  // Strategic categories for different purposes
  private readonly categoryPriority = {
    // Hero/Banner suitable categories (wide, scenic, impressive)
    hero: ['garden', 'modern', 'minimalist', 'boho', 'romantic'],
    
    // Portfolio showcase categories (wedding/event focused)
    portfolio: ['wedding', 'bridal', 'ceremony', 'reception', 'romantic', 'elegant'],
    
    // Service showcase categories (specific arrangements)
    service: ['rose', 'peony', 'orchid', 'hydrangea', 'lily', 'carnation', 'daisy', 'iris'],
    
    // Gallery categories (seasonal and style variety)
    gallery: ['spring', 'summer', 'autumn', 'winter', 'vintage', 'rustic', 'corporate']
  };

  constructor(baseDirectory: string) {
    this.baseDir = baseDirectory;
  }

  async improvedSelection(): Promise<void> {
    console.log('🎯 IMPROVED SMART SELECTION FOR CREADEVENTS');
    console.log('='.repeat(55));
    console.log('Analyzing your images with advanced category-aware selection...\n');

    // Step 1: Load all images
    await this.loadAllImages();
    
    // Step 2: Analyze categories
    this.analyzeCategoryDistribution();
    
    // Step 3: Smart selection with diversity
    this.performSmartSelection();
    
    // Step 4: Generate optimized upload plans
    this.generateOptimizedPlans();
    
    console.log('\n🎉 IMPROVED ANALYSIS COMPLETE!');
    this.displayResults();
  }

  private async loadAllImages(): Promise<void> {
    console.log('📂 Loading and analyzing images...');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const categories = fs.readdirSync(this.baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const category of categories) {
      const categoryPath = path.join(this.baseDir, category);
      
      try {
        const files = fs.readdirSync(categoryPath, { withFileTypes: true })
          .filter(file => file.isFile())
          .filter(file => imageExtensions.includes(path.extname(file.name).toLowerCase()));
        
        for (const file of files) {
          const filePath = path.join(categoryPath, file.name);
          const stats = fs.statSync(filePath);
          
          const imageInfo: ImageInfo = {
            filePath,
            fileName: file.name,
            category: category.toLowerCase(),
            size: stats.size,
            sizeScore: this.calculateSizeScore(stats.size),
            diversityScore: 0, // Will calculate later
            selected: false,
            priority: this.determineCategoryPriority(category.toLowerCase()),
            suggestedUse: this.suggestImageUse(category.toLowerCase())
          };
          
          this.allImages.push(imageInfo);
        }
      } catch (error) {
        console.warn(`⚠️ Could not read category ${category}:`, error);
      }
    }
    
    console.log(`📊 Loaded ${this.allImages.length} images from ${categories.length} categories`);
  }

  private calculateSizeScore(size: number): number {
    // Optimize for web-suitable file sizes (not too small, not too large)
    if (size > 3000000) return 60; // > 3MB (may be too large)
    if (size > 1500000) return 100; // 1.5-3MB (ideal for hero)
    if (size > 800000) return 90;   // 800KB-1.5MB (great for portfolio)
    if (size > 400000) return 80;   // 400-800KB (good for gallery)
    if (size > 200000) return 60;   // 200-400KB (acceptable)
    if (size > 100000) return 40;   // 100-200KB (small but usable)
    return 20; // < 100KB (probably too small)
  }

  private determineCategoryPriority(category: string): 'hero' | 'portfolio' | 'gallery' {
    if (this.categoryPriority.hero.includes(category)) return 'hero';
    if (this.categoryPriority.portfolio.includes(category)) return 'portfolio';
    return 'gallery';
  }

  private suggestImageUse(category: string): string {
    const suggestions: { [key: string]: string } = {
      'garden': 'Homepage Hero - Garden Collection Showcase',
      'modern': 'Homepage Hero - Modern Design Portfolio',
      'minimalist': 'Homepage Hero - Clean Elegant Style',
      'boho': 'Portfolio - Bohemian Wedding Style',
      'romantic': 'Portfolio - Romantic Wedding Collection',
      'rose': 'Services - Premium Rose Arrangements',
      'peony': 'Services - Luxury Peony Designs',
      'orchid': 'Services - Exotic Orchid Collections',
      'hydrangea': 'Services - Hydrangea Centerpieces',
      'lily': 'Services - Elegant Lily Arrangements',
      'spring': 'Gallery - Spring Seasonal Collection',
      'summer': 'Gallery - Summer Bright Collection',
      'autumn': 'Gallery - Autumn Warm Collection',
      'winter': 'Gallery - Winter Elegant Collection',
      'vintage': 'Gallery - Vintage Classic Style',
      'rustic': 'Gallery - Rustic Country Charm'
    };
    
    return suggestions[category] || `Gallery - ${category.charAt(0).toUpperCase() + category.slice(1)} Collection`;
  }

  private analyzeCategoryDistribution(): void {
    console.log('📈 Analyzing category distribution...');
    
    const categoryGroups: { [key: string]: ImageInfo[] } = {};
    
    // Group images by category
    this.allImages.forEach(img => {
      if (!categoryGroups[img.category]) {
        categoryGroups[img.category] = [];
      }
      categoryGroups[img.category].push(img);
    });
    
    // Calculate category statistics
    this.categoryStats = Object.entries(categoryGroups).map(([name, images]) => {
      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      const averageSize = totalSize / images.length;
      
      // Priority based on category type and size
      let priority = 1;
      if (this.categoryPriority.hero.includes(name)) priority = 4;
      else if (this.categoryPriority.portfolio.includes(name)) priority = 3;
      else if (this.categoryPriority.service.includes(name)) priority = 2;
      
      return {
        name,
        totalImages: images.length,
        averageSize,
        selectedCount: 0,
        priority
      };
    }).sort((a, b) => b.priority - a.priority);
    
    console.log('📊 Category Analysis:');
    this.categoryStats.forEach(cat => {
      console.log(`  ${cat.name}: ${cat.totalImages} images (Priority: ${cat.priority})`);
    });
  }

  private performSmartSelection(): void {
    console.log('🎯 Performing smart selection with diversity optimization...');
    
    // Phase 1: Select hero images (8-10 best from hero categories)
    const heroImages = this.selectFromCategories(this.categoryPriority.hero, 10, 'hero');
    
    // Phase 2: Select portfolio images (15-20 from portfolio categories)  
    const portfolioImages = this.selectFromCategories(this.categoryPriority.portfolio, 20, 'portfolio');
    
    // Phase 3: Select service showcase (12-15 from service categories)
    const serviceImages = this.selectFromCategories(this.categoryPriority.service, 15, 'service');
    
    // Phase 4: Select diverse gallery (remainder from all categories for variety)
    const galleryImages = this.selectDiverseGallery(75);
    
    console.log(`✅ Selection complete:`);
    console.log(`  🎯 Hero: ${heroImages} images`);
    console.log(`  💼 Portfolio: ${portfolioImages} images`);
    console.log(`  🛠️ Service: ${serviceImages} images`);
    console.log(`  🖼️ Gallery: ${galleryImages} images`);
    console.log(`  📊 Total: ${heroImages + portfolioImages + serviceImages + galleryImages} images`);
  }

  private selectFromCategories(categories: string[], maxCount: number, type: string): number {
    const availableImages = this.allImages.filter(img => 
      categories.includes(img.category) && !img.selected
    );
    
    // Sort by size score (quality) and select best
    availableImages.sort((a, b) => b.sizeScore - a.sizeScore);
    
    const selected = availableImages.slice(0, maxCount);
    selected.forEach(img => {
      img.selected = true;
      img.priority = type as any;
    });
    
    return selected.length;
  }

  private selectDiverseGallery(maxCount: number): number {
    const availableImages = this.allImages.filter(img => !img.selected);
    
    // Calculate diversity scores based on category representation
    availableImages.forEach(img => {
      const categoryCount = this.allImages.filter(i => 
        i.category === img.category && i.selected
      ).length;
      
      // Favor categories with fewer selected images
      img.diversityScore = 100 - (categoryCount * 10) + img.sizeScore * 0.3;
    });
    
    // Sort by diversity score and select
    availableImages.sort((a, b) => b.diversityScore - a.diversityScore);
    
    const selected = availableImages.slice(0, maxCount);
    selected.forEach(img => {
      img.selected = true;
      img.priority = 'gallery';
    });
    
    return selected.length;
  }

  private generateOptimizedPlans(): void {
    console.log('📝 Generating optimized upload plans...');
    
    const selectedImages = this.allImages.filter(img => img.selected);
    
    // Group by priority
    const heroImages = selectedImages.filter(img => img.priority === 'hero');
    const portfolioImages = selectedImages.filter(img => img.priority === 'portfolio');
    const serviceImages = selectedImages.filter(img => img.priority === 'service');
    const galleryImages = selectedImages.filter(img => img.priority === 'gallery');
    
    // Generate Phase 1: Critical Launch (Hero + Key Services)
    const phase1 = [...heroImages, ...serviceImages.slice(0, 8)];
    this.generateUploadFile('phase1-critical-launch', phase1, 'Essential images for immediate website launch');
    
    // Generate Phase 2: Portfolio Expansion
    const phase2 = [...portfolioImages, ...serviceImages.slice(8)];
    this.generateUploadFile('phase2-portfolio-expansion', phase2, 'Portfolio and service showcase expansion');
    
    // Generate Phase 3: Gallery Collection
    const phase3 = galleryImages;
    this.generateUploadFile('phase3-gallery-collection', phase3, 'Diverse gallery for browsing and variety');
    
    // Generate summary report
    this.generateSummaryReport({
      total: this.allImages.length,
      selected: selectedImages.length,
      phase1: phase1.length,
      phase2: phase2.length,
      phase3: phase3.length,
      byCategory: this.generateCategoryBreakdown(selectedImages)
    });
  }

  private generateUploadFile(phase: string, images: ImageInfo[], description: string): void {
    const uploadData = {
      phase,
      description,
      totalImages: images.length,
      estimatedUploadTime: `${Math.ceil(images.length / 5)} minutes`,
      totalSizeMB: Math.round(images.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024),
      images: images.map(img => ({
        sourcePath: img.filePath,
        fileName: img.fileName,
        category: img.category,
        suggestedUse: img.suggestedUse,
        sizeKB: Math.round(img.size / 1024),
        qualityScore: img.sizeScore
      }))
    };

    fs.writeFileSync(
      path.join(process.cwd(), `optimized-${phase}.json`),
      JSON.stringify(uploadData, null, 2)
    );
  }

  private generateCategoryBreakdown(selectedImages: ImageInfo[]): any {
    const breakdown: { [key: string]: number } = {};
    selectedImages.forEach(img => {
      breakdown[img.category] = (breakdown[img.category] || 0) + 1;
    });
    return breakdown;
  }

  private generateSummaryReport(summary: any): void {
    fs.writeFileSync(
      path.join(process.cwd(), 'optimized-selection-report.json'),
      JSON.stringify(summary, null, 2)
    );
  }

  private displayResults(): void {
    console.log('\n📊 OPTIMIZED SELECTION RESULTS');
    console.log('='.repeat(50));
    console.log('Generated optimized upload plans:');
    console.log('\n🚀 Upload Plans:');
    console.log('  📄 optimized-phase1-critical-launch.json');
    console.log('     - Hero images for homepage impact');
    console.log('     - Key service showcases');
    console.log('     - ~18-25 essential images');
    
    console.log('\n  📄 optimized-phase2-portfolio-expansion.json');
    console.log('     - Portfolio project galleries');
    console.log('     - Complete service collections');
    console.log('     - ~30-35 showcase images');
    
    console.log('\n  📄 optimized-phase3-gallery-collection.json');
    console.log('     - Diverse gallery content');
    console.log('     - Seasonal collections');
    console.log('     - ~70-75 variety images');
    
    console.log('\n📊 Reports:');
    console.log('  📄 optimized-selection-report.json - Complete analysis');
    
    console.log('\n💡 BENEFITS OF THIS APPROACH:');
    console.log('  ✅ Category diversity - Every style represented');
    console.log('  ✅ Quality optimization - Best images from each category');
    console.log('  ✅ Strategic phases - Launch critical content first');
    console.log('  ✅ Web performance - Optimized file sizes');
    console.log('  ✅ User experience - Balanced content variety');
    
    console.log('\n🎯 RECOMMENDED NEXT STEPS:');
    console.log('1. Review optimized-phase1-critical-launch.json');
    console.log('2. Upload Phase 1 for immediate website impact');
    console.log('3. Test your website with this curated content');
    console.log('4. Add Phase 2 and 3 based on traffic and feedback');
  }
}

// Main execution
async function main() {
  const baseDirectory = 'C:\\Users\\xsanc\\Documents\\7.creadevents.com\\creadevents\\categorized_images';
  
  if (!fs.existsSync(baseDirectory)) {
    console.error(`❌ Directory not found: ${baseDirectory}`);
    process.exit(1);
  }
  
  const selector = new ImprovedImageSelector(baseDirectory);
  
  try {
    await selector.improvedSelection();
  } catch (error) {
    console.error('❌ Error during improved analysis:', error);
    process.exit(1);
  }
}

// Run the improved analysis
if (require.main === module) {
  main().catch(console.error);
}

export { ImprovedImageSelector };