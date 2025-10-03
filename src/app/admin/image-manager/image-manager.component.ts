import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageStorageService, GalleryImage, ImageUploadProgress, GalleryFilter } from '../../services/image-storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-image-manager',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="image-manager">
      <div class="manager-header">
        <div class="header-left">
          <button type="button" (click)="navigateBack()" class="back-btn">
            ← Back to Dashboard
          </button>
          <h2>Image Gallery Manager</h2>
        </div>
        <div class="stats">
          <div class="stat-card">
            <span class="stat-number">{{ totalImages() }}</span>
            <span class="stat-label">Total Images</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ totalCategories() }}</span>
            <span class="stat-label">Categories</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ formatFileSize(totalSize()) }}</span>
            <span class="stat-label">Total Size</span>
          </div>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="upload-section" *ngIf="authService.canUploadFiles()">
        <h3>Upload New Images</h3>
        
        <div class="upload-form">
          <div class="form-group">
            <label for="category">Category:</label>
            <select [(ngModel)]="selectedCategory" id="category" required>
              <option value="">Select Category</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
              <option value="boho">Boho</option>
              <option value="minimalist">Minimalist</option>
              <option value="modern">Modern</option>
              <option value="romantic">Romantic</option>
              <option value="rustic">Rustic</option>
              <option value="vintage">Vintage</option>
              <option value="rose">Rose</option>
              <option value="tulip">Tulip</option>
              <option value="orchid">Orchid</option>
              <option value="peony">Peony</option>
              <option value="lily">Lily</option>
              <option value="iris">Iris</option>
              <option value="daisy">Daisy</option>
              <option value="carnation">Carnation</option>
              <option value="hydrangea">Hydrangea</option>
              <option value="sunflower">Sunflower</option>
              <option value="garden">Garden</option>
              <option value="tropical">Tropical</option>
            </select>
          </div>

          <div class="form-group">
            <label for="subcategory">Subcategory (optional):</label>
            <input type="text" [(ngModel)]="selectedSubcategory" id="subcategory" 
                   placeholder="e.g., outdoor, indoor, ceremony">
          </div>

          <div class="form-group">
            <label for="tags">Tags (comma-separated):</label>
            <input type="text" [(ngModel)]="tagsInput" id="tags" 
                   placeholder="e.g., elegant, colorful, large bouquet">
          </div>

          <div class="form-group">
            <label for="files">Select Images:</label>
            <input type="file" (change)="onFileSelect($event)" 
                   multiple accept="image/*" id="files">
            <small>Max 10 files, 5MB each. Supported: JPG, PNG, WebP</small>
          </div>

          <button type="button" (click)="uploadImages()" 
                  [disabled]="!canUpload() || uploading()" 
                  class="upload-btn">
            {{ uploading() ? 'Uploading...' : 'Upload Images' }}
          </button>
        </div>

        <!-- Upload Progress -->
        <div class="upload-progress" *ngIf="uploadProgress().length > 0">
          <h4>Upload Progress</h4>
          <div class="progress-list">
            <div class="progress-item" *ngFor="let progress of uploadProgress()">
              <span class="file-name">{{ progress.fileName }}</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="progress.progress"></div>
              </div>
              <span class="progress-text">{{ progress.progress }}%</span>
              <span class="status" [class]="progress.completed ? 'success' : progress.error ? 'error' : 'pending'">
                {{ progress.completed ? '✓' : progress.error ? '✗' : '...' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search Section -->
      <div class="filter-section">
        <h3>Manage Images</h3>
        
        <div class="filters">
          <div class="filter-group">
            <label>Search:</label>
            <input type="text" [(ngModel)]="searchTerm" 
                   (ngModelChange)="applyFilters()"
                   placeholder="Search by name, category, tags...">
          </div>

          <div class="filter-group">
            <label>Category:</label>
            <select [(ngModel)]="filterCategory" (ngModelChange)="applyFilters()">
              <option value="">All Categories</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
              <option value="boho">Boho</option>
              <option value="minimalist">Minimalist</option>
              <option value="modern">Modern</option>
              <option value="romantic">Romantic</option>
              <option value="rustic">Rustic</option>
              <option value="vintage">Vintage</option>
              <option value="rose">Rose</option>
              <option value="tulip">Tulip</option>
              <option value="orchid">Orchid</option>
              <option value="peony">Peony</option>
              <option value="lily">Lily</option>
              <option value="iris">Iris</option>
              <option value="daisy">Daisy</option>
              <option value="carnation">Carnation</option>
              <option value="hydrangea">Hydrangea</option>
              <option value="sunflower">Sunflower</option>
              <option value="garden">Garden</option>
              <option value="tropical">Tropical</option>
            </select>
          </div>

          <div class="filter-group">
            <label>
              <input type="checkbox" [(ngModel)]="showFeaturedOnly" 
                     (ngModelChange)="applyFilters()">
              Featured Only
            </label>
          </div>

          <button type="button" (click)="resetFilters()" class="reset-btn">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Images Grid -->
      <div class="images-grid" *ngIf="!loading()">
        <div class="grid-controls">
          <span class="results-count">{{ filteredImages().length }} images found</span>
          
          <div class="view-controls">
            <button type="button" (click)="setGridSize('small')" 
                    [class.active]="gridSize() === 'small'">Small</button>
            <button type="button" (click)="setGridSize('medium')" 
                    [class.active]="gridSize() === 'medium'">Medium</button>
            <button type="button" (click)="setGridSize('large')" 
                    [class.active]="gridSize() === 'large'">Large</button>
          </div>
        </div>

        <div class="image-grid" [class]="'grid-' + gridSize()">
          <div class="image-card" *ngFor="let image of paginatedImages(); trackBy: trackByImageId">
            <div class="image-container">
              <img [src]="imageStorageService.getThumbnailUrl(image.storageUrl || image.downloadURL || '', 'medium')" 
                   [alt]="image.altText"
                   (click)="selectImage(image)"
                   loading="lazy">
              
              <div class="image-overlay">
                <div class="image-actions">
                  <button type="button" (click)="toggleFeatured(image)" 
                          [class.active]="image.featured"
                          title="Toggle Featured">
                    ⭐
                  </button>
                  <button type="button" (click)="editImage(image)" 
                          title="Edit">
                    ✏️
                  </button>
                  <button type="button" (click)="deleteImage(image)" 
                          title="Delete" 
                          class="delete-btn">
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div class="image-info">
              <div class="image-title">{{ image.originalName }}</div>
              <div class="image-meta">
                <span class="category">{{ image.category }}</span>
                <span class="subcategory" *ngIf="image.subcategory">{{ image.subcategory }}</span>
                <span class="size">{{ formatFileSize(image.metadata?.size || 0) }}</span>
              </div>
              <div class="image-tags">
                <span class="tag" *ngFor="let tag of image.tags">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages() > 1">
          <button type="button" (click)="previousPage()" 
                  [disabled]="currentPage() === 1">
            Previous
          </button>
          
          <span class="page-info">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          
          <button type="button" (click)="nextPage()" 
                  [disabled]="currentPage() === totalPages()">
            Next
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading()">
        <div class="loading-spinner"></div>
        <p>Loading images...</p>
      </div>

      <!-- Selected Image Modal -->
      <div class="modal" *ngIf="selectedImage()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedImage()?.originalName }}</h3>
            <button type="button" (click)="closeModal()" class="close-btn">×</button>
          </div>
          
          <div class="modal-body">
            <img [src]="selectedImage()?.storageUrl" [alt]="selectedImage()?.altText">
            
            <div class="image-details">
              <div class="detail-group">
                <label>Category:</label>
                <span>{{ selectedImage()?.category }}</span>
              </div>
              
              <div class="detail-group" *ngIf="selectedImage()?.subcategory">
                <label>Subcategory:</label>
                <span>{{ selectedImage()?.subcategory }}</span>
              </div>
              
              <div class="detail-group">
                <label>Tags:</label>
                <span>            <span>{{ selectedImage()?.tags?.join(', ') || 'None' }}</span></span>
              </div>
              
              <div class="detail-group">
                <label>Size:</label>
                <span>{{ formatFileSize(selectedImage()?.metadata?.size || 0) }}</span>
              </div>
              
              <div class="detail-group">
                <label>Uploaded:</label>
                <span>{{ selectedImage()?.uploadedAt | date:'medium' }}</span>
              </div>
              
              <div class="detail-group">
                <label>Featured:</label>
                <span>{{ selectedImage()?.featured ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-manager {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .back-btn {
      padding: 8px 16px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }

    .back-btn:hover {
      background: #5a6268;
    }

    .stats {
      display: flex;
      gap: 20px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      min-width: 100px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }

    .upload-section, .filter-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .upload-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input, .form-group select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .upload-btn {
      grid-column: span 2;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    .upload-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .upload-progress {
      margin-top: 20px;
    }

    .progress-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }

    .filters {
      display: flex;
      gap: 20px;
      align-items: end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .images-grid {
      margin-top: 30px;
    }

    .grid-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .view-controls {
      display: flex;
      gap: 5px;
    }

    .view-controls button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
    }

    .view-controls button.active {
      background: #007bff;
      color: white;
    }

    .image-grid {
      display: grid;
      gap: 20px;
    }

    .image-grid.grid-small {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .image-grid.grid-medium {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }

    .image-grid.grid-large {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    .image-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .image-container {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .image-container:hover img {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .image-container:hover .image-overlay {
      opacity: 1;
    }

    .image-actions {
      display: flex;
      gap: 10px;
    }

    .image-actions button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      font-size: 16px;
    }

    .image-actions button.active {
      background: #ffc107;
    }

    .image-actions button.delete-btn {
      background: #dc3545;
      color: white;
    }

    .image-info {
      padding: 15px;
    }

    .image-title {
      font-weight: 500;
      margin-bottom: 8px;
      word-break: break-word;
    }

    .image-meta {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }

    .image-tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .tag {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
    }

    .pagination button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-body img {
      max-width: 100%;
      height: auto;
      margin-bottom: 20px;
    }

    .image-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .detail-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .detail-group label {
      font-weight: 500;
      color: #666;
    }

    @media (max-width: 768px) {
      .upload-form {
        grid-template-columns: 1fr;
      }
      
      .filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      .grid-controls {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
})
export class ImageManagerComponent implements OnInit {
  protected imageStorageService = inject(ImageStorageService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  // Upload state
  selectedCategory = '';
  selectedSubcategory = '';
  tagsInput = '';
  selectedFiles: File[] = [];
  uploading = signal(false);
  uploadProgress = signal<ImageUploadProgress[]>([]);

  // Filter state
  searchTerm = '';
  filterCategory = '';
  showFeaturedOnly = false;
  
  // Display state
  loading = signal(true);
  allImages = signal<GalleryImage[]>([]);
  filteredImages = signal<GalleryImage[]>([]);
  selectedImage = signal<GalleryImage | null>(null);
  gridSize = signal<'small' | 'medium' | 'large'>('medium');
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = 24;

  // Computed properties
  totalImages = computed(() => this.allImages().length);
  totalCategories = computed(() => {
    const categories = new Set(this.allImages().map(img => img.category));
    return categories.size;
  });
  totalSize = computed(() => 
    this.allImages().reduce((sum, img) => sum + (img.metadata?.size || 0), 0)
  );
  
  totalPages = computed(() => 
    Math.ceil(this.filteredImages().length / this.itemsPerPage)
  );
  
  paginatedImages = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredImages().slice(start, end);
  });

  ngOnInit() {
    this.loadImages();
  }

  navigateBack() {
    this.router.navigate(['/admin']);
  }

  async loadImages() {
    this.loading.set(true);
    
    try {
      this.imageStorageService.getImages({}, 10000).subscribe({
        next: (images) => {
          this.allImages.set(images);
          this.applyFilters();
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading images:', error);
          this.loading.set(false);
        }
      });
    } catch (error) {
      console.error('Error loading images:', error);
      this.loading.set(false);
    }
  }

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isImage && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      alert('Some files were filtered out. Only images under 5MB are allowed.');
    }
    
    this.selectedFiles = validFiles.slice(0, 10); // Max 10 files
  }

  canUpload(): boolean {
    return this.selectedCategory !== '' && this.selectedFiles.length > 0;
  }

  uploadImages() {
    if (!this.canUpload()) return;
    
    this.uploading.set(true);
    const tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    this.imageStorageService.uploadImages(
      this.selectedFiles,
      this.selectedCategory
    ).subscribe({
      next: (progress) => {
        this.uploadProgress.set(progress);
        
        // Check if all uploads are complete
        const allComplete = progress.every(p => p.completed);
        if (allComplete) {
          this.uploading.set(false);
          this.resetUploadForm();
          this.loadImages(); // Refresh the image list
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploading.set(false);
      }
    });
  }

  resetUploadForm() {
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.tagsInput = '';
    this.selectedFiles = [];
    this.uploadProgress.set([]);
  }

  applyFilters() {
    let filtered = this.allImages();
    
    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(img => 
        img.originalName?.toLowerCase().includes(term) ||
        img.category.toLowerCase().includes(term) ||
        img.subcategory?.toLowerCase().includes(term) ||
        img.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Category filter
    if (this.filterCategory) {
      filtered = filtered.filter(img => img.category === this.filterCategory);
    }
    
    // Featured filter
    if (this.showFeaturedOnly) {
      filtered = filtered.filter(img => img.featured);
    }
    
    this.filteredImages.set(filtered);
    this.currentPage.set(1); // Reset to first page
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterCategory = '';
    this.showFeaturedOnly = false;
    this.applyFilters();
  }

  setGridSize(size: 'small' | 'medium' | 'large') {
    this.gridSize.set(size);
  }

  selectImage(image: GalleryImage) {
    this.selectedImage.set(image);
  }

  closeModal() {
    this.selectedImage.set(null);
  }

  toggleFeatured(image: GalleryImage) {
    if (!image.id) return;
    
    this.imageStorageService.updateImage(image.id, {
      featured: !image.featured
    }).subscribe({
      next: () => {
        // Update local state
        const updated = this.allImages().map(img => 
          img.id === image.id ? { ...img, featured: !img.featured } : img
        );
        this.allImages.set(updated);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error updating image:', error);
      }
    });
  }

  editImage(image: GalleryImage) {
    // TODO: Implement edit modal
    console.log('Edit image:', image);
  }

  deleteImage(image: GalleryImage) {
    if (!image.id) return;
    
    if (confirm(`Are you sure you want to delete "${image.originalName}"?`)) {
      this.imageStorageService.deleteImage(image.id, image.storageUrl || image.downloadURL || '').subscribe({
        next: () => {
          // Remove from local state
          const updated = this.allImages().filter(img => img.id !== image.id);
          this.allImages.set(updated);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting image:', error);
        }
      });
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  trackByImageId(index: number, image: GalleryImage): string {
    return image.id || `${image.fileName}_${index}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}