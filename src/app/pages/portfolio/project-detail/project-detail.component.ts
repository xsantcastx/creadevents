import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Project, Testimonial } from '../../../models/data.models';

@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="project-detail-page">
      @if (project()) {
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-image">
            <img [src]="project()!.heroImage" [alt]="project()!.title" loading="eager">
            <div class="hero-overlay">
              <div class="hero-content">
                <div class="breadcrumb">
                  <a routerLink="/portfolio">Portfolio</a>
                  <span class="divider">›</span>
                  <span>{{ project()!.title }}</span>
                </div>
                <h1 class="hero-title">{{ project()!.title }}</h1>
                <div class="project-meta">
                  <span class="project-type">{{ getEventTypeLabel(project()!.eventType) }}</span>
                  @if (project()!.location) {
                    <span class="project-location">📍 {{ project()!.location }}</span>
                  }
                  <span class="project-date">{{ formatDate(project()!.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Project Details -->
        <section class="project-content">
          <div class="container">
            <div class="content-grid">
              
              <!-- Main Content -->
              <div class="main-content">
                @if (project()!.description) {
                  <div class="project-story">
                    <h2>The Story</h2>
                    <p>{{ project()!.description }}</p>
                  </div>
                }

                <!-- Gallery -->
                <div class="project-gallery">
                  <h2>Event Gallery</h2>
                  <div class="gallery-grid">
                    @for (image of project()!.gallery; track image; let i = $index) {
                      <div 
                        class="gallery-item" 
                        [class.large]="i % 6 === 0"
                        (click)="openLightbox(i)">
                        <img [src]="image" [alt]="'Gallery image ' + (i + 1)" loading="lazy">
                        <div class="gallery-overlay">
                          <i class="view-icon">👁</i>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Testimonial Section -->
                @if (projectTestimonial()) {
                  <div class="testimonial-section">
                    <h2>Client Testimonial</h2>
                    <div class="testimonial-card">
                      <div class="quote-mark">"</div>
                      <blockquote>{{ projectTestimonial()!.quote }}</blockquote>
                      <div class="testimonial-author">
                        @if (projectTestimonial()!.photo) {
                          <img [src]="projectTestimonial()!.photo" [alt]="projectTestimonial()!.author">
                        }
                        <div class="author-info">
                          <div class="author-name">{{ projectTestimonial()!.author }}</div>
                          @if (projectTestimonial()!.role) {
                            <div class="author-role">{{ projectTestimonial()!.role }}</div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Sidebar -->
              <div class="sidebar">
                
                <!-- Project Details Card -->
                <div class="details-card">
                  <h3>Project Details</h3>
                  <div class="details-list">
                    <div class="detail-item">
                      <span class="label">Event Type:</span>
                      <span class="value">{{ getEventTypeLabel(project()!.eventType) }}</span>
                    </div>
                    
                    <div class="detail-item">
                      <span class="label">Date:</span>
                      <span class="value">{{ formatDate(project()!.date) }}</span>
                    </div>
                    
                    @if (project()!.location) {
                      <div class="detail-item">
                        <span class="label">Location:</span>
                        <span class="value">{{ project()!.location }}</span>
                      </div>
                    }
                    
                    @if (project()!.venue) {
                      <div class="detail-item">
                        <span class="label">Venue:</span>
                        <span class="value">{{ project()!.venue }}</span>
                      </div>
                    }
                    
                    @if (project()!.season.length > 0) {
                      <div class="detail-item">
                        <span class="label">Season:</span>
                        <span class="value">{{ project()!.season.join(', ') | titlecase }}</span>
                      </div>
                    }
                    
                    @if (project()!.palette.length > 0) {
                      <div class="detail-item">
                        <span class="label">Color Palette:</span>
                        <div class="color-swatches">
                          @for (color of project()!.palette.slice(0, 5); track color) {
                            <div class="color-swatch" [style.background-color]="color" [title]="color"></div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Florals Used -->
                @if (project()?.floralsUsed && project()!.floralsUsed!.length > 0) {
                  <div class="florals-card">
                    <h3>Florals Featured</h3>
                    <div class="florals-list">
                      @for (floral of project()!.floralsUsed!; track floral) {
                        <span class="floral-tag">{{ floral }}</span>
                      }
                    </div>
                  </div>
                }

                <!-- Call to Action -->
                <div class="cta-card">
                  <h3>Love This Style?</h3>
                  <p>Let us create something similar for your special event.</p>
                  <div class="cta-actions">
                    <a routerLink="/contact" class="btn btn-primary">Get a Quote</a>
                    <a href="tel:7863562958" class="btn btn-outline">Call Us</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Related Projects -->
        <section class="related-projects">
          <div class="container">
            <h2>Similar Projects</h2>
            @if (relatedProjects().length > 0) {
              <div class="related-grid">
                @for (relatedProject of relatedProjects(); track relatedProject.id) {
                  <a [routerLink]="['/portfolio', relatedProject.slug]" class="related-item">
                    <div class="related-image">
                      <img [src]="relatedProject.heroImage" [alt]="relatedProject.title" loading="lazy">
                    </div>
                    <div class="related-info">
                      <h4>{{ relatedProject.title }}</h4>
                      <p>{{ getEventTypeLabel(relatedProject.eventType) }}</p>
                    </div>
                  </a>
                }
              </div>
            } @else {
              <div class="no-related">
                <p>Check out our <a routerLink="/portfolio">full portfolio</a> for more inspiration.</p>
              </div>
            }
          </div>
        </section>

      } @else if (loading()) {
        <div class="loading-state">
          <div class="container">
            <h1>Loading project...</h1>
          </div>
        </div>
      } @else {
        <div class="error-state">
          <div class="container">
            <h1>Project not found</h1>
            <p>The project you're looking for doesn't exist or has been removed.</p>
            <a routerLink="/portfolio" class="btn btn-primary">Back to Portfolio</a>
          </div>
        </div>
      }

      <!-- Navigation -->
      <section class="project-navigation">
        <div class="container">
          <div class="nav-actions">
            <button (click)="goBack()" class="btn btn-outline">
              ← Back to Portfolio
            </button>
            <div class="share-actions">
              <span>Share this project:</span>
              <button (click)="shareProject('facebook')" class="share-btn facebook">Facebook</button>
              <button (click)="shareProject('twitter')" class="share-btn twitter">Twitter</button>
              <button (click)="shareProject('email')" class="share-btn email">Email</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Lightbox Modal -->
    @if (lightboxOpen()) {
      <div class="lightbox-overlay" (click)="closeLightbox()">
        <div class="lightbox-container" (click)="$event.stopPropagation()">
          <button class="lightbox-close" (click)="closeLightbox()">×</button>
          
          @if (project()) {
            <div class="lightbox-image">
              <img [src]="project()!.gallery[currentImageIndex()]" [alt]="'Gallery image ' + (currentImageIndex() + 1)">
            </div>
            
            <div class="lightbox-info">
              <h3>{{ project()!.title }}</h3>
              <p>Image {{ currentImageIndex() + 1 }} of {{ project()!.gallery.length }}</p>
            </div>
            
            <!-- Navigation -->
            @if (project()!.gallery.length > 1) {
              <button 
                class="lightbox-nav prev" 
                (click)="previousImage()" 
                [disabled]="currentImageIndex() === 0">
                ‹
              </button>
              <button 
                class="lightbox-nav next" 
                (click)="nextImage()" 
                [disabled]="currentImageIndex() === project()!.gallery.length - 1">
                ›
              </button>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .project-detail-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      position: relative;
      height: 60vh;
      min-height: 400px;
    }

    .hero-image {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
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
        rgba(0,0,0,0.3) 50%,
        rgba(0,0,0,0.5) 100%
      );
      display: flex;
      align-items: flex-end;
    }

    .hero-content {
      color: white;
      padding: 3rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .breadcrumb {
      margin-bottom: 1rem;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .breadcrumb a {
      color: white;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .divider {
      margin: 0 0.5rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .project-meta {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      font-size: 1rem;
    }

    .project-type,
    .project-location,
    .project-date {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .project-content {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 4rem;
      align-items: start;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .project-story h2,
    .project-gallery h2,
    .testimonial-section h2 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
      font-size: 2rem;
      border-bottom: 2px solid var(--theme-primary, #7FB069);
      padding-bottom: 0.5rem;
    }

    .project-story p {
      line-height: 1.8;
      color: var(--theme-text-secondary, #636E72);
      font-size: 1.1rem;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .gallery-item {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
      height: 200px;
    }

    .gallery-item.large {
      grid-column: span 2;
      height: 300px;
    }

    .gallery-item:hover {
      transform: scale(1.02);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .gallery-item:hover .gallery-overlay {
      opacity: 1;
    }

    .view-icon {
      color: white;
      font-size: 2rem;
    }

    .testimonial-card {
      background: var(--theme-secondary, #F7E9E3);
      padding: 2.5rem;
      border-radius: 15px;
      position: relative;
    }

    .quote-mark {
      font-size: 3rem;
      color: var(--theme-primary, #7FB069);
      font-family: serif;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .testimonial-card blockquote {
      font-style: italic;
      font-size: 1.2rem;
      line-height: 1.6;
      color: var(--theme-text, #2D3436);
      margin: 0 0 2rem 0;
      quotes: none;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .testimonial-author img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--theme-primary, #7FB069);
    }

    .author-name {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
    }

    .author-role {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .details-card,
    .florals-card,
    .cta-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .details-card h3,
    .florals-card h3,
    .cta-card h3 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }

    .details-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .label {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
      font-size: 0.9rem;
    }

    .value {
      color: var(--theme-text-secondary, #636E72);
    }

    .color-swatches {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .color-swatch {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .florals-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .floral-tag {
      background: var(--theme-primary, #7FB069);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .cta-card p {
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .cta-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
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

    .related-projects {
      background: #f8f9fa;
      padding: 4rem 0;
    }

    .related-projects h2 {
      text-align: center;
      color: var(--theme-text, #2D3436);
      margin-bottom: 3rem;
      font-size: 2.5rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .related-item {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      text-decoration: none;
      transition: transform 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .related-item:hover {
      transform: translateY(-5px);
    }

    .related-image {
      height: 200px;
      overflow: hidden;
    }

    .related-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .related-item:hover .related-image img {
      transform: scale(1.1);
    }

    .related-info {
      padding: 1.5rem;
    }

    .related-info h4 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .related-info p {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .no-related {
      text-align: center;
      padding: 2rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .no-related a {
      color: var(--theme-primary, #7FB069);
      text-decoration: underline;
    }

    .project-navigation {
      background: var(--theme-secondary, #F7E9E3);
      padding: 2rem 0;
    }

    .nav-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .share-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .share-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      transition: opacity 0.3s ease;
    }

    .share-btn:hover {
      opacity: 0.8;
    }

    .share-btn.facebook {
      background: #1877F2;
    }

    .share-btn.twitter {
      background: #1DA1F2;
    }

    .share-btn.email {
      background: #6c757d;
    }

    .loading-state,
    .error-state {
      padding: 4rem 0;
      text-align: center;
    }

    .error-state h1 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .error-state p {
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
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
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 15px;
      overflow: hidden;
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
    }

    .lightbox-image img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }

    .lightbox-info {
      padding: 1.5rem;
      text-align: center;
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

      .project-meta {
        flex-direction: column;
        gap: 0.5rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .gallery-item.large {
        grid-column: span 1;
        height: 200px;
      }

      .nav-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .share-actions {
        justify-content: center;
      }

      .related-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  project = signal<Project | null>(null);
  projectTestimonial = signal<Testimonial | null>(null);
  relatedProjects = signal<Project[]>([]);
  loading = signal(true);
  lightboxOpen = signal(false);
  currentImageIndex = signal(0);

  allProjects: Project[] = [];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadProject();
  }

  private loadProject(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      return;
    }

    // Load all projects first to find by slug and get related projects
    this.firestoreService.getProjects().subscribe(projects => {
      this.allProjects = projects;
      const foundProject = projects.find(p => p.slug === slug);
      
      if (foundProject) {
        this.project.set(foundProject);
        if (foundProject.testimonialRef) {
          this.loadTestimonial(foundProject.testimonialRef);
        }
        this.loadRelatedProjects(foundProject);
      }
      this.loading.set(false);
    });
  }

  private loadTestimonial(testimonialRef?: string): void {
    if (!testimonialRef) return;

    this.firestoreService.getTestimonials().subscribe(testimonials => {
      const testimonial = testimonials.find(t => t.id === testimonialRef);
      if (testimonial) {
        this.projectTestimonial.set(testimonial);
      }
    });
  }

  private loadRelatedProjects(currentProject?: Project | null): void {
    if (!currentProject) return;

    // Filter related projects from Firebase data
    const related = this.allProjects
      .filter(p => p.id !== currentProject.id && p.eventType === currentProject.eventType)
      .slice(0, 3);
    
    this.relatedProjects.set(related);
  }

  getEventTypeLabel(eventType: string): string {
    const labels: { [key: string]: string } = {
      'wedding': 'Wedding',
      'corporate': 'Corporate Event',
      'private-party': 'Private Party',
      'installation': 'Installation',
      'funeral': 'Memorial Service',
      'celebration-of-life': 'Celebration of Life',
      'other': 'Special Event'
    };
    return labels[eventType] || eventType;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openLightbox(index: number): void {
    this.currentImageIndex.set(index);
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  previousImage(): void {
    const current = this.currentImageIndex();
    if (current > 0) {
      this.currentImageIndex.set(current - 1);
    }
  }

  nextImage(): void {
    const current = this.currentImageIndex();
    const project = this.project();
    if (project && current < project.gallery.length - 1) {
      this.currentImageIndex.set(current + 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/portfolio']);
  }

  shareProject(platform: string): void {
    const project = this.project();
    if (!project) return;

    const url = window.location.href;
    const title = `Check out this beautiful ${this.getEventTypeLabel(project.eventType).toLowerCase()}: ${project.title}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }
  }
}