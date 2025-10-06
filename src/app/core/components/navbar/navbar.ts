import { Component, EventEmitter, Output, signal, inject, PLATFORM_ID } from '@angular/core';
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
  showProductsMenu = false;
  mobileProductsOpen = false;
  isScrolled = false;
  
  readonly totalItems = toSignal(
    this.cartService.items$.pipe(
      map((items) => items.reduce((total, item) => total + item.cantidad, 0))
    ),
    { initialValue: 0 }
  );

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll() {
    this.isScrolled = window.scrollY > 20;
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
