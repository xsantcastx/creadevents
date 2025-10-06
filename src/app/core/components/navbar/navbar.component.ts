import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private platformId = inject(PLATFORM_ID);
  
  scrolled = false;
  mobileOpen = false;
  showMega = false;
  hoverPreviewUrl = 'assets/productos/12mm/saint-laurent.jpg';
  
  // Fallback product data for mega menu (matches README specifications)
  productos12mm = [
    { name: 'Saint Laurent', slug: 'saint-laurent' },
    { name: 'Black Gold', slug: 'black-gold' },
    { name: 'Arenaria Ivory', slug: 'arenaria-ivory' },
    { name: 'Rapolano', slug: 'rapolano' },
    { name: 'Konkrete', slug: 'konkrete' },
    { name: 'Bercy Terra', slug: 'bercy-terra' },
    { name: 'Limestone Ivory', slug: 'limestone-ivory' },
    { name: 'Crystal Clear', slug: 'crystal-clear' },
    { name: 'Taj Mahal', slug: 'taj-mahal' },
    { name: 'Apollo White', slug: 'apollo-white' },
    { name: 'Calacatta Gold', slug: 'calacatta-gold' },
    { name: 'Patagonia', slug: 'patagonia' }
  ];

  productos15mm = [
    { name: 'Statuario Elegance', slug: 'statuario-elegance' },
    { name: 'Laponia Black', slug: 'laponia-black' },
    { name: 'Patagonia Natural', slug: 'patagonia-natural' }
  ];

  productos20mm = [
    { name: 'Saint Laurent', slug: 'saint-laurent-20' },
    { name: 'Black Gold', slug: 'black-gold-20' },
    { name: 'Arenaria Ivory', slug: 'arenaria-ivory-20' },
    { name: 'Limestone Ivory', slug: 'limestone-ivory-20' },
    { name: 'Crystal Clear', slug: 'crystal-clear-20' },
    { name: 'Taj Mahal', slug: 'taj-mahal-20' },
    { name: 'Apollo White', slug: 'apollo-white-20' },
    { name: 'Calacatta Gold', slug: 'calacatta-gold-20' },
    { name: 'Patagonia', slug: 'patagonia-20' }
  ];

  @HostListener('window:scroll')
  onScroll() {
    // Only run in browser to avoid SSR issues
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled = window.scrollY > 8;
    }
  }

  onProductHover(grosor: string, slug: string) {
    this.hoverPreviewUrl = `assets/productos/${grosor}/${slug}.jpg`;
  }

  closeMobile() {
    this.mobileOpen = false;
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  // Support dual logo versions as per README specs
  get logoSrc() {
    return this.scrolled ? 'assets/Logo.jpeg' : 'assets/Logo.jpeg';
  }
}