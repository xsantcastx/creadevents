import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageStorageService, GalleryImage } from '../../../services/image-storage.service';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  protected imageStorageService = inject(ImageStorageService);
  private seasonalThemeService = inject(SeasonalThemeService);

  // State
  loading = signal(true);
  allImages = signal<GalleryImage[]>([]);
  filteredImages = signal<GalleryImage[]>([]);
  selectedImage = signal<GalleryImage | null>(null);
  
  // Filters
  selectedCategory = signal('');
  searchTerm = '';
  sortBy = 'newest';
  itemsPerPage = 24;
  showFeaturedOnly = false;
  
  // Pagination
  currentPage = signal(1);

  // Computed properties
  totalImages = computed(() => this.allImages().length);
  
  totalCategories = computed(() => {
    const categories = new Set(this.allImages().map(img => img.category));
    return categories.size;
  });

  categoryStats = computed(() => {
    const stats = new Map<string, number>();
    this.allImages().forEach(img => {
      stats.set(img.category, (stats.get(img.category) || 0) + 1);
    });
    
    return Array.from(stats.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredImages().length / this.itemsPerPage)
  );

  paginatedImages = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredImages().slice(start, end);
  });

  ngOnInit() {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadImages();
  }

  loadImages() {
    this.loading.set(true);
    
    this.imageStorageService.getImages({}, 10000).subscribe({
      next: (images: GalleryImage[]) => {
        this.allImages.set(images);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading images:', error);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allImages()];

    // Category filter
    if (this.selectedCategory()) {
      filtered = filtered.filter(img => img.category === this.selectedCategory());
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(img => 
        img.originalName?.toLowerCase().includes(term) ||
        img.category.toLowerCase().includes(term) ||
        img.subcategory?.toLowerCase().includes(term) ||
        img.tags.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    // Featured filter
    if (this.showFeaturedOnly) {
      filtered = filtered.filter(img => img.featured);
    }

    // Sort
    filtered = this.sortImages(filtered);

    this.filteredImages.set(filtered);
    this.currentPage.set(1); // Reset to first page
  }

  sortImages(images: GalleryImage[]): GalleryImage[] {
    return images.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
        case 'oldest':
          return new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime();
        case 'name':
          return (a.originalName || '').localeCompare(b.originalName || '');
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }

  // Event handlers
  onSearchChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  onItemsPerPageChange() {
    this.currentPage.set(1);
  }

  onFeaturedToggle() {
    this.applyFilters();
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  clearAllFilters() {
    this.selectedCategory.set('');
    this.searchTerm = '';
    this.showFeaturedOnly = false;
    this.sortBy = 'newest';
    this.applyFilters();
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const range: number[] = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);
    
    if (left > 1) {
      range.push(1);
      if (left > 2) range.push(-1); // ellipsis
    }
    
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    
    if (right < total) {
      if (right < total - 1) range.push(-1); // ellipsis
      range.push(total);
    }
    
    return range;
  }

  // Modal functionality
  openImageModal(image: GalleryImage) {
    this.selectedImage.set(image);
  }

  closeImageModal() {
    this.selectedImage.set(null);
  }

  canNavigate(): boolean {
    return this.filteredImages().length > 1;
  }

  getCurrentImageIndex(): number {
    const current = this.selectedImage();
    if (!current) return -1;
    return this.filteredImages().findIndex(img => img.id === current.id);
  }

  hasPreviousImage(): boolean {
    return this.getCurrentImageIndex() > 0;
  }

  hasNextImage(): boolean {
    const index = this.getCurrentImageIndex();
    return index >= 0 && index < this.filteredImages().length - 1;
  }

  navigateImage(direction: 'prev' | 'next') {
    const currentIndex = this.getCurrentImageIndex();
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    const newImage = this.filteredImages()[newIndex];
    
    if (newImage) {
      this.selectedImage.set(newImage);
    }
  }

  // Utility functions
  formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  trackByImageId(index: number, image: GalleryImage): string {
    return image.id || `${image.fileName}_${index}`;
  }
}