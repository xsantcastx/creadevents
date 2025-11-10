import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, HeroImage } from '../../../services/settings.service';
import { BrandConfigService } from '../../../core/services/brand-config.service';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section class="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden -mt-[44px] pt-[44px]">
      <!-- Animated background images -->
      <div class="absolute inset-0">
        @for (image of heroImages; track image.id; let i = $index) {
          <div 
            class="absolute inset-0 transition-opacity duration-1000"
            [class.opacity-100]="currentImageIndex === i"
            [class.opacity-0]="currentImageIndex !== i"
          >
            <div class="w-full h-full animate-ken-burns">
              @if (image.webpUrl) {
                <picture>
                  <source [srcset]="image.webpUrl" type="image/webp">
                  <img 
                    [src]="image.url" 
                    [alt]="image.alt"
                    class="w-full h-full object-cover image-rendering-crisp"
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                  />
                </picture>
              } @else {
                <img 
                  [src]="image.url" 
                  [alt]="image.alt"
                  class="w-full h-full object-cover image-rendering-crisp"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                />
              }
            </div>
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
          </div>
        }
      </div>
      
      <!-- Hero content - Centered and compact -->
      <div class="relative h-full flex flex-col items-center justify-center max-w-7xl mx-auto px-6 z-10 text-center">
        <div class="flex items-center gap-4 mb-6 animate-fade-in-up">
          <img [src]="brandLogo" [alt]="brandName" class="h-16 w-16 md:h-20 md:w-20 rounded-xl shadow-bitcoin"/>
          <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight bitcoin-gradient-text">
            {{ heroContent?.title || brandName }}
          </h1>
        </div>
        <p class="max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed mb-8 animate-fade-in-up animation-delay-200">
          {{ heroContent?.subtitle || ('home.hero.subtitle' | translate) }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
          <a 
            [routerLink]="heroContent?.primaryCta?.href || '/productos'"
            class="px-8 py-3.5 rounded-full bg-bitcoin-orange text-bitcoin-dark font-semibold hover:bg-bitcoin-gold transition-all hover:scale-105 text-center shadow-bitcoin"
          >
            {{ heroContent?.primaryCta?.label || ('home.hero.cta_primary' | translate) }}
          </a>
          <a 
            [routerLink]="heroContent?.secondaryCta?.href || '/contacto'"
            class="px-8 py-3.5 rounded-full ring-2 ring-bitcoin-gold/60 text-bitcoin-gold hover:bg-bitcoin-orange/10 transition-all hover:scale-105 text-center backdrop-blur-sm"
          >
            {{ heroContent?.secondaryCta?.label || ('home.hero.cta_secondary' | translate) }}
          </a>
        </div>

        <!-- Image indicators -->
        @if (heroImages.length > 1) {
          <div class="mt-8 flex gap-2">
            @for (image of heroImages; track image.id; let i = $index) {
              <button
                (click)="setCurrentImage(i)"
                class="w-2 h-2 rounded-full transition-all"
                [class.bg-bitcoin-orange]="currentImageIndex === i"
                [class.w-8]="currentImageIndex === i"
                [class.bg-white/40]="currentImageIndex !== i"
                [attr.aria-label]="'Image ' + (i + 1)"
              ></button>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    @keyframes ken-burns {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(1.1);
      }
    }

    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-ken-burns {
      animation: ken-burns 20s ease-in-out infinite alternate;
    }

    .animate-fade-in-up {
      animation: fade-in-up 0.8s ease-out forwards;
      opacity: 0;
    }

    .animation-delay-200 {
      animation-delay: 0.2s;
    }

    .animation-delay-400 {
      animation-delay: 0.4s;
    }

    /* High-quality image rendering */
    .image-rendering-crisp {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform;
    }

    /* Prevent blur during animations */
    img {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `]
})
export class HomeHeroComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);
  private brandConfig = inject(BrandConfigService);
  
  heroImages: HeroImage[] = [];
  currentImageIndex = 0;
  private interval: any;
  readonly heroContent = this.brandConfig.site.hero;
  readonly brandName = this.brandConfig.siteName;
  readonly brandLogo = this.brandConfig.site.brand.logo;

  async ngOnInit(): Promise<void> {
    await this.loadHeroImages();
    
    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.startImageRotation();
      }, 0);
    }
  }

  async loadHeroImages(): Promise<void> {
    try {
      await this.settingsService.getSettings(true);
      this.heroImages = this.settingsService.getHeroImages();
    } catch (error) {
      console.error('Error loading hero images:', error);
      this.heroImages = [];
    }
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private startImageRotation(): void {
    this.interval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.heroImages.length;
      this.cdr.detectChanges();
    }, 6000); // Change image every 6 seconds
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
    this.cdr.detectChanges();
    // Reset the interval when user manually changes image
    if (this.interval) {
      clearInterval(this.interval);
      this.startImageRotation();
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
    this.cdr.detectChanges();
  }
}
