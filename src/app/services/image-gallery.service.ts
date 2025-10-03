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
    
    // Image data based on the copied files structure
    const imageData = {
      spring: [
        '2017-06-25_22-45-23_UTC.jpg', '2017-06-25_23-31-57_UTC.jpg', '2017-09-22_01-09-59_UTC.jpg',
        '2017-10-02_14-41-59_UTC.jpg', '2017-11-09_17-27-41_UTC_1.jpg', '2018-02-28_18-15-33_UTC.jpg',
        '2018-03-07_23-13-01_UTC.jpg', '2018-03-22_23-41-44_UTC.jpg', '2018-05-18_22-47-03_UTC_3.jpg',
        '2019-02-27_15-22-28_UTC.jpg', '2019-03-05_18-01-16_UTC.jpg', '2019-04-04_19-50-41_UTC.jpg',
        '2019-06-22_22-20-38_UTC.jpg', '2019-11-09_15-03-06_UTC.jpg', '2020-01-27_23-24-32_UTC_2.jpg',
        '2020-02-03_18-55-02_UTC_2.jpg', '2020-02-20_01-57-58_UTC_2.jpg', '2020-02-20_01-57-58_UTC_3.jpg',
        '2020-03-05_16-48-51_UTC_1.jpg', '2020-04-11_19-00-27_UTC_3.jpg', '2020-04-14_15-02-07_UTC_2.jpg',
        '2020-05-04_21-40-34_UTC.jpg', '2020-05-06_16-41-44_UTC_2.jpg', '2020-05-11_16-31-36_UTC.jpg',
        '2020-06-03_17-27-13_UTC_3.jpg', '2020-06-08_18-14-39_UTC_2.jpg', '2020-06-16_23-28-04_UTC_1.jpg',
        '2020-06-22_18-38-20_UTC_4.jpg', '2020-08-21_18-28-18_UTC_1.jpg', '2020-08-21_18-28-18_UTC_3.jpg',
        '2020-10-23_23-41-20_UTC_1.jpg', '2020-11-06_22-57-12_UTC_3.jpg', '2020-11-10_21-39-24_UTC_2.jpg',
        '2020-12-15_13-45-48_UTC_1.jpg', '2021-01-11_21-27-06_UTC_1.jpg', '2021-01-26_19-05-18_UTC_1.jpg',
        '2021-01-28_21-25-18_UTC.jpg', '2021-02-17_17-24-21_UTC.jpg', '2021-02-27_17-11-01_UTC_1.jpg',
        '2021-02-27_17-11-01_UTC_2.jpg', '2021-03-12_14-54-39_UTC_3.jpg', '2021-03-26_01-20-43_UTC_1.jpg',
        '2021-03-26_01-20-43_UTC_6.jpg', '2021-03-26_22-55-32_UTC_1.jpg', '2021-03-31_19-07-04_UTC.jpg',
        '2021-04-01_23-07-23_UTC_1.jpg', '2021-04-01_23-07-23_UTC_2.jpg', '2021-04-12_17-49-47_UTC_3.jpg',
        '2021-07-20_20-00-17_UTC.jpg', '2021-07-30_22-51-51_UTC.jpg', '2021-08-05_01-36-11_UTC.jpg',
        '2021-08-09_18-40-37_UTC.jpg', '2021-10-16_01-10-46_UTC.jpg', '2021-12-24_17-40-53_UTC.jpg',
        '2021-12-31_20-44-24_UTC_3.jpg', '2022-02-07_23-01-53_UTC_2.jpg', '2022-02-15_15-44-50_UTC.jpg',
        '2022-02-16_00-18-55_UTC_2.jpg', '2022-03-18_18-53-45_UTC.jpg', '2022-04-18_03-51-59_UTC_1.jpg',
        '2022-04-22_13-08-11_UTC.jpg', '2022-07-15_16-07-23_UTC.jpg', '2022-10-14_22-36-40_UTC.jpg',
        '2022-10-28_01-08-23_UTC.jpg', '2022-10-29_20-42-10_UTC.jpg', '2022-11-10_00-52-17_UTC_2.jpg',
        '2022-12-21_16-45-28_UTC_2.jpg', '2022-12-21_16-45-28_UTC_3.jpg', '2023-03-08_23-08-14_UTC.jpg',
        '2023-03-09_20-48-11_UTC.jpg', '2023-06-14_02-04-57_UTC_2.jpg', '2024-06-21_17-24-38_UTC.jpg',
        '2024-11-08_05-22-48_UTC.jpg', '2025-03-31_19-13-58_UTC.jpg', '2025-04-17_15-11-46_UTC.jpg',
        '2025-08-26_18-11-03_UTC.jpg', '278886653_984221958916379_2336968136839092434_n.jpg', '293398211_589802559180923_5630452652282223594_n.jpg'
      ],
      summer: [
        '2020-06-09_04-15-59_UTC.jpg', '2022-04-18_03-51-59_UTC_2.jpg', '2023-01-16_23-03-05_UTC.jpg'
      ],
      autumn: [
        '2017-10-05_17-41-29_UTC.jpg', '2017-10-06_03-21-04_UTC.jpg', '2017-10-11_18-33-10_UTC.jpg',
        '2017-10-11_21-33-05_UTC.jpg', '2017-11-04_18-33-46_UTC.jpg', '2017-11-22_00-30-40_UTC.jpg',
        '2017-11-24_20-11-34_UTC.jpg', '2018-10-06_18-41-15_UTC.jpg', '2018-10-22_15-55-19_UTC_2.jpg',
        '2018-10-24_19-49-13_UTC.jpg', '2018-10-27_18-12-55_UTC_3.jpg', '2018-10-31_19-15-21_UTC.jpg',
        '2019-08-27_17-23-03_UTC.jpg', '2019-08-29_22-45-39_UTC_3.jpg', '2019-09-08_16-19-29_UTC_4.jpg',
        '2019-09-20_01-21-45_UTC_2.jpg', '2019-09-28_13-52-45_UTC.jpg', '2019-10-01_02-19-25_UTC_1.jpg',
        '2019-10-09_16-44-00_UTC_1.jpg', '2019-11-01_16-45-12_UTC.jpg', '2019-11-14_04-09-38_UTC.jpg',
        '2019-11-25_02-32-52_UTC.jpg', '2020-09-13_01-26-26_UTC_3.jpg', '2020-09-13_01-26-26_UTC_5.jpg',
        '2020-09-18_01-32-44_UTC.jpg', '2020-09-22_17-58-29_UTC.jpg', '2020-09-26_14-58-40_UTC_1.jpg',
        '2020-09-26_14-58-40_UTC_2.jpg', '2020-09-30_21-26-24_UTC.jpg', '2020-10-01_16-48-04_UTC_4.jpg',
        '2020-10-05_18-23-55_UTC.jpg', '2020-10-05_22-34-09_UTC.jpg', '2020-10-08_16-57-22_UTC.jpg',
        '2020-10-09_00-21-52_UTC.jpg', '2020-10-09_03-55-45_UTC_4.jpg', '2020-10-09_18-57-47_UTC_2.jpg',
        '2020-10-12_22-17-23_UTC_1.jpg', '2020-10-12_22-17-23_UTC_3.jpg', '2020-10-15_01-01-55_UTC_2.jpg',
        '2020-10-15_01-01-55_UTC_4.jpg', '2020-10-19_21-51-50_UTC_1.jpg', '2020-10-21_23-49-25_UTC.jpg',
        '2020-10-23_00-45-29_UTC.jpg', '2021-09-04_00-54-27_UTC_1.jpg', '2021-09-08_01-25-07_UTC_1.jpg',
        '2021-09-08_01-25-07_UTC_2.jpg', '2021-09-08_21-24-57_UTC_3.jpg', '2021-09-12_18-34-34_UTC_1.jpg',
        '2021-09-13_13-11-26_UTC_2.jpg', '2021-09-30_20-32-23_UTC.jpg', '2021-10-11_22-31-25_UTC.jpg',
        '2021-10-14_22-41-16_UTC_1.jpg', '2021-10-14_22-41-16_UTC_2.jpg', '2021-10-20_16-07-52_UTC.jpg',
        '2021-10-21_18-35-30_UTC.jpg', '2021-10-23_18-05-11_UTC_1.jpg', '2021-10-25_21-08-12_UTC.jpg',
        '2021-11-09_19-00-14_UTC.jpg', '2021-11-18_18-49-45_UTC_4.jpg', '2021-11-19_13-24-37_UTC.jpg',
        '2021-11-19_23-50-50_UTC_2.jpg', '2021-12-04_03-21-50_UTC_1.jpg', '2022-09-09_19-43-52_UTC_2.jpg',
        '2022-09-15_23-55-00_UTC.jpg', '2022-09-24_19-00-54_UTC_1.jpg', '2022-10-01_02-12-15_UTC_2.jpg',
        '2022-10-07_23-29-11_UTC.jpg', '2022-10-11_20-36-50_UTC.jpg', '2022-10-22_18-24-50_UTC.jpg',
        '2022-10-24_22-38-28_UTC_1.jpg', '2022-11-20_01-31-50_UTC.jpg', '2023-08-24_18-24-42_UTC.jpg',
        '2023-08-29_17-54-02_UTC.jpg', '2023-09-05_23-07-47_UTC.jpg', '2023-10-25_15-04-59_UTC.jpg',
        '2023-11-02_22-21-26_UTC.jpg', '2024-01-24_23-08-42_UTC.jpg', '2024-01-26_21-02-48_UTC.jpg',
        '2024-03-02_15-55-52_UTC.jpg', '2024-03-20_18-06-28_UTC.jpg', '2024-05-12_22-40-49_UTC_profile_pic.jpg',
        '2024-08-23_18-37-37_UTC_1.jpg', '2024-08-23_18-37-37_UTC_2.jpg', '2024-09-21_16-21-57_UTC.jpg',
        '2024-11-20_17-55-43_UTC.jpg', '2025-01-14_03-31-33_UTC.jpg', '2025-01-30_15-56-29_UTC.jpg',
        '2025-02-03_15-04-59_UTC.jpg', '2025-02-11_21-25-48_UTC.jpg', '2025-02-19_17-17-52_UTC.jpg',
        '2025-03-07_22-19-27_UTC.jpg', '2025-03-07_22-20-40_UTC.jpg', '2025-03-26_18-43-12_UTC.jpg',
        '2025-04-02_21-08-40_UTC.jpg', '2025-04-22_18-33-15_UTC_2.jpg', '2025-05-24_16-46-02_UTC.jpg',
        '2025-07-05_03-18-15_UTC.jpg', '2025-08-24_16-32-07_UTC_2.jpg', '2025-09-24_19-23-04_UTC.jpg',
        '2025-10-01_15-30-44_UTC_1.jpg', '2025-10-01_15-30-44_UTC_2.jpg', '2025-10-01_15-30-44_UTC_3.jpg',
        '2025-10-01_15-30-44_UTC_4.jpg', '278830236_120731110581295_2243789273275536748_n.jpg', '278924234_399493785091653_1824775866144470019_n.jpg'
      ],
      winter: [
        '2017-12-04_22-47-17_UTC_1.jpg', '2018-12-13_03-16-35_UTC.jpg', '2018-12-17_15-07-01_UTC.jpg',
        '2019-10-23_23-20-36_UTC.jpg', '2019-11-25_22-55-31_UTC.jpg', '2019-12-10_16-56-38_UTC.jpg',
        '2019-12-19_17-38-26_UTC.jpg', '2019-12-28_21-10-30_UTC.jpg', '2020-12-02_15-47-28_UTC_2.jpg',
        '2020-12-02_15-47-28_UTC_3.jpg', '2021-12-06_21-08-00_UTC.jpg', '2023-01-05_18-52-06_UTC.jpg',
        '2023-12-12_22-24-30_UTC.jpg'
      ]
      // Continue with other categories...
    };

    // Process each category
    for (const [category, filenames] of Object.entries(imageData)) {
      for (const filename of filenames) {
        // Extract timestamp from filename if available
        let timestamp: Date | undefined;
        const timestampMatch = filename.match(/^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_UTC/);
        if (timestampMatch) {
          const dateStr = timestampMatch[1].replace('_', 'T').replace(/-/g, ':').slice(0, -3);
          timestamp = new Date(dateStr + 'Z');
        }

        images.push({
          filename,
          path: `assets/gallery/${category}/${filename}`,
          category,
          timestamp,
          alt: this.generateAltText(category, filename),
          tags: this.generateTags(category, filename)
        });
      }
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
    return `${categoryName} arrangement - Professional floral design`;
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
}