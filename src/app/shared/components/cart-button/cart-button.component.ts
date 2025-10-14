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
      class="cart-link"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span class="hidden sm:inline">{{ 'nav.cart' | translate }}</span>
      @if (count$ | async; as count) {
        @if (count > 0) {
          <span class="badge">
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

    .cart-link {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.9rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 0.9rem;
      background: var(--bg-elevated);
      color: var(--text);
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }

    .cart-link:hover {
      background: color-mix(in srgb, var(--text) 6%, var(--bg-elevated));
    }

    .cart-link svg {
      width: 1.25rem;
      height: 1.25rem;
      stroke: currentColor;
    }

    :host-context(.text-white) .cart-link {
      background: #1f2937;
      color: #f8fafc;
      border-color: color-mix(in srgb, #1f2937 40%, #f8fafc);
      box-shadow: 0 18px 32px -22px rgba(17, 24, 39, 0.35);
    }

    :host-context(.text-white) .cart-link:hover {
      background: #223042;
    }

    .cart-link .badge {
      position: absolute;
      top: -0.45rem;
      right: -0.45rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
      background: #dc2626;
      border-radius: 9999px;
    }
  `]
})
export class CartButtonComponent {
  private cartService = inject(CartService);
  count$ = this.cartService.count$;
}
