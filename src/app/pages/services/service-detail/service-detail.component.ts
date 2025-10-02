import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
  process?: string[];
  portfolio?: string[];
}

@Component({
  selector: 'app-service-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="service-detail-page" *ngIf="service">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-image">
          <img [src]="service.image" [alt]="service.title">
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="breadcrumb">
            <a routerLink="/services">Services</a>
            <span>></span>
            <span>{{ service.title }}</span>
          </div>
          <h1 class="hero-title">{{ service.title }}</h1>
          <p class="hero-subtitle">{{ service.description }}</p>
          <div class="hero-actions">
            <a href="tel:7863562958" class="btn btn-primary">Call (786) 356-2958</a>
            <a routerLink="/contact" class="btn btn-outline">Get Free Quote</a>
          </div>
        </div>
      </section>

      <!-- Service Details -->
      <section class="details-section">
        <div class="container">
          <div class="details-grid">
            <!-- Main Content -->
            <div class="main-content">
              <div class="content-block">
                <h2>About This Service</h2>
                <p class="large-text">{{ service.fullDescription }}</p>
              </div>

              <div class="content-block" *ngIf="service.features.length > 0">
                <h2>What's Included</h2>
                <div class="features-grid">
                  <div class="feature-item" *ngFor="let feature of service.features">
                    <i class="check-icon">✓</i>
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </div>

              <div class="content-block" *ngIf="service.process">
                <h2>Our Process</h2>
                <div class="process-steps">
                  <div class="step" *ngFor="let step of service.process; let i = index">
                    <div class="step-number">{{ i + 1 }}</div>
                    <div class="step-content">{{ step }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
              <div class="pricing-card">
                <h3>Investment</h3>
                <div class="price">{{ service.price }}</div>
                <p class="price-note">Final pricing based on event scope and requirements</p>
                <div class="cta-actions">
                  <a routerLink="/contact" class="btn btn-primary btn-full">Request Quote</a>
                  <a href="tel:7863562958" class="btn btn-outline btn-full">Call Now</a>
                </div>
              </div>

              <div class="contact-card">
                <h3>Ready to Get Started?</h3>
                <p>Contact us today for a personalized consultation.</p>
                <div class="contact-info">
                  <div class="contact-item">
                    <strong>Phone:</strong>
                    <a href="tel:7863562958">(786) 356-2958</a>
                  </div>
                  <div class="contact-item">
                    <strong>Email:</strong>
                    <a href="mailto:Carlos@creadevents.com">Carlos@creadevents.com</a>
                  </div>
                  <div class="contact-item">
                    <strong>Location:</strong>
                    <span>Miami, FL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Services -->
      <section class="related-section">
        <div class="container">
          <h2>Other Services You Might Like</h2>
          <div class="related-grid">
            <div 
              *ngFor="let relatedService of relatedServices" 
              class="related-card">
              <div class="related-image">
                <img [src]="relatedService.image" [alt]="relatedService.title">
              </div>
              <div class="related-content">
                <h3>{{ relatedService.title }}</h3>
                <p>{{ relatedService.description }}</p>
                <a [routerLink]="['/services', relatedService.id]" class="btn btn-outline btn-small">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Not Found -->
    <div class="not-found" *ngIf="!service && !loading">
      <div class="container">
        <h1>Service Not Found</h1>
        <p>The service you're looking for doesn't exist.</p>
        <a routerLink="/services" class="btn btn-primary">View All Services</a>
      </div>
    </div>
  `,
  styles: [`
    .service-detail-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      position: relative;
      height: 500px;
      overflow: hidden;
      display: flex;
      align-items: center;
    }

    .hero-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg, 
        rgba(0,0,0,0.7) 0%, 
        rgba(0,0,0,0.3) 100%
      );
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      color: white;
    }

    .breadcrumb {
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .breadcrumb a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
    }

    .breadcrumb a:hover {
      color: white;
    }

    .breadcrumb span {
      margin: 0 0.5rem;
      color: rgba(255,255,255,0.6);
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .hero-subtitle {
      font-size: 1.3rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      max-width: 600px;
      opacity: 0.95;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .details-section {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 4rem;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .content-block h2 {
      font-size: 2rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
    }

    .large-text {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--theme-text-secondary, #636E72);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
    }

    .check-icon {
      color: var(--theme-primary, #7FB069);
      font-weight: bold;
      font-size: 1.2rem;
    }

    .process-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .step {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--theme-primary, #7FB069);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;
      padding-top: 0.5rem;
      line-height: 1.6;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .pricing-card,
    .contact-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border: 1px solid #f0f0f0;
    }

    .pricing-card h3,
    .contact-card h3 {
      font-size: 1.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--theme-primary, #7FB069);
      margin-bottom: 0.5rem;
    }

    .price-note {
      font-size: 0.9rem;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
    }

    .cta-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-item a {
      color: var(--theme-primary, #7FB069);
      text-decoration: none;
    }

    .contact-item a:hover {
      text-decoration: underline;
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

    .btn-full {
      width: 100%;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .related-section {
      background: var(--theme-secondary, #F7E9E3);
      padding: 4rem 0;
    }

    .related-section h2 {
      text-align: center;
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 3rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .related-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .related-card:hover {
      transform: translateY(-5px);
    }

    .related-image {
      height: 150px;
      overflow: hidden;
    }

    .related-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .related-content {
      padding: 1.5rem;
    }

    .related-content h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      color: var(--theme-text, #2D3436);
    }

    .related-content p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .not-found {
      padding: 4rem 0;
      text-align: center;
    }

    .not-found h1 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .not-found p {
      font-size: 1.1rem;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .details-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .sidebar {
        order: -1;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .related-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  
  service: Service | null = null;
  relatedServices: Service[] = [];
  loading: boolean = true;

  // All services data (in a real app, this would come from a service)
  private allServices: Service[] = [
    {
      id: 'wedding-planning',
      title: 'Wedding Planning & Design',
      description: 'Complete wedding planning from intimate ceremonies to grand celebrations. We handle every detail to make your special day perfect.',
      fullDescription: 'Our comprehensive wedding planning service transforms your dream wedding into reality. With over 15 years of experience in Miami, we understand what makes each celebration unique. From the initial consultation to the final send-off, we coordinate every detail with precision and care.',
      features: [
        'Complete wedding planning & coordination',
        'Venue selection & vendor management',
        'Custom floral arrangements & centerpieces',
        'Timeline planning & day-of coordination',
        'Reception setup & breakdown',
        'Emergency support & backup plans',
        'Budget management & cost tracking',
        'Guest accommodation assistance'
      ],
      price: 'Starting at $2,500',
      image: '/assets/logo1.jpg',
      category: 'events',
      popular: true,
      process: [
        'Initial consultation to understand your vision and budget',
        'Venue selection and vendor coordination meetings',
        'Design planning with color schemes and floral arrangements',
        'Timeline creation and guest management',
        'Final walkthrough and day-of coordination',
        'Complete setup, event management, and breakdown'
      ]
    },
    {
      id: 'corporate-events',
      title: 'Corporate Event Planning',
      description: 'Professional corporate events that impress clients and inspire teams. From conferences to holiday parties.',
      fullDescription: 'Elevate your corporate image with professionally planned events that reflect your company\'s values and brand. We specialize in creating memorable experiences that engage your team and impress your clients.',
      features: [
        'Conference & meeting planning',
        'Corporate holiday parties',
        'Product launch events',
        'Team building activities',
        'Professional decor & branding',
        'Audio/visual coordination',
        'Catering management',
        'Registration & check-in services'
      ],
      price: 'Starting at $1,500',
      image: '/assets/logo2.jpg',
      category: 'events',
      popular: false,
      process: [
        'Corporate needs assessment and goal definition',
        'Venue selection and logistics planning',
        'Brand integration and professional styling',
        'Vendor coordination and timeline management',
        'Event execution with professional oversight',
        'Post-event reporting and feedback collection'
      ]
    },
    {
      id: 'floral-arrangements',
      title: 'Custom Floral Arrangements',
      description: 'Beautiful, fresh floral designs for any occasion. From bridal bouquets to corporate displays.',
      fullDescription: 'Our expert floral designers create stunning arrangements that capture the essence of your special moments. Using only the freshest flowers, we craft unique pieces that complement your style and color preferences.',
      features: [
        'Bridal bouquets & boutonnieres',
        'Centerpieces & table arrangements',
        'Ceremony arches & backdrops',
        'Corporate floral displays',
        'Seasonal flower selections',
        'Delivery & setup included',
        'Preservation services available',
        'Custom color matching'
      ],
      price: 'Starting at $75',
      image: '/assets/logo3.jpg',
      category: 'floral',
      popular: true,
      process: [
        'Style consultation and color preference discussion',
        'Fresh flower selection based on season and availability',
        'Custom design creation and approval',
        'Professional arrangement and quality check',
        'Timely delivery and setup at your venue',
        'Optional preservation services for lasting memories'
      ]
    },
    {
      id: 'christmas-decor',
      title: 'Christmas & Holiday Decorating',
      description: 'Transform your space into a winter wonderland with our professional Christmas decorating services.',
      fullDescription: 'Bring the magic of Christmas to your home or business with our comprehensive holiday decorating service. We handle everything from elegant tree decorating to complete venue transformation.',
      features: [
        'Christmas tree decorating',
        'Indoor & outdoor lighting',
        'Garland & wreath installation',
        'Table & mantle styling',
        'Commercial holiday displays',
        'Post-holiday cleanup service',
        'Custom theme development',
        'Storage and organization'
      ],
      price: 'Starting at $300',
      image: '/assets/logo3.jpg',
      category: 'seasonal',
      popular: false,
      process: [
        'Holiday theme consultation and planning',
        'Decoration sourcing and custom piece creation',
        'Professional installation and styling',
        'Lighting setup and testing',
        'Quality inspection and final touches',
        'Complete cleanup and storage services'
      ]
    },
    {
      id: 'party-planning',
      title: 'Birthday & Anniversary Parties',
      description: 'Celebrate life\'s special moments with custom party planning that creates lasting memories.',
      fullDescription: 'From intimate family gatherings to milestone celebrations, we create personalized parties that reflect the guest of honor\'s personality and style preferences.',
      features: [
        'Theme development & styling',
        'Venue decoration & setup',
        'Custom balloon arrangements',
        'Table settings & linens',
        'Entertainment coordination',
        'Photography area setup',
        'Menu planning assistance',
        'Party favor coordination'
      ],
      price: 'Starting at $800',
      image: '/assets/logo1.jpg',
      category: 'events',
      popular: false,
      process: [
        'Personal consultation to understand the celebration vision',
        'Theme development and decoration planning',
        'Venue setup and styling coordination',
        'Entertainment and activity planning',
        'Day-of coordination and management',
        'Cleanup and breakdown services'
      ]
    },
    {
      id: 'seasonal-decor',
      title: 'Seasonal Home Decorating',
      description: 'Refresh your space throughout the year with our seasonal decorating services for every occasion.',
      fullDescription: 'Keep your home beautifully decorated year-round with our seasonal decorating service. We update your decor to match the changing seasons and special occasions.',
      features: [
        'Spring & summer refreshes',
        'Fall & autumn styling',
        'Holiday decorating services',
        'Seasonal floral arrangements',
        'Color palette updates',
        'Storage & organization',
        'Maintenance & refresher visits',
        'Custom seasonal themes'
      ],
      price: 'Starting at $200',
      image: '/assets/logo2.jpg',
      category: 'seasonal',
      popular: false,
      process: [
        'Seasonal planning consultation and calendar creation',
        'Decoration selection and theme development',
        'Professional installation and styling',
        'Maintenance and refresh services',
        'Seasonal transition management',
        'Storage and organization solutions'
      ]
    }
  ];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    
    this.route.params.subscribe(params => {
      const serviceId = params['id'];
      this.loadService(serviceId);
    });
  }

  private loadService(serviceId: string): void {
    this.loading = true;
    
    // Find the service by ID
    this.service = this.allServices.find(s => s.id === serviceId) || null;
    
    if (this.service) {
      // Load related services (same category, excluding current service)
      this.relatedServices = this.allServices
        .filter(s => s.category === this.service!.category && s.id !== this.service!.id)
        .slice(0, 3);
        
      // If we don't have enough related services, fill with others
      if (this.relatedServices.length < 3) {
        const additional = this.allServices
          .filter(s => s.id !== this.service!.id && !this.relatedServices.includes(s))
          .slice(0, 3 - this.relatedServices.length);
        this.relatedServices = [...this.relatedServices, ...additional];
      }
    }
    
    this.loading = false;
  }
}