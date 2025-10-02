import { Injectable, signal, computed } from '@angular/core';

export interface ImageData {
  filename: string;
  path: string;
  category: string;
  timestamp?: Date;
  alt?: string;
  tags?: string[];
}

export interface CategoryInfo {
  name: string;
  displayName: string;
  count: number;
  thumbnail?: string;
  description?: string;
}

export interface ImageFilter {
  categories: string[];
  searchTerm: string;
  sortBy: 'date' | 'name' | 'category';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ImageGalleryService {
  // Signals for reactive state management
  private allImages = signal<ImageData[]>([]);
  private currentFilter = signal<ImageFilter>({
    categories: [],
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  private loading = signal<boolean>(false);
  private currentPage = signal<number>(1);
  private itemsPerPage = signal<number>(20);

  // Category definitions with metadata
  private readonly categories: CategoryInfo[] = [
    // Seasons
    { name: 'spring', displayName: 'Spring', count: 0, description: 'Fresh spring arrangements and seasonal blooms' },
    { name: 'summer', displayName: 'Summer', count: 0, description: 'Vibrant summer flowers and arrangements' },
    { name: 'autumn', displayName: 'Autumn', count: 0, description: 'Warm autumn colors and seasonal arrangements' },
    { name: 'winter', displayName: 'Winter', count: 0, description: 'Elegant winter arrangements and holiday themes' },
    
    // Styles
    { name: 'boho', displayName: 'Bohemian', count: 0, description: 'Free-spirited, natural bohemian style arrangements' },
    { name: 'minimalist', displayName: 'Minimalist', count: 0, description: 'Clean, simple, and elegant designs' },
    { name: 'modern', displayName: 'Modern', count: 0, description: 'Contemporary and sophisticated arrangements' },
    { name: 'romantic', displayName: 'Romantic', count: 0, description: 'Soft, dreamy, and romantic floral designs' },
    { name: 'rustic', displayName: 'Rustic', count: 0, description: 'Natural, country-style arrangements' },
    { name: 'vintage', displayName: 'Vintage', count: 0, description: 'Classic and timeless floral designs' },
    
    // Flower Types
    { name: 'rose', displayName: 'Roses', count: 0, description: 'Beautiful rose arrangements in various styles' },
    { name: 'tulip', displayName: 'Tulips', count: 0, description: 'Elegant tulip arrangements and displays' },
    { name: 'orchid', displayName: 'Orchids', count: 0, description: 'Exotic and sophisticated orchid arrangements' },
    { name: 'peony', displayName: 'Peonies', count: 0, description: 'Lush and romantic peony arrangements' },
    { name: 'lily', displayName: 'Lilies', count: 0, description: 'Graceful lily arrangements in various styles' },
    { name: 'iris', displayName: 'Iris', count: 0, description: 'Striking iris arrangements and displays' },
    { name: 'daisy', displayName: 'Daisies', count: 0, description: 'Cheerful and bright daisy arrangements' },
    { name: 'carnation', displayName: 'Carnations', count: 0, description: 'Classic carnation arrangements' },
    { name: 'hydrangea', displayName: 'Hydrangeas', count: 0, description: 'Full and lush hydrangea arrangements' },
    { name: 'sunflower', displayName: 'Sunflowers', count: 0, description: 'Bright and cheerful sunflower arrangements' },
    
    // Themes
    { name: 'garden', displayName: 'Garden', count: 0, description: 'Natural garden-style arrangements' },
    { name: 'tropical', displayName: 'Tropical', count: 0, description: 'Exotic tropical arrangements and displays' }
  ];

  // Computed properties for reactive UI
  readonly categories$ = computed(() => this.categories);
  readonly filteredImages = computed(() => this.getFilteredImages());
  readonly paginatedImages = computed(() => this.getPaginatedImages());
  readonly totalPages = computed(() => Math.ceil(this.filteredImages().length / this.itemsPerPage()));
  readonly isLoading = computed(() => this.loading());
  readonly currentFilter$ = computed(() => this.currentFilter());
  readonly hasImages = computed(() => this.allImages().length > 0);
  readonly currentPage$ = computed(() => this.currentPage());

  constructor() {
    this.initializeImageData();
  }

  private async initializeImageData(): Promise<void> {
    this.loading.set(true);
    
    try {
      const images = await this.loadImageData();
      this.allImages.set(images);
      this.updateCategoryCounts();
    } catch (error) {
      console.error('Failed to load image data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadImageData(): Promise<ImageData[]> {
    const images: ImageData[] = [];
    
    // Sample images for testing - we'll create a more robust loading mechanism
    // For now, let's create sample data that represents the structure
    const sampleImages = [
      { category: 'spring', filename: 'spring-arrangement-1.jpg' },
      { category: 'spring', filename: 'spring-arrangement-2.jpg' },
      { category: 'spring', filename: 'spring-arrangement-3.jpg' },
      { category: 'summer', filename: 'summer-arrangement-1.jpg' },
      { category: 'summer', filename: 'summer-arrangement-2.jpg' },
      { category: 'autumn', filename: 'autumn-arrangement-1.jpg' },
      { category: 'autumn', filename: 'autumn-arrangement-2.jpg' },
      { category: 'winter', filename: 'winter-arrangement-1.jpg' },
      { category: 'rose', filename: 'rose-bouquet-1.jpg' },
      { category: 'rose', filename: 'rose-bouquet-2.jpg' },
      { category: 'rose', filename: 'rose-bouquet-3.jpg' },
      { category: 'tulip', filename: 'tulip-display-1.jpg' },
      { category: 'tulip', filename: 'tulip-display-2.jpg' },
      { category: 'orchid', filename: 'orchid-arrangement-1.jpg' },
      { category: 'peony', filename: 'peony-bouquet-1.jpg' },
      { category: 'lily', filename: 'lily-arrangement-1.jpg' },
      { category: 'romantic', filename: 'romantic-wedding-1.jpg' },
      { category: 'romantic', filename: 'romantic-wedding-2.jpg' },
      { category: 'modern', filename: 'modern-centerpiece-1.jpg' },
      { category: 'rustic', filename: 'rustic-wedding-1.jpg' },
      { category: 'boho', filename: 'boho-arrangement-1.jpg' },
      { category: 'minimalist', filename: 'minimalist-design-1.jpg' },
      { category: 'vintage', filename: 'vintage-arrangement-1.jpg' },
      { category: 'tropical', filename: 'tropical-display-1.jpg' },
      { category: 'garden', filename: 'garden-style-1.jpg' },
      { category: 'sunflower', filename: 'sunflower-bouquet-1.jpg' },
      { category: 'daisy', filename: 'daisy-arrangement-1.jpg' },
      { category: 'carnation', filename: 'carnation-display-1.jpg' },
      { category: 'hydrangea', filename: 'hydrangea-centerpiece-1.jpg' },
      { category: 'iris', filename: 'iris-arrangement-1.jpg' }
    ];

    // Generate sample images for each category
    for (const sample of sampleImages) {
      const timestamp = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      images.push({
        filename: sample.filename,
        path: `assets/gallery/${sample.category}/${sample.filename}`,
        category: sample.category,
        timestamp,
        alt: this.generateAltText(sample.category, sample.filename),
        tags: this.generateTags(sample.category, sample.filename)
      });
    }

    return images.sort((a, b) => {
      // Sort by timestamp descending by default
      if (a.timestamp && b.timestamp) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
      return a.filename.localeCompare(b.filename);
    });
  }

  private generateAltText(category: string, filename: string): string {
    const categoryInfo = this.categories.find(c => c.name === category);
    const categoryName = categoryInfo?.displayName || category;
    return `${categoryName} arrangement - Professional floral design by CreaDevents`;
  }

  private generateTags(category: string, filename: string): string[] {
    const tags = [category];
    
    // Add style tags based on category
    if (['spring', 'summer', 'autumn', 'winter'].includes(category)) {
      tags.push('seasonal');
    } else if (['rose', 'tulip', 'orchid', 'peony', 'lily', 'iris', 'daisy', 'carnation', 'hydrangea', 'sunflower'].includes(category)) {
      tags.push('flower-type');
    } else if (['boho', 'minimalist', 'modern', 'romantic', 'rustic', 'vintage'].includes(category)) {
      tags.push('style');
    } else if (['garden', 'tropical'].includes(category)) {
      tags.push('theme');
    }

    // Add general tags
    tags.push('floral-design', 'wedding', 'event-planning', 'professional');

    return tags;
  }

  private updateCategoryCounts(): void {
    const images = this.allImages();
    this.categories.forEach(category => {
      category.count = images.filter(img => img.category === category.name).length;
      if (category.count > 0 && !category.thumbnail) {
        const firstImage = images.find(img => img.category === category.name);
        category.thumbnail = firstImage?.path;
      }
    });
  }

  private getFilteredImages(): ImageData[] {
    const filter = this.currentFilter();
    let filtered = this.allImages();

    // Filter by categories
    if (filter.categories.length > 0) {
      filtered = filtered.filter(img => filter.categories.includes(img.category));
    }

    // Filter by search term
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(img =>
        img.filename.toLowerCase().includes(term) ||
        img.category.toLowerCase().includes(term) ||
        img.alt?.toLowerCase().includes(term) ||
        img.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filter.sortBy) {
        case 'date':
          if (a.timestamp && b.timestamp) {
            comparison = a.timestamp.getTime() - b.timestamp.getTime();
          } else {
            comparison = a.filename.localeCompare(b.filename);
          }
          break;
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }

  private getPaginatedImages(): ImageData[] {
    const filtered = this.filteredImages();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return filtered.slice(startIndex, endIndex);
  }

  // Public methods for updating state
  updateFilter(filter: Partial<ImageFilter>): void {
    this.currentFilter.update(current => ({ ...current, ...filter }));
    this.currentPage.set(1); // Reset to first page when filter changes
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setItemsPerPage(count: number): void {
    this.itemsPerPage.set(count);
    this.currentPage.set(1);
  }

  toggleCategory(categoryName: string): void {
    const currentCategories = this.currentFilter().categories;
    const updatedCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter(c => c !== categoryName)
      : [...currentCategories, categoryName];
    
    this.updateFilter({ categories: updatedCategories });
  }

  clearFilters(): void {
    this.updateFilter({
      categories: [],
      searchTerm: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }

  getImagesByCategory(categoryName: string): ImageData[] {
    return this.allImages().filter(img => img.category === categoryName);
  }

  getCategoryInfo(categoryName: string): CategoryInfo | undefined {
    return this.categories.find(c => c.name === categoryName);
  }

  getRandomImages(count: number = 6): ImageData[] {
    const images = this.allImages();
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  preloadImages(images: ImageData[]): Promise<void[]> {
    return Promise.all(
      images.map(img => 
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve(); // Still resolve on error to not block
          image.src = img.path;
        })
      )
    );
  }

  // Add batch loading for better performance with large datasets
  loadImageBatch(startIndex: number, batchSize: number = 50): ImageData[] {
    const allImages = this.allImages();
    return allImages.slice(startIndex, startIndex + batchSize);
  }

  // Get current page info
  getCurrentPageInfo() {
    return {
      currentPage: this.currentPage(),
      totalPages: this.totalPages(),
      itemsPerPage: this.itemsPerPage(),
      totalItems: this.filteredImages().length,
      hasNextPage: this.currentPage() < this.totalPages(),
      hasPreviousPage: this.currentPage() > 1
    };
  }
}