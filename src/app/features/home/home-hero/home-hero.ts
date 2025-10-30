import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SettingsService, HeroImage } from '../../../services/settings.service';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss'
})
export class HomeHeroComponent implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private platformId = inject(PLATFORM_ID);
  
  currentImageIndex = 0;
  autoPlay = true;
  private intervalId: any;
  
  rotatingImages: HeroImage[] = [];

  async ngOnInit() {
    console.log('🚀 HomeHero ngOnInit CALLED');
    await this.loadHeroImages();
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  /**
   * Load hero images from settings
   */
  async loadHeroImages() {
    try {
      const settings = await this.settingsService.getSettings(true);
      this.rotatingImages = this.settingsService.getHeroImages();
      
      console.log('✅ Loaded', this.rotatingImages.length, 'hero images');
    } catch (error) {
      console.error('Error loading hero images:', error);
      this.rotatingImages = [];
    }
  }

  startAutoPlay() {
    if (this.autoPlay) {
      this.intervalId = setInterval(() => {
        this.nextImage();
      }, 5000); // Change image every 5 seconds
    }
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleAutoPlay() {
    this.autoPlay = !this.autoPlay;
    if (this.autoPlay) {
      this.startAutoPlay();
    } else {
      this.stopAutoPlay();
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.rotatingImages.length;
  }

  previousImage() {
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.rotatingImages.length - 1 
      : this.currentImageIndex - 1;
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
    // Reset autoplay timer
    if (this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  getPrevIndex(): number {
    return this.currentImageIndex === 0 
      ? this.rotatingImages.length - 1 
      : this.currentImageIndex - 1;
  }

  getNextIndex(): number {
    return (this.currentImageIndex + 1) % this.rotatingImages.length;
  }
}
