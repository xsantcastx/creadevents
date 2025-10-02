import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">About Creation Design & Events</h1>
          <p class="hero-subtitle">
            A family-owned business bringing beauty and joy to Miami's most important celebrations 
            for over 15 years.
          </p>
        </div>
      </section>

      <!-- Our Story Section -->
      <section class="story-section">
        <div class="container">
          <div class="story-grid">
            <div class="story-content">
              <h2>Our Story</h2>
              <p class="lead">
                Founded in Miami with a passion for creating unforgettable moments, Creation Design & Events 
                has been the trusted choice for exceptional event planning and floral design for over 15 years.
              </p>
              <p>
                What started as a small dream has grown into a comprehensive event planning service that serves 
                Miami and surrounding areas. We believe that every celebration, whether it's an intimate gathering 
                or a grand celebration, deserves the same attention to detail and personal touch.
              </p>
              <p>
                Our team combines traditional craftsmanship with modern design sensibilities, ensuring that 
                each event reflects the unique personality and style of our clients while maintaining the 
                highest standards of quality and service.
              </p>
            </div>
            <div class="story-image">
              <img src="/assets/fb_4888_8929514942_2_48x2_48.jpg" alt="Our beautiful event designs" loading="lazy">
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <h2 class="section-title">What We Stand For</h2>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">🎨</div>
              <h3>Creative Excellence</h3>
              <p>We bring fresh, innovative ideas to every project while respecting your personal style and vision.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">❤️</div>
              <h3>Personal Touch</h3>
              <p>Every client receives individual attention and customized solutions tailored to their specific needs.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">⭐</div>
              <h3>Quality First</h3>
              <p>We use only the finest materials and work with trusted vendors to ensure exceptional results.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">🤝</div>
              <h3>Reliability</h3>
              <p>With over 15 years of experience, you can trust us to deliver on time and exceed expectations.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Overview -->
      <section class="services-overview">
        <div class="container">
          <div class="overview-content">
            <div class="overview-text">
              <h2>What We Do Best</h2>
              <p>
                From weddings and corporate events to seasonal decorating and custom floral arrangements, 
                we offer comprehensive event planning and design services throughout Miami.
              </p>
              <div class="specialties">
                <div class="specialty">
                  <strong>Wedding Planning & Design</strong>
                  <span>Complete wedding coordination from intimate ceremonies to grand celebrations</span>
                </div>
                <div class="specialty">
                  <strong>Corporate Events</strong>
                  <span>Professional events that impress clients and inspire teams</span>
                </div>
                <div class="specialty">
                  <strong>Floral Arrangements</strong>
                  <span>Custom floral designs for any occasion using the freshest flowers</span>
                </div>
                <div class="specialty">
                  <strong>Seasonal Decorating</strong>
                  <span>Transform your space for holidays and special seasons</span>
                </div>
              </div>
              <a routerLink="/services" class="btn btn-primary">View All Services</a>
            </div>
            <div class="overview-image">
              <img src="/assets/ig_179_31_896964684.jpg" alt="Beautiful floral arrangements" loading="lazy">
            </div>
          </div>
        </div>
      </section>

      <!-- Experience Stats -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">15+</div>
              <div class="stat-label">Years of Experience</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Events Planned</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">Floral Arrangements</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">100%</div>
              <div class="stat-label">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Location & Contact -->
      <section class="location-section">
        <div class="container">
          <div class="location-grid">
            <div class="location-content">
              <h2>Serving Miami & Beyond</h2>
              <p>
                Based in beautiful Miami, Florida, we're proud to serve clients throughout 
                Miami-Dade County and surrounding areas. Our local knowledge and established 
                vendor relationships ensure seamless event execution.
              </p>
              <div class="contact-info">
                <div class="contact-item">
                  <strong>📍 Location</strong>
                  <span>Miami, Florida</span>
                </div>
                <div class="contact-item">
                  <strong>📞 Phone</strong>
                  <a href="tel:7863562958">(786) 356-2958</a>
                </div>
                <div class="contact-item">
                  <strong>✉️ Email</strong>
                  <a href="mailto:Carlos@creadevents.com">Carlos@creadevents.com</a>
                </div>
                <div class="contact-item">
                  <strong>🕒 Consultation Hours</strong>
                  <span>Monday - Saturday, 9 AM - 6 PM</span>
                </div>
              </div>
            </div>
            <div class="location-image">
              <img src="/assets/ig_1794579_87187429_.jpg" alt="Miami event planning" loading="lazy">
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Plan Your Perfect Event?</h2>
            <p>
              Let's schedule a consultation to discuss your vision and how we can bring it to life. 
              Contact us today to get started.
            </p>
            <div class="cta-actions">
              <a href="tel:7863562958" class="btn btn-primary">Call (786) 356-2958</a>
              <a routerLink="/contact" class="btn btn-outline">Schedule Consultation</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-page {
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

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .story-section {
      padding: 4rem 0;
    }

    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .story-content h2 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
    }

    .lead {
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--theme-primary, #7FB069);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .story-content p {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 1.5rem;
    }

    .story-image {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .story-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .values-section {
      background: var(--theme-secondary, #F7E9E3);
      padding: 4rem 0;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 3rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .value-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .value-card:hover {
      transform: translateY(-5px);
    }

    .value-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .value-card h3 {
      font-size: 1.3rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .value-card p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
    }

    .services-overview {
      padding: 4rem 0;
    }

    .overview-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .overview-text h2 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
    }

    .overview-text p {
      font-size: 1.1rem;
      line-height: 1.7;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
    }

    .specialties {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .specialty {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .specialty strong {
      color: var(--theme-primary, #7FB069);
      font-weight: 600;
    }

    .specialty span {
      font-size: 0.9rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .overview-image {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .overview-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .stats-section {
      background: var(--theme-primary, #7FB069);
      padding: 3rem 0;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .location-section {
      padding: 4rem 0;
    }

    .location-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .location-content h2 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
    }

    .location-content p {
      font-size: 1.1rem;
      line-height: 1.7;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
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

    .contact-item strong {
      color: var(--theme-text, #2D3436);
      font-weight: 600;
    }

    .contact-item a {
      color: var(--theme-primary, #7FB069);
      text-decoration: none;
    }

    .contact-item a:hover {
      text-decoration: underline;
    }

    .location-image {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .location-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
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

    .btn {
      padding: 1rem 2rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: inline-block;
      font-size: 1rem;
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

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .story-grid,
      .overview-content,
      .location-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .values-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .story-image img,
      .overview-image img,
      .location-image img {
        height: 250px;
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

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-number {
        font-size: 2.5rem;
      }
    }
  `]
})
export class AboutComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
  }
}