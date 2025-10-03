import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageStorageService, GalleryImage } from '../../../services/image-storage.service';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { SlotImgComponent } from '../../../shared/slot-img/slot-img.component';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule, SlotImgComponent],
  template: `
    <div class="gallery-container">
      <!-- Hero Section -->
      <section class="gallery-hero">
        <slot-img key="portfolio.header" altDefault="Portfolio header" class="hero-background" />
        <div class="hero-content">
          <h1>Our Gallery</h1>
          <p>Discover our collection of {{ totalImages() }} beautiful moments across {{ totalCategories() }} categories</p>
        </div>
      </section>

      <!-- Filter Controls -->
      <div class="filter-controls">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="onSearchChange()"
            placeholder="Search images by name, category, or tags..."
            class="search-input">
        </div>

        <div class="category-filters">
          <button 
            type="button"
            (click)="selectCategory('')" 
            [class.active]="selectedCategory() === ''"
            class="category-btn all-btn">
            All Categories ({{ totalImages() }})
          </button>
          
          <button 
            type="button"
            *ngFor="let stat of categoryStats()" 
            (click)="selectCategory(stat.category)"
            [class.active]="selectedCategory() === stat.category"
            class="category-btn">
            {{ formatCategoryName(stat.category) }} ({{ stat.count }})
          </button>
        </div>

        <div class="view-options">
          <div class="items-per-page">
            <label>Show:</label>
            <select [(ngModel)]="itemsPerPage" (ngModelChange)="onItemsPerPageChange()">
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
              <option value="96">96</option>
            </select>
            <span>per page</span>
          </div>

          <div class="sort-options">
            <label>Sort by:</label>
            <select [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div class="featured-toggle">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="showFeaturedOnly" 
                (ngModelChange)="onFeaturedToggle()">
              Featured Only
            </label>
          </div>
        </div>
      </div>

      <!-- Results Info -->
      <div class="results-info" *ngIf="!loading()">
        <p>
          Showing {{ paginatedImages().length }} of {{ filteredImages().length }} images
          <span *ngIf="selectedCategory()"> in "{{ formatCategoryName(selectedCategory()) }}"</span>
          <span *ngIf="searchTerm"> matching "{{ searchTerm }}"</span>
        </p>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading()">
        <div class="loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>

      <!-- Image Grid -->
      <div class="image-grid" *ngIf="!loading() && paginatedImages().length > 0">
        <div 
          class="image-card" 
          *ngFor="let image of paginatedImages(); trackBy: trackByImageId"
          (click)="openImageModal(image)">
          
          <div class="image-container">
            <img 
              [src]="imageStorageService.getThumbnailUrl(image.storageUrl || image.downloadURL || '', 'medium')" 
              [alt]="image.altText"
              loading="lazy"
              class="gallery-image">
            
            <div class="image-overlay">
              <div class="image-info">
                <h3 class="image-title">{{ image.originalName }}</h3>
                <p class="image-category">{{ formatCategoryName(image.category) }}</p>
                <div class="image-tags" *ngIf="image.tags.length > 0">
                  <span class="tag" *ngFor="let tag of image.tags.slice(0, 3)">{{ tag }}</span>
                  <span class="tag more" *ngIf="image.tags.length > 3">+{{ image.tags.length - 3 }}</span>
                </div>
              </div>
              
              <div class="image-actions">
                <button type="button" class="action-btn view-btn" title="View Full Size">
                  👁️
                </button>
                <span class="featured-badge" *ngIf="image.featured" title="Featured Image">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading() && paginatedImages().length === 0">
        <div class="empty-content">
          <h3>No images found</h3>
          <p *ngIf="searchTerm || selectedCategory() || showFeaturedOnly">
            Try adjusting your filters or search terms.
          </p>
          <p *ngIf="!searchTerm && !selectedCategory() && !showFeaturedOnly">
            The gallery is currently empty. Check back later for updates.
          </p>
          <button type="button" (click)="clearAllFilters()" class="clear-filters-btn">
            Clear All Filters
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages() > 1 && !loading()">
        <button 
          type="button"
          (click)="goToPage(currentPage() - 1)" 
          [disabled]="currentPage() === 1"
          class="page-btn">
          ← Previous
        </button>

        <div class="page-numbers">
          <button 
            type="button"
            *ngFor="let page of getVisiblePages()" 
            (click)="goToPage(page)"
            [class.active]="page === currentPage()"
            [class.ellipsis]="page === -1"
            [disabled]="page === -1"
            class="page-number">
            {{ page === -1 ? '...' : page }}
          </button>
        </div>

        <button 
          type="button"
          (click)="goToPage(currentPage() + 1)" 
          [disabled]="currentPage() === totalPages()"
          class="page-btn">
          Next →
        </button>
      </div>
    </div>

    <!-- Image Modal -->
    <div class="image-modal" *ngIf="selectedImage()" (click)="closeImageModal()">
      <div class="modal-backdrop"></div>
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ selectedImage()?.originalName }}</h2>
          <button type="button" (click)="closeImageModal()" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="modal-image-container">
            <img 
              [src]="selectedImage()?.storageUrl" 
              [alt]="selectedImage()?.altText"
              class="modal-image">
          </div>
          
          <div class="modal-details">
            <div class="detail-row">
              <span class="label">Category:</span>
              <span class="value">{{ formatCategoryName(selectedImage()?.category || '') }}</span>
            </div>
            
            <div class="detail-row" *ngIf="selectedImage()?.subcategory">
              <span class="label">Subcategory:</span>
              <span class="value">{{ selectedImage()?.subcategory }}</span>
            </div>
            
            <div class="detail-row" *ngIf="selectedImage()?.tags && selectedImage()!.tags.length > 0">
              <span class="label">Tags:</span>
              <div class="tags-list">
                <span class="tag" *ngFor="let tag of selectedImage()!.tags">{{ tag }}</span>
              </div>
            </div>
            
            <div class="detail-row">
              <span class="label">Upload Date:</span>
              <span class="value">{{ formatDate(selectedImage()?.uploadedAt) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">File Size:</span>
              <span class="value">{{ formatFileSize(selectedImage()?.metadata?.size || 0) }}</span>
            </div>
            
            <div class="detail-row" *ngIf="selectedImage()?.featured">
              <span class="featured-indicator">⭐ Featured Image</span>
            </div>
          </div>
        </div>

        <div class="modal-navigation" *ngIf="canNavigate()">
          <button 
            type="button"
            (click)="navigateImage('prev')" 
            [disabled]="!hasPreviousImage()"
            class="nav-btn prev-btn">
            ← Previous
          </button>
          
          <span class="nav-info">
            {{ getCurrentImageIndex() + 1 }} of {{ filteredImages().length }}
          </span>
          
          <button 
            type="button"
            (click)="navigateImage('next')" 
            [disabled]="!hasNextImage()"
            class="nav-btn next-btn">
            Next →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .gallery-hero {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, var(--primary-color, #2c3e50) 0%, var(--secondary-color, #34495e) 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 40px;
    }

    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 15px;
      font-weight: 300;
    }

    .hero-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .filter-controls {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .search-box {
      margin-bottom: 25px;
    }

    .search-input {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color, #2c3e50);
    }

    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 25px;
    }

    .category-btn {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 500;
    }

    .category-btn:hover {
      border-color: var(--primary-color, #2c3e50);
      transform: translateY(-2px);
    }

    .category-btn.active {
      background: var(--primary-color, #2c3e50);
      color: white;
      border-color: var(--primary-color, #2c3e50);
    }

    .all-btn.active {
      background: var(--accent-color, #e74c3c);
      border-color: var(--accent-color, #e74c3c);
    }

    .view-options {
      display: flex;
      gap: 30px;
      align-items: center;
      flex-wrap: wrap;
    }

    .view-options > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .view-options select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }

    .results-info {
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
    }

    .loading-container {
      text-align: center;
      padding: 80px 20px;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--primary-color, #2c3e50);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }

    .image-card {
      cursor: pointer;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      background: white;
    }

    .image-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.15);
    }

    .image-container {
      position: relative;
      aspect-ratio: 4/3;
      overflow: hidden;
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .image-card:hover .gallery-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 40%,
        rgba(0,0,0,0.7) 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .image-card:hover .image-overlay {
      opacity: 1;
    }

    .image-info {
      align-self: flex-end;
      color: white;
      text-align: center;
    }

    .image-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 5px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    .image-category {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .image-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      justify-content: center;
    }

    .tag {
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      backdrop-filter: blur(10px);
    }

    .tag.more {
      background: rgba(255,255,255,0.3);
      font-weight: 600;
    }

    .image-actions {
      align-self: flex-start;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .action-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .featured-badge {
      background: #ffc107;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-content h3 {
      font-size: 24px;
      margin-bottom: 15px;
      color: #666;
    }

    .empty-content p {
      color: #888;
      margin-bottom: 25px;
    }

    .clear-filters-btn {
      padding: 12px 24px;
      background: var(--primary-color, #2c3e50);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 40px;
    }

    .page-btn, .page-number {
      padding: 10px 15px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-number.active {
      background: var(--primary-color, #2c3e50);
      color: white;
      border-color: var(--primary-color, #2c3e50);
    }

    .page-number.ellipsis {
      border: none;
      background: none;
      cursor: default;
    }

    .image-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(10px);
    }

    .modal-content {
      position: relative;
      background: white;
      border-radius: 12px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 30px;
      cursor: pointer;
      color: #666;
      line-height: 1;
    }

    .modal-body {
      padding: 30px;
    }

    .modal-image-container {
      text-align: center;
      margin-bottom: 30px;
    }

    .modal-image {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 8px;
    }

    .modal-details {
      display: grid;
      gap: 15px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .detail-row .label {
      font-weight: 600;
      color: #666;
      min-width: 120px;
    }

    .detail-row .value {
      color: #333;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tags-list .tag {
      background: #f0f0f0;
      color: #333;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
    }

    .featured-indicator {
      color: #ffc107;
      font-weight: 600;
    }

    .modal-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-top: 1px solid #eee;
      background: #f8f9fa;
    }

    .nav-btn {
      padding: 10px 20px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-btn:hover:not(:disabled) {
      background: var(--primary-color, #2c3e50);
      color: white;
      border-color: var(--primary-color, #2c3e50);
    }

    .nav-info {
      font-size: 14px;
      color: #666;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .filter-controls {
        padding: 20px;
      }

      .category-filters {
        justify-content: center;
      }

      .view-options {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }

      .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
      }

      .modal-content {
        margin: 10px;
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
      }

      .modal-header, .modal-body, .modal-navigation {
        padding: 15px 20px;
      }

      .modal-navigation {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
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
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
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