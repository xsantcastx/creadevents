import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss'
})
export class HomeHeroComponent implements OnInit, OnDestroy {
  currentImageIndex = 0;
  autoPlay = true;
  private intervalId: any;
  
  rotatingImages: CarouselImage[] = [
    {
      id: '1',
      url: '/assets/productos/antminer-s19.jpg',
      alt: 'Antminer S19 Pro Mining Setup',
      title: 'Antminer S19 Pro',
      description: 'Industry-leading hashrate with optimized efficiency'
    },
    {
      id: '2',
      url: '/assets/galeria/cocinas/cocina-1.jpg',
      alt: 'Professional Mining Farm',
      title: 'Enterprise Mining Solutions',
      description: 'Scalable infrastructure for maximum ROI'
    },
    {
      id: '3',
      url: '/assets/galeria/banos/bano-1.jpg',
      alt: 'Advanced Cooling Systems',
      title: 'Thermal Management',
      description: 'Advanced cooling for peak performance'
    },
    {
      id: '4',
      url: '/assets/productos/whatsminer-m30s.jpg',
      alt: 'WhatsMiner M30S+',
      title: 'WhatsMiner M30S+',
      description: 'Power-efficient mining at its finest'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
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
