import { Component, HostListener, inject, PLATFORM_ID, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { CartButtonComponent } from '../../../shared/components/cart-button/cart-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LanguageSelectorComponent, CartButtonComponent, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() toggleCart = new EventEmitter<void>();

  private platformId = inject(PLATFORM_ID);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  
  scrolled = false;
  mobileOpen = false;
  showMega = false;
  showUserMenu = false;
  hoverPreviewUrl = 'assets/productos/12mm/saint-laurent.jpg';
  
  // Auth state
  user$ = this.authService.user$;
  userProfile$ = this.authService.userProfile$;
  
  // Mega menu state and controls
  private hideTimer: any;

  @ViewChild('mega') megaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('productsGroup') productsGroupRef!: ElementRef<HTMLDivElement>;

  readonly totalItems = toSignal(
    this.cartService.count$,
    { initialValue: 0 }
  ) as () => number;
  
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

  ngOnDestroy() {
    // Clean up timer
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    // Only run in browser to avoid SSR issues
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled = window.scrollY > 8;
    }
  }

  // Mega menu hover controls with delay for stability
  openMega() {
    clearTimeout(this.hideTimer);
    this.showMega = true;
  }

  closeMegaDelayed() {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.showMega = false;
    }, 100);
  }

  closeMegaImmediate() {
    clearTimeout(this.hideTimer);
    this.showMega = false;
  }

  // Caret button toggles without affecting the Products link
  toggleMega(ev: MouseEvent) {
    ev.stopPropagation();
    this.showMega = !this.showMega;
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.productsGroupRef) return;
    const g = this.productsGroupRef.nativeElement;
    if (!g.contains(e.target as Node)) this.showMega = false;
    
    // Close user menu when clicking outside
    this.showUserMenu = false;
  }

  // Close when mouse leaves viewport
  @HostListener('document:mouseout', ['$event'])
  onDocMouseOut(e: MouseEvent) {
    if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === 'HTML') {
      this.showMega = false;
    }
  }

  // ESC to close
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.showMega = false;
      this.showUserMenu = false;
    }
  }

  activarCarrito(): void {
    this.toggleCart.emit();
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

  // User menu controls
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    console.log('Closing user menu');
    this.showUserMenu = false;
  }

  // Auth methods
  async logout(): Promise<void> {
    console.log('Logging out user');
    await this.authService.signOutUser();
    this.closeMobile();
    this.closeUserMenu();
  }

  // Support dual logo versions as per README specs
  get logoSrc() {
    return this.scrolled ? '/assets/topstone-mark-dark.svg' : '/assets/topstone-mark-light.svg';
  }
}