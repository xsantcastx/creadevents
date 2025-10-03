import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlotImgComponent } from '../../shared/slot-img/slot-img.component';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink, SlotImgComponent],
  template: `
    <div class="about">
      <!-- Hero Section with Slot -->
      <section class="hero-section">
        <slot-img key="about.header" class="hero-img" altDefault="About Us – CreaDEvents"></slot-img>
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>About CreaDEvents</h1>
            <p>A family-owned floral studio creating artful experiences in South Florida for over 15 years.</p>
          </div>
        </div>
      </section>

      <!-- Our Story -->
      <section class="story-section">
        <div class="container">
          <div class="two-col">
            <div class="content">
              <h2>Our Story</h2>
              <p class="lead">Every celebration begins with a story. Ours started with a simple belief: flowers have the power to transform moments into memories.</p>
              <p>Founded in Miami, CreaDEvents has grown from a passion project into a trusted partner for weddings, corporate events, and private celebrations throughout South Florida.</p>
              <p>We're not just florists—we're memory makers, mood setters, and moment creators. Each arrangement tells a story, each installation sets a scene, and each celebration becomes unforgettable.</p>
              <div class="story-stats">
                <div class="stat">
                  <div class="stat-number">15+</div>
                  <div class="stat-label">Years in Business</div>
                </div>
                <div class="stat">
                  <div class="stat-number">500+</div>
                  <div class="stat-label">Events Created</div>
                </div>
                <div class="stat">
                  <div class="stat-number">3</div>
                  <div class="stat-label">Service Areas</div>
                </div>
              </div>
            </div>
            <div class="visual">
              <slot-img key="about.studio" class="story-img" altDefault="Our studio"></slot-img>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <div class="team-intro">
            <h2>Meet Our Team</h2>
            <p>The passionate creators behind every beautiful moment.</p>
          </div>
          
          <div class="team-content">
            <slot-img key="about.team" class="team-img" altDefault="Our team"></slot-img>
            <div class="team-story">
              <h3>Passionate Artisans</h3>
              <p>Our team brings together diverse backgrounds in floral design, event planning, and hospitality. We share a common passion: creating experiences that exceed expectations.</p>
              <p>From concept to installation, each team member contributes their expertise to ensure your celebration reflects your unique style and vision.</p>
              <p>We stay current with design trends while honoring timeless techniques, blending innovation with the artisanal craftsmanship that defines our work.</p>
              
              <div class="values">
                <div class="value">
                  <h4>Seasonal Sourcing</h4>
                  <p>Working with the best blooms each season has to offer.</p>
                </div>
                <div class="value">
                  <h4>Personal Attention</h4>
                  <p>Every client receives dedicated, personalized service.</p>
                </div>
                <div class="value">
                  <h4>Sustainable Practices</h4>
                  <p>Environmentally conscious choices in sourcing and design.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Process Section -->
      <section class="process-section">
        <div class="container">
          <h2>How We Work</h2>
          <div class="process-steps">
            <div class="step">
              <div class="step-icon">💭</div>
              <h3>Discovery</h3>
              <p>We start by understanding your vision, venue, and style preferences. Tell us about your dream celebration.</p>
            </div>
            <div class="step">
              <div class="step-icon">🎨</div>
              <h3>Design</h3>
              <p>Our team creates a custom proposal with seasonal florals, color palettes, and installation concepts.</p>
            </div>
            <div class="step">
              <div class="step-icon">✨</div>
              <h3>Installation</h3>
              <p>On your special day, we handle every detail of setup and installation, ensuring everything is perfect.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Service Areas -->
      <section class="coverage-section">
        <div class="container">
          <div class="coverage-content">
            <h2>Where We Serve</h2>
            <p>Based in Miami, we serve South Florida and welcome destination projects.</p>
            
            <div class="coverage-areas">
              <div class="area">
                <h3>Miami-Dade</h3>
                <p>Our home base with full-service availability.</p>
              </div>
              <div class="area">
                <h3>Broward County</h3>
                <p>Fort Lauderdale and surrounding areas.</p>
              </div>
              <div class="area">
                <h3>Destination Events</h3>
                <p>We travel for special celebrations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Start Planning?</h2>
            <p>Let's discuss your vision and create something beautiful together. We're here to make your celebration extraordinary.</p>
            <div class="cta-actions">
              <a routerLink="/contact" class="btn btn-primary">Get in Touch</a>
              <a routerLink="/portfolio" class="btn ghost">See Our Work</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about {
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

    /* Story Section */
    .story-section {
      padding: 5rem 0;
      background: var(--surface);
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .content h2 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      color: var(--brand);
    }

    .lead {
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--brand);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .content p {
      margin-bottom: 1.5rem;
      color: var(--muted);
      line-height: 1.7;
    }

    .story-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-top: 2rem;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--brand);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .story-img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: var(--radius);
    }

    /* Team Section */
    .team-section {
      padding: 5rem 0;
    }

    .team-intro {
      text-align: center;
      margin-bottom: 4rem;
    }

    .team-intro h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .team-intro p {
      font-size: 1.1rem;
      color: var(--muted);
      max-width: 500px;
      margin: 0 auto;
    }

    .team-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }

    .team-img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: var(--radius);
    }

    .team-story h3 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .team-story p {
      margin-bottom: 1.5rem;
      color: var(--muted);
      line-height: 1.7;
    }

    .values {
      margin-top: 2rem;
      display: grid;
      gap: 1.5rem;
    }

    .value h4 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: var(--brand);
    }

    .value p {
      margin: 0;
      font-size: 0.95rem;
      color: var(--muted);
    }

    /* Process Section */
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

    .step-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
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

    /* Coverage Section */
    .coverage-section {
      padding: 5rem 0;
    }

    .coverage-content {
      text-align: center;
    }

    .coverage-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .coverage-content > p {
      font-size: 1.1rem;
      margin-bottom: 3rem;
      color: var(--muted);
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .coverage-areas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .area {
      padding: 2rem;
      background: white;
      border-radius: var(--radius);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .area h3 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .area p {
      margin: 0;
      color: var(--muted);
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
      .two-col,
      .team-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .story-stats {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .process-steps,
      .coverage-areas {
        grid-template-columns: 1fr;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class AboutComponent {}