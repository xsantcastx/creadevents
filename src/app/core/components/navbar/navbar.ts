import { Component, EventEmitter, Output, signal, inject, PLATFORM_ID, HostListener, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { CartService } from '../../../shared/services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  @Output() toggleCart = new EventEmitter<void>();

  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly menuAbierto = signal(false);
  mobileProductsOpen = false;
  scrolled = false;
  
  // Mega menu state and controls
  showMega = false;
  private hideTimer: any;

  @ViewChild('mega') megaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('productsGroup') productsGroupRef!: ElementRef<HTMLDivElement>;
  
  readonly totalItems = toSignal(
    this.cartService.items$.pipe(
      map((items) => items.reduce((total, item) => total + item.cantidad, 0))
    ),
    { initialValue: 0 }
  );

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 8;
  }

  get logoSrc() {
    return this.scrolled ? '/assets/logo_topstone-dark.svg' : '/assets/logo_topstone.svg';
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
    // Clean up timer
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }

  // Mega menu hover controls with delay for stability
  openMega() {
    console.log('Opening mega menu');
    clearTimeout(this.hideTimer);
    this.showMega = true;
  }

  closeMegaDelayed() {
    console.log('Closing mega menu with delay');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      console.log('Hiding mega menu now');
      this.showMega = false;
    }, 140);
  }

  // Caret button toggles without affecting the Products link
  toggleMega(ev: MouseEvent) {
    console.log('Toggling mega menu via caret');
    ev.stopPropagation();
    this.showMega = !this.showMega;
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.productsGroupRef) return;
    const g = this.productsGroupRef.nativeElement;
    if (!g.contains(e.target as Node)) this.showMega = false;
  }

  // ESC to close
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') this.showMega = false;
  }

  activarCarrito(): void {
    this.toggleCart.emit();
  }

  alternarMenu(): void {
    this.menuAbierto.update((valor) => !valor);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
    this.mobileProductsOpen = false;
  }

  toggleMobileProductsMenu(): void {
    this.mobileProductsOpen = !this.mobileProductsOpen;
  }
}
