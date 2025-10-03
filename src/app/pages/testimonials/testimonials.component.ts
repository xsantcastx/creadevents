import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { Testimonial } from '../../models/data.models';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="testimonials-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">What Our Clients Say</h1>
          <p class="hero-subtitle">
            Don't just take our word for it - hear from the couples, businesses, and families 
            who have trusted us to make their special moments unforgettable.
          </p>
        </div>
      </section>

      <!-- Featured Testimonials Slider -->
      <section class="featured-testimonials">
        <div class="container">
          <div class="slider-container">
            @if (featuredTestimonials().length > 0) {
              <div class="testimonial-slider">
                @for (testimonial of featuredTestimonials(); track testimonial.id; let i = $index) {
                  <div 
                    class="testimonial-slide" 
                    [class.active]="i === currentSlide()"
                    [style.transform]="'translateX(' + (i - currentSlide()) * 100 + '%)'">
                    
                    <div class="testimonial-card">
                      <div class="quote-mark">"</div>
                      <blockquote class="testimonial-quote">
                        {{ testimonial.quote }}
                      </blockquote>
                      
                      <div class="testimonial-footer">
                        @if (testimonial.photo) {
                          <div class="client-photo">
                            <img [src]="testimonial.photo" [alt]="testimonial.author" loading="lazy">
                          </div>
                        }
                        
                        <div class="client-info">
                          <div class="client-name">{{ testimonial.author }}</div>
                          @if (testimonial.event) {
                            <div class="event-type">{{ testimonial.event }}</div>
                          }
                          @if (testimonial.role) {
                            <div class="client-role">{{ testimonial.role }}</div>
                          }
                          @if (testimonial.rating) {
                            <div class="rating">
                              @for (star of getStars(testimonial.rating); track star) {
                                <span class="star">⭐</span>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Slider Controls -->
              <div class="slider-controls">
                <button 
                  class="slider-btn prev" 
                  (click)="previousSlide()"
                  [disabled]="featuredTestimonials().length <= 1">
                  &#8249;
                </button>
                
                <div class="slider-dots">
                  @for (testimonial of featuredTestimonials(); track testimonial.id; let i = $index) {
                    <button 
                      class="dot" 
                      [class.active]="i === currentSlide()"
                      (click)="goToSlide(i)">
                    </button>
                  }
                </div>
                
                <button 
                  class="slider-btn next" 
                  (click)="nextSlide()"
                  [disabled]="featuredTestimonials().length <= 1">
                  &#8250;
                </button>
              </div>
            } @else {
              <div class="loading-state">
                <p>Loading testimonials...</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- All Testimonials Grid -->
      <section class="all-testimonials">
        <div class="container">
          <h2>All Client Reviews</h2>
          
          @if (allTestimonials().length > 0) {
            <div class="testimonials-grid">
              @for (testimonial of allTestimonials(); track testimonial.id) {
                <div class="testimonial-grid-item" [class.featured]="testimonial.featured">
                  <div class="grid-quote-mark">"</div>
                  <blockquote class="grid-testimonial-quote">
                    {{ testimonial.quote }}
                  </blockquote>
                  
                  <div class="grid-testimonial-footer">
                    @if (testimonial.photo) {
                      <div class="grid-client-photo">
                        <img [src]="testimonial.photo" [alt]="testimonial.author" loading="lazy">
                      </div>
                    }
                    
                    <div class="grid-client-info">
                      <div class="grid-client-name">{{ testimonial.author }}</div>
                      @if (testimonial.event) {
                        <div class="grid-event-type">{{ testimonial.event }}</div>
                      }
                      @if (testimonial.rating) {
                        <div class="grid-rating">
                          @for (star of getStars(testimonial.rating); track star) {
                            <span class="star">⭐</span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="no-testimonials">
              <p>No testimonials available at this time.</p>
            </div>
          }
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ allTestimonials().length }}+</div>
              <div class="stat-label">Happy Clients</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ getAverageRating() }}</div>
              <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">15+</div>
              <div class="stat-label">Years of Excellence</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Events Completed</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Create Your Own Success Story?</h2>
            <p>
              Join our family of satisfied clients and let us make your event dreams come true. 
              Contact us today for a personalized consultation.
            </p>
            <div class="cta-actions">
              <a href="tel:7863562958" class="btn btn-primary">Call (786) 356-2958</a>
              <a routerLink="/contact" class="btn btn-outline">Start Planning</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .testimonials-page {
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

    .featured-testimonials {
      padding: 4rem 0;
      background: white;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .slider-container {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
    }

    .testimonial-slider {
      position: relative;
      height: 400px;
      overflow: hidden;
      border-radius: 20px;
    }

    .testimonial-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transition: transform 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .testimonial-card {
      background: var(--theme-secondary, #F7E9E3);
      padding: 3rem;
      border-radius: 20px;
      text-align: center;
      position: relative;
      width: 100%;
      max-width: 600px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }

    .quote-mark {
      font-size: 4rem;
      color: var(--theme-primary, #7FB069);
      font-family: serif;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .testimonial-quote {
      font-size: 1.3rem;
      line-height: 1.6;
      color: var(--theme-text, #2D3436);
      font-style: italic;
      margin: 0 0 2rem 0;
      quotes: none;
    }

    .testimonial-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }

    .client-photo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--theme-primary, #7FB069);
    }

    .client-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .client-info {
      text-align: left;
    }

    .client-name {
      font-weight: 700;
      color: var(--theme-text, #2D3436);
      font-size: 1.1rem;
    }

    .event-type,
    .client-role {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .rating {
      margin-top: 0.5rem;
    }

    .star {
      font-size: 1rem;
    }

    .slider-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
    }

    .slider-btn {
      background: var(--theme-primary, #7FB069);
      color: white;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slider-btn:hover:not(:disabled) {
      background: var(--theme-accent, #5e8a75);
      transform: scale(1.1);
    }

    .slider-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .slider-dots {
      display: flex;
      gap: 0.5rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: none;
      background: #E0E0E0;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .dot.active {
      background: var(--theme-primary, #7FB069);
    }

    .loading-state,
    .no-testimonials {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .all-testimonials {
      padding: 4rem 0;
      background: #f8f9fa;
    }

    .all-testimonials h2 {
      text-align: center;
      color: var(--theme-text, #2D3436);
      margin-bottom: 3rem;
      font-size: 2.5rem;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .testimonial-grid-item {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      position: relative;
    }

    .testimonial-grid-item:hover {
      transform: translateY(-5px);
    }

    .testimonial-grid-item.featured {
      border: 2px solid var(--theme-accent, #FFEAA7);
      background: linear-gradient(135deg, #fff 0%, #fefefe 100%);
    }

    .testimonial-grid-item.featured::before {
      content: '⭐ Featured';
      position: absolute;
      top: -10px;
      right: 1rem;
      background: var(--theme-accent, #FFEAA7);
      color: var(--theme-text, #2D3436);
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .grid-quote-mark {
      font-size: 2rem;
      color: var(--theme-primary, #7FB069);
      font-family: serif;
      margin-bottom: 1rem;
    }

    .grid-testimonial-quote {
      font-style: italic;
      line-height: 1.6;
      color: var(--theme-text, #2D3436);
      margin: 0 0 1.5rem 0;
      quotes: none;
    }

    .grid-testimonial-footer {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .grid-client-photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--theme-primary, #7FB069);
      flex-shrink: 0;
    }

    .grid-client-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .grid-client-info {
      flex: 1;
    }

    .grid-client-name {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
    }

    .grid-event-type {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .grid-rating {
      margin-top: 0.5rem;
    }

    .stats-section {
      padding: 4rem 0;
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      text-align: center;
    }

    .stat-item {
      padding: 1rem;
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
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
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

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .testimonial-card {
        padding: 2rem;
      }

      .testimonial-quote {
        font-size: 1.1rem;
      }

      .testimonial-footer {
        flex-direction: column;
        gap: 1rem;
      }

      .client-info {
        text-align: center;
      }

      .slider-controls {
        gap: 1rem;
      }

      .testimonials-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
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
export class TestimonialsComponent implements OnInit, OnDestroy {
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);
  
  currentSlide = signal(0);
  featuredTestimonials = signal<Testimonial[]>([]);
  allTestimonials = signal<Testimonial[]>([]);
  autoSlideInterval: any;

  // Sample testimonials data - in real app this would come from Firestore
  sampleTestimonials: Testimonial[] = [
    {
      id: '1',
      author: 'Maria & Carlos Rodriguez',
      event: 'Wedding Reception',
      quote: 'Creation Design & Events made our wedding absolutely magical! From the stunning floral arrangements to the perfect lighting, every detail was executed flawlessly. Our guests are still talking about how beautiful everything was.',
      photo: '/assets/logo1.jpg',
      rating: 5,
      featured: true,
      createdAt: new Date()
    },
    {
      id: '2',
      author: 'Jennifer Martinez',
      role: 'Event Coordinator',
      event: 'Corporate Gala',
      quote: 'Working with Creation Design & Events for our annual corporate gala was a dream. They understood our vision perfectly and delivered beyond our expectations. Professional, creative, and reliable.',
      photo: '/assets/logo2.jpg',
      rating: 5,
      featured: true,
      createdAt: new Date()
    },
    {
      id: '3',
      author: 'Sofia & Miguel Torres',
      event: 'Garden Wedding',
      quote: 'Our outdoor wedding was transformed into a fairy tale garden. The team worked seamlessly with our venue and created the most romantic atmosphere. Thank you for making our special day perfect!',
      photo: '/assets/logo3.jpg',
      rating: 5,
      featured: true,
      createdAt: new Date()
    },
    {
      id: '4',
      author: 'Elena Rodriguez',
      event: '50th Birthday Celebration',
      quote: 'For my milestone birthday, I wanted something elegant and memorable. The team created a sophisticated celebration that perfectly captured my style. Every guest was impressed!',
      rating: 5,
      featured: false,
      createdAt: new Date()
    },
    {
      id: '5',
      author: 'The Johnson Family',
      event: 'Holiday Party',
      quote: 'Our annual holiday party has never looked better! The seasonal decorations were absolutely stunning and created such a warm, festive atmosphere for our family gathering.',
      rating: 5,
      featured: false,
      createdAt: new Date()
    },
    {
      id: '6',
      author: 'Miami Business Group',
      role: 'Executive Team',
      event: 'Corporate Holiday Party',
      quote: 'Professional, punctual, and absolutely creative. They transformed our office space into a winter wonderland for our holiday party. Highly recommend their services!',
      rating: 5,
      featured: false,
      createdAt: new Date()
    },
    {
      id: '7',
      author: 'Ana Gutierrez',
      event: 'Quinceañera',
      quote: 'My daughter\'s quinceañera was everything we dreamed of and more. The floral arrangements were breathtaking and the attention to detail was incredible. Thank you for making this day so special!',
      rating: 5,
      featured: false,
      createdAt: new Date()
    },
    {
      id: '8',
      author: 'David Chen',
      role: 'Groom',
      event: 'Beach Wedding',
      quote: 'Planning a beach wedding in Miami could have been stressful, but Creation Design & Events made it effortless. They handled every detail with care and professionalism.',
      rating: 4,
      featured: false,
      createdAt: new Date()
    }
  ];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadTestimonials();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private loadTestimonials(): void {
    this.firestoreService.getTestimonials().subscribe(testimonials => {
      this.allTestimonials.set(testimonials);
      this.featuredTestimonials.set(testimonials.filter(t => t.featured));
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getAverageRating(): string {
    const testimonials = this.allTestimonials();
    if (testimonials.length === 0) return '0';
    
    const ratingsSum = testimonials
      .filter(t => t.rating)
      .reduce((sum, t) => sum + (t.rating || 0), 0);
    
    const ratingsCount = testimonials.filter(t => t.rating).length;
    const average = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    
    return average.toFixed(1) + '/5';
  }

  nextSlide(): void {
    const featured = this.featuredTestimonials();
    if (featured.length > 1) {
      this.currentSlide.set((this.currentSlide() + 1) % featured.length);
    }
  }

  previousSlide(): void {
    const featured = this.featuredTestimonials();
    if (featured.length > 1) {
      this.currentSlide.set((this.currentSlide() - 1 + featured.length) % featured.length);
    }
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      if (this.featuredTestimonials().length > 1) {
        this.nextSlide();
      }
    }, 5000); // Change slide every 5 seconds
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}