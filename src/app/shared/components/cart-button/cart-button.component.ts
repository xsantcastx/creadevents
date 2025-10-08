import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <a
      routerLink="/cart"
      class="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span class="hidden sm:inline">{{ 'nav.cart' | translate }}</span>
      @if (count$ | async; as count) {
        @if (count > 0) {
          <span class="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full">
            {{ count }}
          </span>
        }
      }
    </a>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class CartButtonComponent {
  private cartService = inject(CartService);
  count$ = this.cartService.count$;
}
