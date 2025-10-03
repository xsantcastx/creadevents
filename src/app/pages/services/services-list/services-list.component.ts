import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlotImgComponent } from '../../../shared/slot-img/slot-img.component';

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, RouterLink, SlotImgComponent],
  template: `
    <div class="services-page">
      <!-- Hero Section with Slot -->
      <section class="hero-section">
        <slot-img key="services.header" class="hero-img" altDefault="Our Services – CreaDEvents"></slot-img>
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Floral Design & Event Services</h1>
            <p>Creating artful experiences for weddings, corporate events, and private celebrations throughout South Florida.</p>
          </div>
        </div>
      </section>

      <!-- Services Grid -->
      <section class="services-grid">
        <div class="container">
          <div class="services-intro">
            <h2>Tailored to Your Vision</h2>
            <p>Every celebration is unique. We craft custom floral designs that reflect your style, season, and story.</p>
          </div>

          <div class="service-cards">
            <!-- Wedding Services -->
            <div class="service-card">
              <div class="service-icon">💍</div>
              <h3>Wedding Florals</h3>
              <p>Complete bridal floral packages from bouquets to ceremony installations and reception centerpieces.</p>
              <ul class="service-includes">
                <li>Bridal bouquet design</li>
                <li>Ceremony installations</li>
                <li>Reception centerpieces</li>
                <li>Boutonnières & corsages</li>
              </ul>
              <div class="service-cta">
                <span class="starting-price">Starting at $2.5k</span>
                <a routerLink="/contact" class="btn ghost">Inquire</a>
              </div>
            </div>

            <!-- Corporate Events -->
            <div class="service-card featured">
              <div class="featured-badge">Most Popular</div>
              <div class="service-icon">🏢</div>
              <h3>Corporate Events</h3>
              <p>Brand-aligned floral designs for product launches, galas, conferences, and seasonal office décor.</p>
              <ul class="service-includes">
                <li>Event installations</li>
                <li>Brand color coordination</li>
                <li>Seasonal office décor</li>
                <li>VIP arrangements</li>
              </ul>
              <div class="service-cta">
                <span class="starting-price">Starting at $1.5k</span>
                <a routerLink="/contact" class="btn btn-primary">Get Quote</a>
              </div>
            </div>

            <!-- Private Celebrations -->
            <div class="service-card">
              <div class="service-icon">🎉</div>
              <h3>Private Celebrations</h3>
              <p>Intimate dinners, birthdays, baby showers—personalized arrangements that set the perfect mood.</p>
              <ul class="service-includes">
                <li>Table arrangements</li>
                <li>Entrance installations</li>
                <li>Themed designs</li>
                <li>Seasonal specialties</li>
              </ul>
              <div class="service-cta">
                <span class="starting-price">Starting at $800</span>
                <a routerLink="/contact" class="btn ghost">Plan Event</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Process Steps -->
      <section class="process-section">
        <div class="container">
          <h2>Our Design Process</h2>
          <div class="process-steps">
            <div class="step">
              <div class="step-number">1</div>
              <h3>Discovery</h3>
              <p>We start with your vision, venue details, and inspiration to understand your style and budget.</p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <h3>Design</h3>
              <p>Our team creates a custom proposal with seasonal florals and installation concepts.</p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <h3>Delivery</h3>
              <p>Professional setup and installation on your event day, ensuring everything is picture-perfect.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Bring Your Vision to Life?</h2>
            <p>Share your event details and let's create something beautiful together. We'll respond within 24 hours with next steps.</p>
            <div class="cta-actions">
              <a routerLink="/contact" class="btn btn-primary">Start Your Inquiry</a>
              <a routerLink="/portfolio" class="btn ghost">View Our Portfolio</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .services-page {
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

    /* Services Grid */
    .services-grid {
      padding: 5rem 0;
      background: var(--surface);
    }

    .services-intro {
      text-align: center;
      margin-bottom: 4rem;
    }

    .services-intro h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .services-intro p {
      font-size: 1.1rem;
      color: var(--muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .service-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .service-card {
      position: relative;
      background: white;
      padding: 2rem;
      border-radius: var(--radius);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-align: center;
    }

    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .service-card.featured {
      border: 2px solid var(--accent);
      transform: scale(1.02);
    }

    .featured-badge {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .service-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .service-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .service-card > p {
      color: var(--muted);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .service-includes {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
      text-align: left;
    }

    .service-includes li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      position: relative;
      padding-left: 1.5rem;
      color: var(--muted);
    }

    .service-includes li:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--brand);
      font-weight: bold;
    }

    .service-includes li:last-child {
      border-bottom: none;
    }

    .service-cta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }

    .starting-price {
      font-weight: 600;
      color: var(--brand);
      font-size: 1.1rem;
    }

    /* Process Steps */
    .process-section {
      padding: 5rem 0;
      background: var(--brand-ghost);
    }

    .process-section h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: var(--brand);
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .step {
      text-align: center;
      padding: 2rem 1rem;
    }

    .step-number {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--brand);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem auto;
    }

    .step h3 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .step p {
      color: var(--muted);
      line-height: 1.6;
    }

    /* CTA Section */
    .cta-section {
      padding: 5rem 0;
      background: var(--brand);
      color: white;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      opacity: 0.95;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-actions .btn-primary {
      background: white;
      color: var(--brand);
    }

    .cta-actions .btn-primary:hover {
      background: var(--surface);
    }

    .cta-actions .ghost {
      border-color: white;
      color: white;
    }

    .cta-actions .ghost:hover {
      background: white;
      color: var(--brand);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .service-cards {
        grid-template-columns: 1fr;
      }

      .process-steps {
        grid-template-columns: 1fr;
      }

      .service-cta {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ServicesListComponent {}