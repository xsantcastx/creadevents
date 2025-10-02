import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { Project, Service, Testimonial } from '../../models/data.models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home">
      <!-- Hero Section -->
      <section class="hero" [ngStyle]="getHeroStyles()">
        <div class="hero-overlay"></div>
        <div class="hero-inner container">
          <div class="hero-copy">
            <div class="season-pill">Now curating <span>{{ getSeason() | titlecase }}</span> celebrations</div>
            <h1 class="hero-title">{{ getSeasonalCopy()?.hero || 'Artful floral experiences for every season' }}</h1>
            <p class="hero-subtitle">
              {{ getSeasonalCopy()?.tagline || 'Intentional designs, bespoke installations, and seamless experiences for weddings, brand events, and private celebrations.' }}
            </p>
            <div class="hero-actions">
              <a routerLink="/contact" class="btn btn-primary">Plan Your Event</a>
              <a routerLink="/portfolio" class="btn btn-outline">See Our Portfolio</a>
            </div>
            <div class="hero-meta">
              <span>Signature weddings & celebrations</span>
              <span>South Florida � Destination friendly</span>
            </div>
          </div>

          @if (getSeasonalPalette(); as palette) {
            <div class="hero-palette">
              <div class="palette-card card">
                <p class="palette-title">Palette Preview</p>
                <div class="palette-swatches">
                  <span
                    class="swatch"
                    *ngFor="let color of palette | keyvalue"
                    [style.background-color]="color.value"
                    [attr.aria-label]="color.key"
                  ></span>
                </div>
                <p class="palette-season">{{ getSeason() | titlecase }} moodboard</p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Studio Highlights -->
      <section class="studio-highlights">
        <div class="container">
          <div class="section-header">
            <h2>Designing with intention</h2>
            <p class="section-lead">
              Every celebration begins with a story. We translate your memories, moodboards, and brand vision into immersive floral moments.
            </p>
          </div>
          <div class="highlight-grid">
            <article class="highlight-card card">
              <span class="highlight-index">01</span>
              <h3>Season-led art direction</h3>
              <p>
                Palette studies, textures, and florals curated to the time of year�grounded in sustainability and stem availability.
              </p>
            </article>
            <article class="highlight-card card">
              <span class="highlight-index">02</span>
              <h3>Immersive guest journeys</h3>
              <p>
                From ceremony arches to cocktail vignettes, every space is choreographed to guide guests with delight.
              </p>
            </article>
            <article class="highlight-card card">
              <span class="highlight-index">03</span>
              <h3>White-glove production</h3>
              <p>
                Dedicated design, production, and tear-down teams ensure your event feels effortless from load-in to last dance.
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- Featured Projects -->
      <section class="featured-projects">
        <div class="container">
          <div class="section-header">
            <h2>Recent floral stories</h2>
            <p class="section-lead">A glimpse into the weddings, brand launches, and soir�es we have recently dressed in blooms.</p>
          </div>

          @if (featuredProjects$ | async; as projects) {
            <div class="projects-grid">
              @for (project of projects; track project.id) {
                <a class="project-card" [routerLink]="['/portfolio', project.slug]">
                  <div class="project-media">
                    <img [src]="project.heroImage" [alt]="project.title" loading="lazy" />
                  </div>
                  <div class="project-content">
                    <p class="project-meta">{{ project.eventType }} � {{ project.location }}</p>
                    <h3>{{ project.title }}</h3>
                    <span class="project-link">View story</span>
                  </div>
                </a>
              }
            </div>
          } @else {
            <p class="empty-state">We are styling our latest projects�check back soon.</p>
          }
        </div>
      </section>

      <!-- Services Overview -->
      <section class="services-overview">
        <div class="container">
          <div class="section-header">
            <h2>Signature services</h2>
            <p class="section-lead">Curated offerings designed to support events from first concept to final stem.</p>
          </div>

          @if (featuredServices$ | async; as services) {
            <div class="services-grid">
              @for (service of services; track service.id) {
                <article class="service-card card">
                  <div class="service-top">
                    <span class="service-badge">{{ service.title }}</span>
                    <p class="service-summary">{{ service.summary }}</p>
                  </div>
                  <div class="service-inclusions">
                    @for (inclusion of service.inclusions.slice(0, 3); track $index) {
                      <span class="service-chip">{{ inclusion }}</span>
                    }
                  </div>
                  <a [routerLink]="['/services', service.slug]" class="service-link">View details</a>
                </article>
              }
            </div>
          }

          <div class="services-footer">
            <a routerLink="/services" class="btn btn-outline">Explore all services</a>
            <a routerLink="/contact" class="inline-link">Request a tailored proposal</a>
          </div>
        </div>
      </section>

      <!-- Process -->
      <section class="process">
        <div class="container">
          <div class="section-header">
            <h2>The studio approach</h2>
            <p class="section-lead">A collaborative process that keeps you informed and inspired at every milestone.</p>
          </div>
          <div class="process-steps">
            <article class="process-card">
              <span class="step-number">01</span>
              <h3>Discovery & visioning</h3>
              <p>We begin with mood, logistics, and guest experience goals to outline a floral direction and budget.</p>
            </article>
            <article class="process-card">
              <span class="step-number">02</span>
              <h3>Design blueprint</h3>
              <p>Custom concept decks, palettes, and spatial renderings ensure every arrangement feels intentional.</p>
            </article>
            <article class="process-card">
              <span class="step-number">03</span>
              <h3>Production & celebration</h3>
              <p>Full-service installation, strike, and on-site styling so you can savor the celebration without worry.</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="client-voices">
        <div class="container">
          <div class="section-header">
            <h2>Client reflections</h2>
            <p class="section-lead">Kind words from the couples and brands who invite us into their milestone moments.</p>
          </div>

          @if (featuredTestimonials$ | async; as testimonials) {
            <div class="testimonial-grid">
              @for (testimonial of testimonials.slice(0, 3); track testimonial.id) {
                <article class="testimonial-card card">
                  <p class="testimonial-quote">�{{ testimonial.quote }}�</p>
                  <div class="testimonial-author">
                    <strong>{{ testimonial.author }}</strong>
                    @if (testimonial.event || testimonial.role) {
                      <span>{{ testimonial.event || testimonial.role }}</span>
                    }
                  </div>
                </article>
              }
            </div>
          }

          <div class="testimonial-footer">
            <a routerLink="/testimonials" class="inline-link">Browse more stories</a>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta">
        <div class="container">
          <div class="cta-card card">
            <h2>Let�s tailor your floral story</h2>
            <p>Share your vision, venue, and date�we�ll return with a seasonal proposal and curated moodboard.</p>
            <div class="cta-actions">
              <a routerLink="/contact" class="btn btn-primary">Start an inquiry</a>
              <a [routerLink]="['/season', getSeason()]" class="btn btn-outline">Explore seasonal looks</a>
            </div>
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

    .hero {
      position: relative;
      min-height: clamp(32rem, 80vh, 48rem);
      display: flex;
      align-items: center;
      color: var(--theme-text, #22302d);
      background-size: cover;
      background-position: center;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(252, 250, 248, 0.88) 10%, rgba(252, 250, 248, 0.4) 60%);
    }

    .hero-inner {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: clamp(2rem, 4vw, 4rem);
      align-items: center;
    }

    .hero-copy {
      max-width: 520px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .season-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      background: rgba(94, 138, 117, 0.12);
      color: var(--theme-primary, #5e8a75);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
    }

    .season-pill span {
      font-weight: 600;
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      line-height: 1.1;
      margin: 0;
    }

    .hero-subtitle {
      margin: 0;
      color: rgba(34, 48, 45, 0.7);
      font-size: 1.05rem;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      font-size: 0.85rem;
      color: rgba(34, 48, 45, 0.6);
    }

    .hero-meta span {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .hero-palette {
      display: flex;
      justify-content: flex-end;
    }

    .palette-card {
      padding: 1.75rem;
      max-width: 280px;
    }

    .palette-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: rgba(34, 48, 45, 0.55);
      margin-bottom: 1rem;
    }

    .palette-swatches {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .swatch {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .palette-season {
      margin: 0;
      font-size: 0.85rem;
      color: rgba(34, 48, 45, 0.6);
    }

    .section-header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 2.5rem);
    }

    .section-lead {
      margin: 0;
      max-width: 540px;
      color: rgba(34, 48, 45, 0.68);
    }

    .highlight-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .highlight-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .highlight-index {
      font-size: 0.75rem;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: rgba(34, 48, 45, 0.5);
    }

    .highlight-card h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .highlight-card p {
      margin: 0;
      color: rgba(34, 48, 45, 0.7);
    }

    .featured-projects {
      background: rgba(240, 245, 242, 0.45);
    }

    .projects-grid {
      display: grid;
      gap: 1.75rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .project-card {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      border-radius: 24px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 20px 45px rgba(16, 25, 23, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .project-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 26px 60px rgba(16, 25, 23, 0.12);
    }

    .project-media {
      position: relative;
      padding-top: 68%;
      overflow: hidden;
    }

    .project-media img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .project-content {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .project-meta {
      margin: 0;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(34, 48, 45, 0.5);
    }

    .project-content h3 {
      margin: 0;
      font-size: 1.3rem;
    }

    .project-link {
      font-size: 0.9rem;
      color: var(--theme-primary, #5e8a75);
      font-weight: 600;
    }

    .empty-state {
      color: rgba(34, 48, 45, 0.6);
    }

    .services-overview {
      background: var(--theme-background, #fcfaf8);
    }

    .services-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .service-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 260px;
    }

    .service-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(94, 138, 117, 0.12);
      color: var(--theme-primary, #5e8a75);
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .service-summary {
      margin: 0.5rem 0 0;
      color: rgba(34, 48, 45, 0.72);
    }

    .service-inclusions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .service-chip {
      display: inline-flex;
      padding: 0.4rem 0.65rem;
      border-radius: 999px;
      background: rgba(34, 48, 45, 0.08);
      font-size: 0.75rem;
      color: rgba(34, 48, 45, 0.7);
    }

    .service-link {
      margin-top: auto;
      font-weight: 600;
      color: var(--theme-primary, #5e8a75);
      text-decoration: none;
    }

    .service-link:hover {
      text-decoration: underline;
    }

    .services-footer {
      margin-top: 2.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .inline-link {
      color: var(--theme-primary, #5e8a75);
      text-decoration: none;
      font-weight: 600;
    }

    .inline-link:hover {
      text-decoration: underline;
    }

    .process {
      background: rgba(78, 106, 129, 0.06);
    }

    .process-steps {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    .process-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 2.25rem;
      box-shadow: 0 18px 40px rgba(14, 20, 18, 0.07);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .step-number {
      font-size: 0.75rem;
      letter-spacing: 0.28em;
      color: rgba(34, 48, 45, 0.45);
      text-transform: uppercase;
    }

    .process-card h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .process-card p {
      margin: 0;
      color: rgba(34, 48, 45, 0.68);
    }

    .client-voices {
      background: var(--theme-background, #fcfaf8);
    }

    .testimonial-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .testimonial-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .testimonial-quote {
      margin: 0;
      font-size: 1.1rem;
      color: rgba(34, 48, 45, 0.82);
    }

    .testimonial-author {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: rgba(34, 48, 45, 0.65);
    }

    .testimonial-footer {
      margin-top: 2rem;
    }

    .cta {
      padding-bottom: 6rem;
    }

    .cta-card {
      text-align: center;
      padding: clamp(2.5rem, 5vw, 3.5rem);
      background: linear-gradient(135deg, rgba(94, 138, 117, 0.1), rgba(245, 208, 197, 0.16));
    }

    .cta-card h2 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 2.6rem);
    }

    .cta-card p {
      margin: 1rem auto 2rem;
      max-width: 520px;
      color: rgba(34, 48, 45, 0.7);
    }

    .cta-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .hero {
        min-height: auto;
        padding-top: 6rem;
      }

      .hero-inner {
        grid-template-columns: 1fr;
      }

      .hero-palette {
        justify-content: flex-start;
      }

      .palette-card {
        max-width: 100%;
      }

      .hero-actions {
        flex-direction: column;
        align-items: flex-start;
      }

      .services-footer {
        flex-direction: column;
        align-items: flex-start;
      }

      .cta-card {
        text-align: left;
      }

      .cta-actions {
        justify-content: flex-start;
      }
    }

    @media (max-width: 480px) {
      .hero-meta {
        gap: 0.75rem;
        flex-direction: column;
        align-items: flex-start;
      }

      .palette-swatches {
        gap: 0.5rem;
      }

      .swatch {
        width: 36px;
        height: 36px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  featuredProjects$!: Observable<Project[]>;
  featuredServices$!: Observable<Service[]>;
  featuredTestimonials$!: Observable<Testimonial[]>;

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();

    this.featuredProjects$ = this.firestoreService.getFeaturedProjects(4);

    this.featuredServices$ = this.firestoreService.getServices().pipe(
      map(services => {
        const curated = services.filter(service => service.featured);
        return (curated.length ? curated : services).slice(0, 3);
      })
    );

    this.featuredTestimonials$ = this.firestoreService.getTestimonials(true);
  }

  getSeasonalCopy() {
    return this.seasonalThemeService.getSeasonalCopy();
  }

  getSeasonalPalette() {
    return this.seasonalThemeService.getSeasonalPalette();
  }

  getSeason() {
    return this.seasonalThemeService.getSeason();
  }

  getHeroStyles() {
    const theme = this.seasonalThemeService.currentTheme();
    if (theme) {
      return {
        'background-image': `linear-gradient(120deg, rgba(252, 250, 248, 0.9), rgba(252, 250, 248, 0.45)), url('${theme.heroImage}')`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    }

    return {
      'background': 'linear-gradient(120deg, rgba(252, 250, 248, 0.95), rgba(245, 208, 197, 0.25))'
    };
  }
}

