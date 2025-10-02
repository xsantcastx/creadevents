import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';

interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  features: string[];
  price: string;
  image: string;
  category: 'events' | 'floral' | 'seasonal';
  popular: boolean;
}

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="services-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Our Services</h1>
          <p class="hero-subtitle">
            Professional event planning and floral design services for over 15 years in Miami.
            Creating unforgettable moments with personalized attention to detail.
          </p>
        </div>
      </section>

      <!-- Services Grid -->
      <section class="services-section">
        <div class="container">
          <div class="section-header">
            <h2>What We Offer</h2>
            <p>From intimate gatherings to grand celebrations, we bring your vision to life</p>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'all'"
              (click)="filterServices('all')">
              All Services
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'events'"
              (click)="filterServices('events')">
              Event Planning
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'floral'"
              (click)="filterServices('floral')">
              Floral Design
            </button>
            <button 
              class="filter-tab" 
              [class.active]="selectedCategory === 'seasonal'"
              (click)="filterServices('seasonal')">
              Seasonal Decor
            </button>
          </div>

          <!-- Services Grid -->
          <div class="services-grid">
            <div 
              *ngFor="let service of filteredServices" 
              class="service-card"
              [class.popular]="service.popular">
              
              <div class="service-image">
                <img [src]="service.image" [alt]="service.title" loading="lazy">
                <div class="popular-badge" *ngIf="service.popular">Most Popular</div>
              </div>
              
              <div class="service-content">
                <h3 class="service-title">{{ service.title }}</h3>
                <p class="service-description">{{ service.description }}</p>
                
                <div class="service-features">
                  <div class="feature" *ngFor="let feature of service.features.slice(0, 3)">
                    <i class="check-icon">✓</i>
                    {{ feature }}
                  </div>
                </div>
                
                <div class="service-footer">
                  <div class="service-price">{{ service.price }}</div>
                  <div class="service-actions">
                    <a 
                      [routerLink]="['/services', service.id]" 
                      class="btn btn-outline">
                      Learn More
                    </a>
                    <a 
                      routerLink="/contact" 
                      class="btn btn-primary">
                      Get Quote
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Start Planning?</h2>
            <p>Contact us today for a free consultation and let's create something beautiful together.</p>
            <div class="cta-actions">
              <a href="tel:7863562958" class="btn btn-primary">Call (786) 356-2958</a>
              <a routerLink="/contact" class="btn btn-outline">Request Consultation</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .services-page {
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

    .services-section {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .section-header p {
      font-size: 1.1rem;
      color: var(--theme-text-secondary, #636E72);
      max-width: 600px;
      margin: 0 auto;
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

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .service-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    }

    .service-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .service-card.popular::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(45deg, var(--theme-accent, #FFEAA7), var(--theme-primary, #7FB069));
    }

    .service-image {
      height: 200px;
      overflow: hidden;
      position: relative;
    }

    .service-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .service-card:hover .service-image img {
      transform: scale(1.05);
    }

    .popular-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: var(--theme-accent, #FFEAA7);
      color: var(--theme-text, #2D3436);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .service-content {
      padding: 1.5rem;
    }

    .service-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--theme-text, #2D3436);
      margin-bottom: 0.5rem;
    }

    .service-description {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .service-features {
      margin-bottom: 1.5rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .check-icon {
      color: var(--theme-primary, #7FB069);
      font-weight: bold;
    }

    .service-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .service-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--theme-primary, #7FB069);
    }

    .service-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      font-size: 0.9rem;
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

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .services-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .service-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .service-actions {
        justify-content: space-between;
      }

      .btn {
        flex: 1;
        text-align: center;
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
    }
  `]
})
export class ServicesListComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  
  selectedCategory: string = 'all';
  
  services: Service[] = [
    {
      id: 'wedding-planning',
      title: 'Wedding Planning & Design',
      description: 'Complete wedding planning from intimate ceremonies to grand celebrations. We handle every detail to make your special day perfect.',
      fullDescription: 'Our comprehensive wedding planning service includes venue selection, vendor coordination, timeline management, and day-of coordination. We work closely with you to bring your dream wedding to life.',
      features: [
        'Complete wedding planning & coordination',
        'Venue selection & vendor management',
        'Custom floral arrangements & centerpieces',
        'Timeline planning & day-of coordination',
        'Reception setup & breakdown',
        'Emergency support & backup plans'
      ],
      price: 'Starting at $2,500',
      image: '/assets/fb_4888_8929514942_2_48x2_48.jpg',
      category: 'events',
      popular: true
    },
    {
      id: 'corporate-events',
      title: 'Corporate Event Planning',
      description: 'Professional corporate events that impress clients and inspire teams. From conferences to holiday parties.',
      fullDescription: 'We specialize in creating memorable corporate events that reflect your company\'s brand and values. Our team handles logistics, catering coordination, and ensures seamless execution.',
      features: [
        'Conference & meeting planning',
        'Corporate holiday parties',
        'Product launch events',
        'Team building activities',
        'Professional decor & branding',
        'Audio/visual coordination'
      ],
      price: 'Starting at $1,500',
      image: '/assets/ig_17883536292_1336_.jpg',
      category: 'events',
      popular: false
    },
    {
      id: 'floral-arrangements',
      title: 'Custom Floral Arrangements',
      description: 'Beautiful, fresh floral designs for any occasion. From bridal bouquets to corporate displays.',
      fullDescription: 'Our expert floral designers create stunning arrangements using the freshest flowers. We work with your color palette and style preferences to create unique pieces.',
      features: [
        'Bridal bouquets & boutonnieres',
        'Centerpieces & table arrangements',
        'Ceremony arches & backdrops',
        'Corporate floral displays',
        'Seasonal flower selections',
        'Delivery & setup included'
      ],
      price: 'Starting at $75',
      image: '/assets/ig_179_31_896964684.jpg',
      category: 'floral',
      popular: true
    },
    {
      id: 'christmas-decor',
      title: 'Christmas & Holiday Decorating',
      description: 'Transform your space into a winter wonderland with our professional Christmas decorating services.',
      fullDescription: 'Our holiday decorating service brings the magic of Christmas to your home or business. We provide everything from tree decorating to complete venue transformation.',
      features: [
        'Christmas tree decorating',
        'Indoor & outdoor lighting',
        'Garland & wreath installation',
        'Table & mantle styling',
        'Commercial holiday displays',
        'Post-holiday cleanup service'
      ],
      price: 'Starting at $300',
      image: '/assets/WhatsApp%2_Image%2_2_24-12-19%2_at%2_13.18.18_f31e159.jpg',
      category: 'seasonal',
      popular: false
    },
    {
      id: 'party-planning',
      title: 'Birthday & Anniversary Parties',
      description: 'Celebrate life\'s special moments with custom party planning that creates lasting memories.',
      fullDescription: 'From intimate family gatherings to large milestone celebrations, we create personalized parties that reflect the guest of honor\'s personality and style.',
      features: [
        'Theme development & styling',
        'Venue decoration & setup',
        'Custom balloon arrangements',
        'Table settings & linens',
        'Entertainment coordination',
        'Photography area setup'
      ],
      price: 'Starting at $800',
      image: '/assets/ig_1794579_87187429_.jpg',
      category: 'events',
      popular: false
    },
    {
      id: 'seasonal-decor',
      title: 'Seasonal Home Decorating',
      description: 'Refresh your space throughout the year with our seasonal decorating services for every occasion.',
      fullDescription: 'Keep your home beautifully decorated year-round with our seasonal decorating service. We update your decor to match the changing seasons and holidays.',
      features: [
        'Spring & summer refreshes',
        'Fall & autumn styling',
        'Holiday decorating services',
        'Seasonal floral arrangements',
        'Color palette updates',
        'Storage & organization'
      ],
      price: 'Starting at $200',
      image: '/assets/ig_179796_2185894789.jpg',
      category: 'seasonal',
      popular: false
    }
  ];

  filteredServices: Service[] = [];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.filteredServices = this.services;
  }

  filterServices(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredServices = this.services;
    } else {
      this.filteredServices = this.services.filter(service => service.category === category);
    }
  }
}