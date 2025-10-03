import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlotImgComponent } from '../../shared/slot-img/slot-img.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, SlotImgComponent],
  template: `
    <div class="home">
      <!-- Hero Section with Slot -->
      <section class="hero-section">
        <slot-img key="home.header" class="hero-img" altDefault="CreaDEvents – Floral Studio"></slot-img>
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Artful Floral Experiences</h1>
            <p>Intentional designs, bespoke installations, and seamless experiences for weddings, brand events, and private celebrations.</p>
            <div class="hero-actions">
              <a routerLink="/contact" class="btn btn-primary">Plan Your Event</a>
              <a routerLink="/portfolio" class="btn ghost">See Our Portfolio</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Promotional Tiles -->
      <section class="promos">
        <div class="container">
          <h2>Our Signature Services</h2>
          <div class="promo-grid">
            <div class="promo-item">
              <slot-img key="home.promo1" class="promo-img"></slot-img>
              <div class="promo-content">
                <h3>Weddings</h3>
                <p>Bridal bouquets, ceremony installations, and reception florals tailored to your style.</p>
              </div>
            </div>
            <div class="promo-item">
              <slot-img key="home.promo2" class="promo-img"></slot-img>
              <div class="promo-content">
                <h3>Corporate Events</h3>
                <p>Brand-aligned florals for launches, galas, conferences, and seasonal decor.</p>
              </div>
            </div>
            <div class="promo-item">
              <slot-img key="home.promo3" class="promo-img"></slot-img>
              <div class="promo-content">
                <h3>Private Celebrations</h3>
                <p>Birthdays, showers, intimate dinners — lush arrangements that set the mood.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Preview -->
      <section class="about-preview">
        <div class="container">
          <div class="two-col">
            <div class="content">
              <h2>Designing with Intention</h2>
              <p>Every celebration begins with a story. We translate your memories, moodboards, and brand vision into immersive floral moments.</p>
              <p>From concept to install, we design with seasonality, texture, and place in mind.</p>
              <a routerLink="/about" class="btn ghost">Learn Our Story</a>
            </div>
            <div class="visual">
              <!-- This could be another slot or a fixed image -->
              <div class="about-placeholder">
                <span>Studio Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <slot-img key="home.cta" class="cta-img"></slot-img>
        <div class="cta-overlay">
          <div class="cta-content">
            <h2>Let's Tailor Your Floral Story</h2>
            <p>Share your vision, venue, and date—we'll return with a seasonal proposal and curated moodboard.</p>
            <a routerLink="/contact" class="btn btn-primary">Start an Inquiry</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      min-height: 70vh;
      display: flex;
      align-items: center;
      overflow: hidden;
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
      background: linear-gradient(135deg, rgba(15, 61, 62, 0.7) 0%, rgba(15, 61, 62, 0.4) 60%);
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
      font-size: clamp(2.5rem, 5vw, 4rem);
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      opacity: 0.95;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Promos Section */
    .promos {
      padding: 5rem 0;
      background: var(--surface);
    }

    .promos h2 {
      text-align: center;
      margin-bottom: 3rem;
      font-size: 2.5rem;
    }

    .promo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .promo-item {
      background: white;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .promo-item:hover {
      transform: translateY(-4px);
    }

    .promo-img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
    }

    .promo-content {
      padding: 1.5rem;
    }

    .promo-content h3 {
      margin-bottom: 0.5rem;
      color: var(--brand);
    }

    /* About Preview */
    .about-preview {
      padding: 5rem 0;
      background: var(--brand-ghost);
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .content h2 {
      font-size: 2.2rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .content p {
      margin-bottom: 1rem;
      color: var(--muted);
    }

    .about-placeholder {
      aspect-ratio: 4/3;
      background: var(--border);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
    }

    /* CTA Section */
    .cta-section {
      position: relative;
      min-height: 50vh;
      display: flex;
      align-items: center;
    }

    .cta-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .cta-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(231, 198, 194, 0.9) 0%, rgba(231, 198, 194, 0.7) 100%);
      z-index: 2;
      display: flex;
      align-items: center;
      padding: 0 var(--pad);
    }

    .cta-content {
      max-width: var(--container);
      margin: 0 auto;
      text-align: center;
      color: var(--brand);
    }

    .cta-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .two-col {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .promo-grid {
        grid-template-columns: 1fr;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class HomeComponent {}