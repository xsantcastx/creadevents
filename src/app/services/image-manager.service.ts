import { Injectable, signal } from '@angular/core';

export interface PlaceholderImage {
  id: string;
  url: string;
  alt?: string;
}

export interface HomePageImages {
  hero: {
    main?: string;
    mobile?: string;
    overlay?: string;
  };
  logos: {
    logo1?: string;
    logo2?: string;
    logo3?: string;
    logo4?: string;
  };
  services: {
    service1?: string;
    service2?: string;
    service3?: string;
  };
  about: {
    aboutImage1?: string;
    aboutImage2?: string;
  };
  portfolio: {
    project1?: string;
    project2?: string;
    project3?: string;
  };
  cta: {
    main?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ImageManagerService {
  private homeImages = signal<HomePageImages>({
    hero: {},
    logos: {},
    services: {},
    about: {},
    portfolio: {},
    cta: {}
  });

  // Getter for components to access images
  getHomeImages() {
    return this.homeImages();
  }

  // Get specific hero image
  getHeroImage(type: 'main' | 'mobile' | 'overlay'): string | undefined {
    return this.homeImages().hero[type];
  }

  // Get specific logo
  getLogo(position: 'logo1' | 'logo2' | 'logo3' | 'logo4'): string | undefined {
    return this.homeImages().logos[position];
  }

  // Get service image
  getServiceImage(service: 'service1' | 'service2' | 'service3'): string | undefined {
    return this.homeImages().services[service];
  }

  // Get about image
  getAboutImage(position: 'aboutImage1' | 'aboutImage2'): string | undefined {
    return this.homeImages().about[position];
  }

  // Get portfolio preview image
  getPortfolioImage(position: 'project1' | 'project2' | 'project3'): string | undefined {
    return this.homeImages().portfolio[position];
  }

  // Get CTA image
  getCTAImage(): string | undefined {
    return this.homeImages().cta.main;
  }

  // Update images from admin (called when applying staged changes)
  updatePlaceholderImage(placeholderId: string, imageUrl: string) {
    const current = this.homeImages();
    const updated = { ...current };

    // Map placeholder IDs to image structure
    switch (placeholderId) {
      case 'hero-main':
        updated.hero.main = imageUrl;
        break;
      case 'hero-mobile':
        updated.hero.mobile = imageUrl;
        break;
      case 'hero-overlay':
        updated.hero.overlay = imageUrl;
        break;
      case 'logo-1':
        updated.logos.logo1 = imageUrl;
        break;
      case 'logo-2':
        updated.logos.logo2 = imageUrl;
        break;
      case 'logo-3':
        updated.logos.logo3 = imageUrl;
        break;
      case 'logo-4':
        updated.logos.logo4 = imageUrl;
        break;
      case 'service-1':
        updated.services.service1 = imageUrl;
        break;
      case 'service-2':
        updated.services.service2 = imageUrl;
        break;
      case 'service-3':
        updated.services.service3 = imageUrl;
        break;
      case 'about-1':
        updated.about.aboutImage1 = imageUrl;
        break;
      case 'about-2':
        updated.about.aboutImage2 = imageUrl;
        break;
      case 'portfolio-1':
        updated.portfolio.project1 = imageUrl;
        break;
      case 'portfolio-2':
        updated.portfolio.project2 = imageUrl;
        break;
      case 'portfolio-3':
        updated.portfolio.project3 = imageUrl;
        break;
      case 'cta-main':
        updated.cta.main = imageUrl;
        break;
    }

    this.homeImages.set(updated);
    
    // Optionally persist to localStorage for development
    localStorage.setItem('homePageImages', JSON.stringify(updated));
  }

  // Load images from storage (called on app init)
  loadImages() {
    const stored = localStorage.getItem('homePageImages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.homeImages.set(parsed);
      } catch (error) {
        console.error('Error loading stored images:', error);
      }
    }
  }

  // Clear all images
  clearAllImages() {
    this.homeImages.set({
      hero: {},
      logos: {},
      services: {},
      about: {},
      portfolio: {},
      cta: {}
    });
    localStorage.removeItem('homePageImages');
  }
}