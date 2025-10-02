import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'weddings' | 'corporate' | 'floral' | 'seasonal' | 'parties';
  featured: boolean;
  date: string;
  client?: string;
}

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="portfolio-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Our Portfolio</h1>
          <p class="hero-subtitle">
            Explore our collection of beautiful events, stunning floral arrangements, 
            and memorable celebrations crafted with passion and precision.
          </p>
        </div>
      </section>

      <!-- Portfolio Gallery -->
      <section class="gallery-section">
        <div class="container">
          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'all'"
              (click)="filterPortfolio('all')">
              All Projects
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'weddings'"
              (click)="filterPortfolio('weddings')">
              Weddings
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'corporate'"
              (click)="filterPortfolio('corporate')">
              Corporate Events
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'floral'"
              (click)="filterPortfolio('floral')">
              Floral Designs
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'seasonal'"
              (click)="filterPortfolio('seasonal')">
              Seasonal Decor
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'parties'"
              (click)="filterPortfolio('parties')">
              Private Parties
            </button>
          </div>

          <!-- Portfolio Grid -->
          <div class="portfolio-grid">
            <div 
              *ngFor="let item of filteredPortfolio; let i = index" 
              class="portfolio-item"
              [class.featured]="item.featured"
              [class.large]="i % 5 === 0"
              (click)="openLightbox(item, i)">
              
              <div class="portfolio-image">
                <img [src]="item.image" [alt]="item.title" loading="lazy">
                <div class="portfolio-overlay">
                  <div class="portfolio-info">
                    <div class="category-badge">{{ getCategoryLabel(item.category) }}</div>
                    <h3 class="portfolio-title">{{ item.title }}</h3>
                    <p class="portfolio-description">{{ item.description }}</p>
                    <div class="portfolio-meta">
                      <span class="date">{{ item.date }}</span>
                      <span class="client" *ngIf="item.client">{{ item.client }}</span>
                    </div>
                  </div>
                  <div class="view-button">
                    <i class="view-icon">👁</i>
                    View Details
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div class="load-more-container" *ngIf="hasMoreItems">
            <button class="btn btn-outline" (click)="loadMoreItems()">
              Load More Projects
            </button>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Create Something Beautiful?</h2>
            <p>Let's bring your vision to life with our expert planning and design services.</p>
            <div class="cta-actions">
              <a href="tel:7863562958" class="btn btn-primary">Call (786) 356-2958</a>
              <a routerLink="/contact" class="btn btn-outline">Start Your Project</a>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Lightbox Modal -->
    <div class="lightbox-overlay" *ngIf="lightboxOpen" (click)="closeLightbox()">
      <div class="lightbox-container" (click)="$event.stopPropagation()">
        <button class="lightbox-close" (click)="closeLightbox()">×</button>
        
        <div class="lightbox-content" *ngIf="selectedItem">
          <div class="lightbox-image">
            <img [src]="selectedItem.image" [alt]="selectedItem.title">
          </div>
          
          <div class="lightbox-info">
            <div class="category-badge">{{ getCategoryLabel(selectedItem.category) }}</div>
            <h2>{{ selectedItem.title }}</h2>
            <p>{{ selectedItem.description }}</p>
            
            <div class="lightbox-meta">
              <div class="meta-item">
                <strong>Date:</strong> {{ selectedItem.date }}
              </div>
              <div class="meta-item" *ngIf="selectedItem.client">
                <strong>Client:</strong> {{ selectedItem.client }}
              </div>
              <div class="meta-item">
                <strong>Category:</strong> {{ getCategoryLabel(selectedItem.category) }}
              </div>
            </div>
            
            <div class="lightbox-actions">
              <a routerLink="/contact" class="btn btn-primary">Inquire About Similar Project</a>
              <a [routerLink]="['/services']" class="btn btn-outline">View Our Services</a>
            </div>
          </div>
        </div>
        
        <!-- Navigation Arrows -->
        <button class="lightbox-nav prev" (click)="previousImage()" *ngIf="currentImageIndex > 0">‹</button>
        <button class="lightbox-nav next" (click)="nextImage()" *ngIf="currentImageIndex < filteredPortfolio.length - 1">›</button>
      </div>
    </div>
  `,
  styles: [`
    .portfolio-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      background: linear-gradient(
        135deg,
        var(--theme-primary, #7FB069) 0%,
        var(--theme-secondary, #F7E9E3) 100%
      );
      padding: 4rem 0;
      text-align: center;
      color: white;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .hero-subtitle {
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.95;
    }

    .gallery-section {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .filter-tabs {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--theme-primary, #7FB069);
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .filter-tab:hover,
    .filter-tab.active {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 4rem;
    }

    .portfolio-item {
      position: relative;
      border-radius: 15px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
      height: 250px;
    }

    .portfolio-item.large {
      grid-column: span 2;
      height: 400px;
    }

    .portfolio-item.featured {
      border: 3px solid var(--theme-accent, #FFEAA7);
    }

    .portfolio-item:hover {
      transform: translateY(-5px);
    }

    .portfolio-image {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .portfolio-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .portfolio-item:hover .portfolio-image img {
      transform: scale(1.1);
    }

    .portfolio-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(0,0,0,0.8) 0%,
        rgba(0,0,0,0.4) 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .portfolio-item:hover .portfolio-overlay {
      opacity: 1;
    }

    .category-badge {
      background: var(--theme-accent, #FFEAA7);
      color: var(--theme-text, #2D3436);
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      width: fit-content;
    }

    .portfolio-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }

    .portfolio-description {
      font-size: 0.9rem;
      line-height: 1.4;
      opacity: 0.9;
    }

    .portfolio-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 0.5rem;
    }

    .view-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .view-icon {
      font-size: 1.2rem;
    }

    .load-more-container {
      text-align: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: inline-block;
      cursor: pointer;
      background: none;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .cta-section {
      background: var(--theme-secondary, #F7E9E3);
      padding: 4rem 0;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.1rem;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .cta-actions .btn {
      padding: 1rem 2rem;
      font-size: 1rem;
    }

    /* Lightbox Styles */
    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .lightbox-container {
      position: relative;
      max-width: 1000px;
      width: 100%;
      max-height: 90vh;
      background: white;
      border-radius: 15px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .lightbox-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 10;
      transition: background 0.3s ease;
    }

    .lightbox-close:hover {
      background: rgba(0,0,0,0.9);
    }

    .lightbox-content {
      display: flex;
      height: 100%;
    }

    .lightbox-image {
      flex: 2;
      min-height: 400px;
    }

    .lightbox-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lightbox-info {
      flex: 1;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .lightbox-info h2 {
      font-size: 1.8rem;
      color: var(--theme-text, #2D3436);
      margin: 0;
    }

    .lightbox-info p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
    }

    .lightbox-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-item {
      font-size: 0.9rem;
    }

    .lightbox-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: auto;
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .lightbox-nav:hover {
      background: rgba(0,0,0,0.9);
    }

    .lightbox-nav.prev {
      left: 1rem;
    }

    .lightbox-nav.next {
      right: 1rem;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .portfolio-grid {
        grid-template-columns: 1fr;
      }

      .portfolio-item.large {
        grid-column: span 1;
        height: 250px;
      }

      .filter-tabs {
        justify-content: stretch;
      }

      .filter-tab {
        flex: 1;
        text-align: center;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .cta-actions .btn {
        width: 100%;
        max-width: 300px;
      }

      .lightbox-content {
        flex-direction: column;
      }

      .lightbox-image {
        min-height: 250px;
      }

      .lightbox-info {
        padding: 1.5rem;
      }
    }
  `]
})
export class GalleryComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  
  selectedCategory: string = 'all';
  lightboxOpen: boolean = false;
  selectedItem: PortfolioItem | null = null;
  currentImageIndex: number = 0;
  itemsPerPage: number = 12;
  currentPage: number = 1;
  
  // Portfolio data using existing assets
  portfolioItems: PortfolioItem[] = [
    {
      id: 'wedding-elegant-roses',
      title: 'Elegant Rose Wedding',
      description: 'A romantic wedding celebration featuring stunning rose arrangements and classic elegance.',
      image: '/assets/fb_4888_8929514942_2_48x2_48.jpg',
      category: 'weddings',
      featured: true,
      date: 'September 2024',
      client: 'Maria & Carlos'
    },
    {
      id: 'corporate-gala',
      title: 'Annual Corporate Gala',
      description: 'Sophisticated corporate event with professional floral displays and ambient lighting.',
      image: '/assets/ig_17883536292_1336_.jpg',
      category: 'corporate',
      featured: false,
      date: 'August 2024',
      client: 'Tech Solutions Inc.'
    },
    {
      id: 'spring-garden-arrangement',
      title: 'Spring Garden Centerpiece',
      description: 'Fresh spring florals with vibrant colors perfect for seasonal celebrations.',
      image: '/assets/ig_179_31_896964684.jpg',
      category: 'floral',
      featured: true,
      date: 'March 2024'
    },
    {
      id: 'autumn-celebration',
      title: 'Autumn Harvest Party',
      description: 'Warm autumn colors and seasonal decorations for a cozy private celebration.',
      image: '/assets/ig_1794579_87187429_.jpg',
      category: 'parties',
      featured: false,
      date: 'October 2024',
      client: 'The Johnson Family'
    },
    {
      id: 'winter-wonderland',
      title: 'Winter Wonderland Decor',
      description: 'Magical winter decorations transforming spaces into enchanted wonderlands.',
      image: '/assets/ig_179796_2185894789.jpg',
      category: 'seasonal',
      featured: false,
      date: 'December 2023'
    },
    {
      id: 'summer-outdoor-wedding',
      title: 'Summer Garden Wedding',
      description: 'Beautiful outdoor wedding with lush greenery and vibrant summer blooms.',
      image: '/assets/ig_18_44253247569932.jpg',
      category: 'weddings',
      featured: true,
      date: 'June 2024',
      client: 'Sofia & Miguel'
    },
    {
      id: 'christmas-home-decor',
      title: 'Christmas Home Transformation',
      description: 'Complete home Christmas decorating service with traditional holiday elegance.',
      image: '/assets/WhatsApp%2_Image%2_2_24-12-19%2_at%2_13.18.18_f31e159.jpg',
      category: 'seasonal',
      featured: false,
      date: 'December 2024'
    },
    {
      id: 'birthday-celebration',
      title: '50th Birthday Milestone',
      description: 'Elegant milestone birthday celebration with sophisticated floral arrangements.',
      image: '/assets/WhatsApp%2_Image%2_2_24-12-19%2_at%2_13.22._7_9d_df9a.jpg',
      category: 'parties',
      featured: false,
      date: 'November 2024',
      client: 'Elena Rodriguez'
    },
    {
      id: 'holiday-corporate-party',
      title: 'Corporate Holiday Party',
      description: 'Festive corporate holiday celebration with professional seasonal decorations.',
      image: '/assets/WhatsApp%2_Image%2_2_24-12-22%2_at%2_18.35.41_89e7bacf.jpg',
      category: 'corporate',
      featured: false,
      date: 'December 2024',
      client: 'Miami Business Group'
    }
  ];

  filteredPortfolio: PortfolioItem[] = [];
  displayedPortfolio: PortfolioItem[] = [];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.filteredPortfolio = this.portfolioItems;
    this.updateDisplayedItems();
  }

  filterPortfolio(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    
    if (category === 'all') {
      this.filteredPortfolio = this.portfolioItems;
    } else {
      this.filteredPortfolio = this.portfolioItems.filter(item => item.category === category);
    }
    
    this.updateDisplayedItems();
  }

  updateDisplayedItems(): void {
    const startIndex = 0;
    const endIndex = this.currentPage * this.itemsPerPage;
    this.displayedPortfolio = this.filteredPortfolio.slice(startIndex, endIndex);
  }

  get hasMoreItems(): boolean {
    return this.currentPage * this.itemsPerPage < this.filteredPortfolio.length;
  }

  loadMoreItems(): void {
    this.currentPage++;
    this.updateDisplayedItems();
  }

  openLightbox(item: PortfolioItem, index: number): void {
    this.selectedItem = item;
    this.currentImageIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.selectedItem = null;
    document.body.style.overflow = 'auto';
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.selectedItem = this.filteredPortfolio[this.currentImageIndex];
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.filteredPortfolio.length - 1) {
      this.currentImageIndex++;
      this.selectedItem = this.filteredPortfolio[this.currentImageIndex];
    }
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'weddings': 'Weddings',
      'corporate': 'Corporate Events',
      'floral': 'Floral Design',
      'seasonal': 'Seasonal Decor',
      'parties': 'Private Parties'
    };
    return labels[category] || category;
  }
}