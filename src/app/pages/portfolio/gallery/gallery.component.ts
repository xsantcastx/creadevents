import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotImgComponent } from '../../../shared/slot-img/slot-img.component';
import { ImageAssetService, ImageDoc } from '../../../services/image-asset.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, SlotImgComponent],
  template: `
    <div class="portfolio">
      <!-- Hero Section with Slot -->
      <section class="hero-section">
        <slot-img key="portfolio.header" class="hero-img" altDefault="Portfolio – CreaDEvents"></slot-img>
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Portfolio</h1>
            <p>A collection of our favorite floral moments — from intimate celebrations to grand affairs.</p>
          </div>
        </div>
      </section>

      <!-- Filter Tags -->
      <section class="filter-section">
        <div class="container">
          <div class="filter-intro">
            <h2>Browse by Event Type</h2>
            <p>Discover how we bring different celebration styles to life.</p>
          </div>
          
          <div class="filter-tags">
            <button 
              class="filter-tag"
              [class.active]="selectedTag() === 'all'"
              (click)="selectTag('all')">
              All Projects ({{ totalImages() }})
            </button>
            <button 
              class="filter-tag"
              [class.active]="selectedTag() === 'weddings'"
              (click)="selectTag('weddings')">
              Weddings ({{ getTagCount('weddings') }})
            </button>
            <button 
              class="filter-tag"
              [class.active]="selectedTag() === 'corporate'"
              (click)="selectTag('corporate')">
              Corporate ({{ getTagCount('corporate') }})
            </button>
            <button 
              class="filter-tag"
              [class.active]="selectedTag() === 'private'"
              (click)="selectTag('private')">
              Private Events ({{ getTagCount('private') }})
            </button>
          </div>
        </div>
      </section>

      <!-- Portfolio Grid -->
      <section class="portfolio-grid">
        <div class="container">
          @if (loading()) {
            <div class="loading-state">
              <div class="loader"></div>
              <p>Loading portfolio...</p>
            </div>
          }
          
          @if (!loading() && filteredImages().length === 0) {
            <div class="empty-state">
              <h3>No images found</h3>
              <p>Try selecting a different category or check back later.</p>
            </div>
          }
          
          @if (!loading() && filteredImages().length > 0) {
            <div class="masonry-grid">
              @for (image of filteredImages(); track image.id) {
                <div class="portfolio-item" (click)="openModal(image)">
                  <div class="item-image">
                    <img 
                      [src]="image.url" 
                      [alt]="image.alt || 'Portfolio image'"
                      loading="lazy">
                  </div>
                  <div class="item-overlay">
                    <div class="item-info">
                      <h3>{{ formatImageTitle(image.name) }}</h3>
                      @if (image.tags && image.tags.length > 0) {
                        <div class="item-tags">
                          @for (tag of image.tags.slice(0, 2); track tag) {
                            <span class="tag">{{ tag }}</span>
                          }
                          @if (image.tags.length > 2) {
                            <span class="tag-more">+{{ image.tags.length - 2 }}</span>
                          }
                        </div>
                      }
                    </div>
                    <div class="item-action">
                      <span class="view-icon">👁️</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Let's Create Your Story</h2>
            <p>Every project begins with your vision. Share your ideas and let's design something extraordinary together.</p>
            <div class="cta-actions">
              <a href="/contact" class="btn btn-primary">Start Planning</a>
              <a href="/services" class="btn ghost">View Services</a>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal -->
    @if (selectedImage()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ formatImageTitle(selectedImage()!.name) }}</h2>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <img 
              [src]="selectedImage()!.url" 
              [alt]="selectedImage()!.alt || 'Portfolio image'">
          </div>
          @if (selectedImage()!.tags && selectedImage()!.tags!.length > 0) {
            <div class="modal-footer">
              <div class="modal-tags">
                @for (tag of selectedImage()!.tags; track tag) {
                  <span class="modal-tag">{{ tag }}</span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .portfolio {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      min-height: 60vh;
      display: flex;
      align-items: center;
    }

    .hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(15, 61, 62, 0.8) 0%, rgba(15, 61, 62, 0.5) 100%);
      z-index: 2;
      display: flex;
      align-items: center;
      padding: 0 var(--pad);
    }

    .hero-content {
      max-width: var(--container);
      margin: 0 auto;
      color: white;
      text-align: center;
    }

    .hero-content h1 {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      opacity: 0.95;
    }

    /* Filter Section */
    .filter-section {
      padding: 4rem 0;
      background: var(--surface);
    }

    .filter-intro {
      text-align: center;
      margin-bottom: 3rem;
    }

    .filter-intro h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .filter-intro p {
      font-size: 1.1rem;
      color: var(--muted);
      max-width: 500px;
      margin: 0 auto;
    }

    .filter-tags {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-tag {
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--border);
      background: white;
      color: var(--muted);
      border-radius: 30px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-tag:hover,
    .filter-tag.active {
      border-color: var(--brand);
      background: var(--brand);
      color: white;
      transform: translateY(-2px);
    }

    /* Portfolio Grid */
    .portfolio-grid {
      padding: 4rem 0;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 0;
    }

    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top: 3px solid var(--brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 0;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--muted);
    }

    .masonry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      grid-auto-flow: row dense;
    }

    .portfolio-item {
      position: relative;
      border-radius: var(--radius);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .portfolio-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .item-image {
      position: relative;
      aspect-ratio: 4/3;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .portfolio-item:hover .item-image img {
      transform: scale(1.05);
    }

    .item-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.8) 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .portfolio-item:hover .item-overlay {
      opacity: 1;
    }

    .item-info {
      align-self: flex-end;
      color: white;
    }

    .item-info h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .item-tags {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .tag, .tag-more {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      backdrop-filter: blur(10px);
    }

    .tag-more {
      background: rgba(255, 255, 255, 0.3);
      font-weight: 600;
    }

    .item-action {
      align-self: flex-start;
    }

    .view-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      font-size: 1.2rem;
      backdrop-filter: blur(10px);
    }

    /* CTA Section */
    .cta-section {
      padding: 5rem 0;
      background: var(--brand-ghost);
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .cta-content p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      color: var(--muted);
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .modal-content {
      background: white;
      border-radius: var(--radius);
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--brand);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--muted);
      line-height: 1;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: var(--brand);
    }

    .modal-body {
      padding: 0;
      text-align: center;
    }

    .modal-body img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .modal-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .modal-tag {
      background: var(--surface);
      color: var(--brand);
      padding: 0.5rem 1rem;
      border-radius: 15px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .masonry-grid {
        grid-template-columns: 1fr;
      }

      .filter-tags {
        flex-direction: column;
        align-items: center;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .modal-content {
        margin: 1rem;
        max-width: calc(100vw - 2rem);
        max-height: calc(100vh - 2rem);
      }
    }
  `]
})
export class GalleryComponent implements OnInit {
  private imageAssetService = inject(ImageAssetService);

  // State
  loading = signal(true);
  allImages = signal<ImageDoc[]>([]);
  selectedTag = signal<string>('all');
  selectedImage = signal<ImageDoc | null>(null);

  // Computed properties
  totalImages = computed(() => this.allImages().length);

  filteredImages = computed(() => {
    const tag = this.selectedTag();
    if (tag === 'all') {
      return this.allImages();
    }
    return this.allImages().filter(image => 
      image.tags && image.tags.includes(tag)
    );
  });

  ngOnInit() {
    this.loadImages();
  }

  private async loadImages() {
    this.loading.set(true);
    
    try {
      const images = await this.imageAssetService.listAll();
      this.allImages.set(images);
      this.loading.set(false);
    } catch (error) {
      console.error('Error loading images:', error);
      this.loading.set(false);
    }
  }

  selectTag(tag: string) {
    this.selectedTag.set(tag);
  }

  getTagCount(tag: string): number {
    return this.allImages().filter(image => 
      image.tags && image.tags.includes(tag)
    ).length;
  }

  formatImageTitle(fileName: string): string {
    // Remove file extension and convert to title case
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  openModal(image: ImageDoc) {
    this.selectedImage.set(image);
  }

  closeModal() {
    this.selectedImage.set(null);
  }
}