import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { SlotImgComponent } from '../../../shared/slot-img/slot-img.component';
import { Service } from '../../../models/data.models';

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, RouterLink, SlotImgComponent],
  template: `
    <div class="services-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <slot-img key="services.header" altDefault="Services header" class="hero-background" />
        <div class="hero-content">
          <h1 class="hero-title">Our Services</h1>
          <p class="hero-subtitle">
            Professional event planning and floral design services for over 15 years in Miami.
            Creating unforgettable moments with personalized attention to detail.
          </p>
        </div>
        
        <!-- Service Categories Filter -->
        <div class="category-filters">
          <button 
            class="filter-btn"
            [class.active]="selectedCategory === 'all'"
            (click)="filterServices('all')">
            All Services
          </button>
          <button 
            class="filter-btn"
            [class.active]="selectedCategory === 'events'"
            (click)="filterServices('events')">
            Events
          </button>
          <button 
            class="filter-btn"
            [class.active]="selectedCategory === 'florals'"
            (click)="filterServices('florals')">
            Florals
          </button>
        </div>
      </section>

      <!-- Services Grid -->
      <section class="services-section">
        <div class="container">
          <div class="services-grid">
            @for (service of filteredServices$ | async; track service.id) {
              <div class="service-card card" [class.featured]="service.featured">
                @if (service.featured) {
                  <div class="featured-badge">Most Popular</div>
                }
                <div class="service-image">
                  <img [src]="service.images[0] || '/assets/logo1.jpg'" [alt]="service.title" loading="lazy">
                </div>
                <div class="service-content">
                  <h3 class="service-title">{{ service.title }}</h3>
                  <p class="service-description">{{ service.summary || service.description }}</p>
                  <div class="service-features">
                    @for (feature of service.inclusions.slice(0, 3); track feature) {
                      <div class="feature">
                        <i class="check-icon">✓</i>
                        {{ feature }}
                      </div>
                    }
                  </div>
                  <div class="service-footer">
                    <div class="service-price">{{ formatBudget(service.minBudget) }}</div>
                    <a [routerLink]="['/services', service.slug]" class="btn btn-outline">Learn More</a>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="no-services">
                <p>Loading services...</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Plan Your Event?</h2>
            <p>Let's discuss your vision and create something beautiful together.</p>
            <div class="cta-actions">
              <a routerLink="/contact" class="btn btn-primary">Get Started</a>
              <a routerLink="/portfolio" class="btn btn-outline">View Our Work</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .services-page {
      min-height: 100vh;
    }

    .hero-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 6rem 1.5rem 4rem;
      text-align: center;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto 3rem;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      color: #212529;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #6c757d;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .category-filters {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #dee2e6;
      background: white;
      color: #495057;
      border-radius: 30px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-btn:hover,
    .filter-btn.active {
      border-color: var(--primary-color, #007bff);
      background: var(--primary-color, #007bff);
      color: white;
    }

    .services-section {
      padding: 4rem 1.5rem;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .service-card {
      position: relative;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: white;
    }

    .service-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .service-card.featured {
      border-color: var(--primary-color, #007bff);
      box-shadow: 0 5px 20px rgba(0, 123, 255, 0.1);
    }

    .featured-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: var(--primary-color, #007bff);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      z-index: 2;
    }

    .service-image {
      height: 250px;
      overflow: hidden;
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

    .service-content {
      padding: 1.5rem;
    }

    .service-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #212529;
    }

    .service-description {
      color: #6c757d;
      line-height: 1.6;
      margin-bottom: 1.5rem;
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
      color: #495057;
    }

    .check-icon {
      color: var(--success-color, #28a745);
      font-weight: bold;
    }

    .service-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .service-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--primary-color, #007bff);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: var(--primary-color, #007bff);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark, #0056b3);
    }

    .btn-outline {
      border-color: var(--primary-color, #007bff);
      color: var(--primary-color, #007bff);
      background: transparent;
    }

    .btn-outline:hover {
      background: var(--primary-color, #007bff);
      color: white;
    }

    .cta-section {
      background: var(--primary-color, #007bff);
      color: white;
      padding: 4rem 1.5rem;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-actions .btn-primary {
      background: white;
      color: var(--primary-color, #007bff);
    }

    .cta-actions .btn-primary:hover {
      background: #f8f9fa;
    }

    .cta-actions .btn-outline {
      border-color: white;
      color: white;
    }

    .cta-actions .btn-outline:hover {
      background: white;
      color: var(--primary-color, #007bff);
    }

    .no-services {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .services-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .service-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ServicesListComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);
  
  services$!: Observable<Service[]>;
  filteredServices$!: Observable<Service[]>;
  selectedCategory = 'all';

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.services$ = this.firestoreService.getServices();
    this.filteredServices$ = this.services$;
  }

  filterServices(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredServices$ = this.services$;
    } else {
      this.filteredServices$ = this.services$.pipe(
        map((services: Service[]) => services.filter((service: Service) => service.category === category))
      );
    }
  }

  formatBudget(minBudget: number): string {
    if (minBudget >= 1000) {
      return `Starting at $${(minBudget / 1000).toFixed(1)}k`;
    }
    return `Starting at $${minBudget}`;
  }
}