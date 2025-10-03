import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { Testimonial } from '../../models/data.models';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule, RouterLink],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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