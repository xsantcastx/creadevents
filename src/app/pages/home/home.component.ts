import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { ImageManagerService } from '../../services/image-manager.service';
import { Project, Service, Testimonial } from '../../models/data.models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);
  private imageManagerService = inject(ImageManagerService);

  featuredProjects$: Observable<Project[]> = this.firestoreService.getProjects().pipe(
    map(projects => projects.filter(p => p.featured).slice(0, 6))
  );

  featuredServices$: Observable<Service[]> = this.firestoreService.getServices().pipe(
    map(services => services.filter(s => s.featured).slice(0, 3))
  );

  featuredTestimonials$: Observable<Testimonial[]> = this.firestoreService.getTestimonials().pipe(
    map(testimonials => testimonials.slice(0, 3))
  );

  ngOnInit() {
    // Load saved images when component initializes
    this.imageManagerService.loadImages();
  }

  getSeason() {
    return this.seasonalThemeService.getCurrentSeason();
  }

  getSeasonalCopy() {
    return this.seasonalThemeService.getSeasonalCopy();
  }

  getSeasonalPalette() {
    return this.seasonalThemeService.getSeasonalPalette();
  }

  // Image Manager Integration Methods
  getHeroImage(): string | undefined {
    return this.imageManagerService.getHeroImage('main');
  }

  getLogo(position: 'logo1' | 'logo2' | 'logo3' | 'logo4'): string | undefined {
    return this.imageManagerService.getLogo(position);
  }

  getServiceImage(service: 'service1' | 'service2' | 'service3'): string | undefined {
    return this.imageManagerService.getServiceImage(service);
  }

  getPortfolioImage(position: 'project1' | 'project2' | 'project3'): string | undefined {
    return this.imageManagerService.getPortfolioImage(position);
  }

  getCTAImage(): string | undefined {
    return this.imageManagerService.getCTAImage();
  }

  // Helper methods for template
  hasClientLogos(): boolean {
    return !!(this.getLogo('logo1') || this.getLogo('logo2') || this.getLogo('logo3') || this.getLogo('logo4'));
  }

  hasServiceImages(): boolean {
    return !!(this.getServiceImage('service1') || this.getServiceImage('service2') || this.getServiceImage('service3'));
  }

  hasPortfolioImages(): boolean {
    return !!(this.getPortfolioImage('project1') || this.getPortfolioImage('project2') || this.getPortfolioImage('project3'));
  }

  getHeroStyles() {
    const season = this.getSeason();
    const heroImage = this.getHeroImage();
    
    // If we have a managed hero image, use it
    if (heroImage) {
      return {
        'background-image': `url(${heroImage})`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    }

    // Fallback to seasonal gradients
    const gradients = {
      'spring': 'linear-gradient(120deg, rgba(252, 250, 248, 0.95), rgba(195, 230, 203, 0.65))',
      'summer': 'linear-gradient(120deg, rgba(252, 250, 248, 0.95), rgba(255, 218, 185, 0.65))',
      'fall': 'linear-gradient(120deg, rgba(252, 250, 248, 0.95), rgba(245, 208, 197, 0.65))',
      'winter': 'linear-gradient(120deg, rgba(252, 250, 248, 0.95), rgba(220, 225, 235, 0.65))'
    };

    if (season && gradients[season as keyof typeof gradients]) {
      return {
        'background': gradients[season as keyof typeof gradients]
      };
    }

    return {
      'background': 'linear-gradient(120deg, rgba(252, 250, 248, 0.95), rgba(245, 208, 197, 0.25))'
    };
  }
}