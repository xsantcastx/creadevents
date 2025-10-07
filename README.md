Yes—let’s rebuild the navbar so it’s bullet-proof. This version guarantees:

Clicking Productos always navigates to /productos

Hover OR the little caret button opens a sticky mega-menu (no flicker)

Keyboard + Escape support

No “dead gap”, no clipping, no overlay blocking clicks

Paste these three files (or adapt) into feature/font_fix.

1) src/app/components/nav/nav.component.ts
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'ts-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  showMega = false;
  private hideTimer: any;

  @ViewChild('mega') megaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('productsGroup') productsGroupRef!: ElementRef<HTMLDivElement>;

  // Hover open/close with a small delay for stability
  openMega() {
    clearTimeout(this.hideTimer);
    this.showMega = true;
  }
  closeMegaDelayed() {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => (this.showMega = false), 140);
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
  }

  // ESC to close
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') this.showMega = false;
  }
}

2) src/app/components/nav/nav.component.html
<header class="fixed inset-x-0 top-0 z-[120] overflow-visible bg-white/90 backdrop-blur-md">
  <div class="mx-auto max-w-7xl px-4">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center gap-2">
        <img src="/assets/logo_topstone-dark.svg" alt="TopStone" class="h-8 w-auto">
      </a>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-900">
        <a routerLink="/" routerLinkActive="text-[var(--ts-accent,#B08968)]" class="hover:text-[var(--ts-accent,#B08968)]">Home</a>

        <!-- Productos: link + caret button (separate), with rock-solid hover group -->
        <div #productsGroup class="relative"
             (mouseenter)="openMega()" (mouseleave)="closeMegaDelayed()">
          <div class="inline-flex items-center gap-1">
            <!-- IMPORTANT: This link is clean (no click handlers) so it ALWAYS navigates -->
            <a routerLink="/productos"
               class="hover:text-[var(--ts-accent,#B08968)]">Productos</a>

            <!-- Caret only controls the panel; doesn't interfere with link clicks -->
            <button type="button"
                    class="p-1 rounded-md ring-1 ring-transparent hover:ring-neutral-300"
                    [attr.aria-expanded]="showMega" aria-haspopup="true"
                    (click)="toggleMega($event)">
              <svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true">
                <path d="M5 7l5 6 5-6" fill="currentColor"></path>
              </svg>
            </button>
          </div>

          <!-- Invisible bridge (prevents hover gap between trigger and panel) -->
          <span aria-hidden class="block absolute left-0 top-full h-4 w-full"></span>

          <!-- Mega panel -->
          <div #mega
               class="absolute left-1/2 -translate-x-1/2 top-full mt-4 z-[110]"
               [class.hidden]="!showMega">
            <div class="w-[min(100vw-2rem,960px)] grid grid-cols-4 gap-6
                        rounded-2xl bg-white text-neutral-900 shadow-xl ring-1 ring-neutral-200 p-6"
                 role="menu" aria-label="Productos">
              <div>
                <h4 class="font-semibold mb-3">12mm (160×320cm)</h4>
                <ul class="space-y-2">
                  <li><a routerLink="/productos/12mm/saint-laurent" class="hover:text-[var(--ts-accent,#B08968)]">Saint Laurent</a></li>
                  <li><a routerLink="/productos/12mm/black-gold" class="hover:text-[var(--ts-accent,#B08968)]">Black Gold</a></li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold mb-3">15mm (160×320cm)</h4>
                <ul class="space-y-2">
                  <li><a routerLink="/productos/15mm/carrara" class="hover:text-[var(--ts-accent,#B08968)]">Carrara</a></li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold mb-3">20mm (160×320cm)</h4>
                <ul class="space-y-2">
                  <li><a routerLink="/productos/20mm/onyx" class="hover:text-[var(--ts-accent,#B08968)]">Onyx</a></li>
                </ul>
              </div>
              <div class="rounded-xl overflow-hidden bg-neutral-100">
                <img src="/assets/productos/12mm/saint-laurent.jpg" alt="Vista previa" class="w-full h-full object-cover">
              </div>
            </div>
          </div>
        </div>

        <a routerLink="/galeria" routerLinkActive="text-[var(--ts-accent,#B08968)]" class="hover:text-[var(--ts-accent,#B08968)]">Galería</a>
        <a routerLink="/datos-tecnicos" routerLinkActive="text-[var(--ts-accent,#B08968)]" class="hover:text-[var(--ts-accent,#B08968)]">Datos técnicos</a>
        <a routerLink="/contacto" routerLinkActive="text-[var(--ts-accent,#B08968)]" class="hover:text-[var(--ts-accent,#B08968)]">Contacto</a>
      </nav>

      <!-- Keep/adjust your mobile menu separately -->
      <button class="md:hidden p-2 rounded-lg ring-1 ring-neutral-300" aria-label="Menú">☰</button>
    </div>
  </div>
</header>

3) src/styles.css (add the accent token + make sure nothing clips)
:root { --ts-accent: #B08968; }
/* DO NOT CLIP THE HEADER */
header { overflow: visible !important; }

Important checks (do these if you still see issues)

Routes: confirm you have a route for /productos (or change the link to the actual path).

No overlay blocking the header: remove any full-width absolute/fixed element at the top that might catch clicks. If you need it, add pointer-events:none to that overlay.

No overflow-hidden on header ancestors. If a hero section needs clipping, put overflow-hidden on the hero content wrapper, not on <header> or its parents.

Z-index: header uses z-[120]. Make sure nothing else sits higher.