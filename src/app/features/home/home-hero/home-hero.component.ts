import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, HeroImage } from '../../../services/settings.service';
import { BrandConfigService } from '../../../core/services/brand-config.service';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-hero.html',
  styleUrls: ['./home-hero.scss']
})
export class HomeHeroComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);
  private brandConfig = inject(BrandConfigService);
  
  rotatingImages: HeroImage[] = [];
  currentImageIndex = 0;
  private interval: any;
  readonly heroContent = this.brandConfig.site.hero;
  readonly brandName = this.brandConfig.siteName;
  readonly brandLogo = this.brandConfig.site.brand.logo;
  
  // Custom hero text and image from settings
  customImage = '';
  customTitle = '';
  customSubtitle = '';

  async ngOnInit(): Promise<void> {
    await this.loadHeroImages();
    await this.loadCustomHeroText();
    
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.startImageRotation();
      }, 0);
    }
  }

  async loadHeroImages(): Promise<void> {
    try {
      await this.settingsService.getSettings(true);
      this.rotatingImages = this.settingsService.getHeroImages();
    } catch (error) {
      console.error('Error loading hero images:', error);
      this.rotatingImages = [];
    }
  }

  async loadCustomHeroText(): Promise<void> {
    try {
      const settings = await this.settingsService.getSettings();
      this.customImage = settings.homeHeroImage || '';
      this.customTitle = settings.homeHeroTitle || '';
      this.customSubtitle = settings.homeHeroSubtitle || '';
    } catch (error) {
      console.error('Error loading custom hero text:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private startImageRotation(): void {
    this.interval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.rotatingImages.length;
      this.cdr.detectChanges();
    }, 6000);
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
    this.cdr.detectChanges();
    if (this.interval) {
      clearInterval(this.interval);
      this.startImageRotation();
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
    this.cdr.detectChanges();
  }

  scrollToNextSection(): void {
    if (isPlatformBrowser(this.platformId)) {
      const heroSection = document.querySelector('.home-hero');
      if (heroSection) {
        const nextSection = heroSection.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }
}
