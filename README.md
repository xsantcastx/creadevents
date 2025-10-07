Fast UX wins

Reduce hero height a bit on desktop so “Nuestras Colecciones” peeks above the fold (encourages scroll).

Make the top navbar switch to a white background + dark text after scrolling ~8–12px; also swap to a dark logo so it doesn’t “disappear” over white.

In Galería / Datos técnicos, increase contrast for the small pills/sub-nav and bump font-weight to medium for readability.

Unify card image aspect ratios (e.g., aspect-[4/3] + object-cover) so grids don’t jump.

Add subtle hover elevation on cards (shadow-md hover:shadow-lg transition).

Mega-menu bug (disappears when moving cursor)

This usually happens because there’s a tiny gap between the “Productos” trigger and the panel, or the panel isn’t a child of the hovered container. Fix by:

Wrapping trigger + panel in a single relative container.

Adding a tiny invisible “bridge” under the trigger so the mouse can cross the gap.

Using a small close delay on mouseleave, and cancelling it on mouseenter of the panel.

Giving the panel a high z-index.

Angular implementation (drop-in)

src/app/components/navbar/navbar.component.ts

import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'ts-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  scrolled = false;
  showMega = false;
  mobileOpen = false;
  private hideTimer: any;

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 8;
  }

  openMega() {
    clearTimeout(this.hideTimer);
    this.showMega = true;
  }

  closeMegaDelayed() {
    this.hideTimer = setTimeout(() => (this.showMega = false), 140);
  }

  get logoSrc() {
    return this.scrolled ? '/assets/logo_topstone-dark.svg' : '/assets/logo_topstone.svg';
  }

  onEsc(evt: KeyboardEvent) {
    if (evt.key === 'Escape') this.showMega = false;
  }
}


src/app/components/navbar/navbar.component.html

<header class="fixed inset-x-0 top-0 z-40">
  <div class="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between"
       [class.bg-transparent]="!scrolled"
       [class.bg-white]="scrolled">
    <!-- Logo -->
    <a routerLink="/" class="flex items-center gap-2">
      <img [src]="logoSrc" alt="TopStone" class="h-8 w-auto" />
    </a>

    <!-- Mobile toggle -->
    <button class="md:hidden p-2 ring-1 rounded-lg"
            [class.ring-white/20]="!scrolled"
            [class.ring-neutral-200]="scrolled"
            (click)="mobileOpen = !mobileOpen"
            aria-label="Abrir menú">
      <div class="w-5 h-[2px] mb-1" [class.bg-white]="!scrolled" [class.bg-neutral-900]="scrolled"></div>
      <div class="w-5 h-[2px] mb-1" [class.bg-white]="!scrolled" [class.bg-neutral-900]="scrolled"></div>
      <div class="w-5 h-[2px]"     [class.bg-white]="!scrolled" [class.bg-neutral-900]="scrolled"></div>
    </button>

    <!-- Desktop nav -->
    <nav class="hidden md:flex items-center gap-8 font-sans text-sm"
         [class.text-white]="!scrolled"
         [class.text-neutral-900]="scrolled"
         (keydown.escape)="onEsc($event)">

      <a routerLink="/" class="hover:text-[var(--ts-accent)]">Home</a>

      <!-- Trigger + panel share the same relative container -->
      <div class="relative"
           (mouseenter)="openMega()" (mouseleave)="closeMegaDelayed()">
        <!-- IMPORTANT: this link still navigates to /productos -->
        <a routerLink="/productos"
           class="hover:text-[var(--ts-accent)] relative inline-flex items-center gap-1
                  before:content-[''] before:absolute before:left-0 before:top-full
                  before:w-full before:h-3">
          Productos <span aria-hidden>▾</span>
        </a>

        <!-- Mega menu centered, no gap thanks to pt-3 and the invisible 'bridge' above -->
        <div *ngIf="showMega"
             class="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
          <div class="w-[min(100vw-2rem,960px)] p-6 rounded-2xl bg-white text-neutral-900 shadow-xl
                      grid grid-cols-4 gap-6 ring-1 ring-neutral-200"
               (mouseenter)="openMega()" (mouseleave)="closeMegaDelayed()">

            <div>
              <h4 class="font-semibold mb-3">12mm (160×320cm)</h4>
              <ul class="space-y-2">
                <li><a routerLink="/productos/12mm/saint-laurent" class="hover:text-[var(--ts-accent)]">Saint Laurent</a></li>
                <li><a routerLink="/productos/12mm/black-gold" class="hover:text-[var(--ts-accent)]">Black Gold</a></li>
                <!-- más items -->
              </ul>
            </div>

            <div>
              <h4 class="font-semibold mb-3">15mm (160×320cm)</h4>
              <!-- ... -->
            </div>

            <div>
              <h4 class="font-semibold mb-3">20mm (160×320cm)</h4>
              <!-- ... -->
            </div>

            <div class="rounded-xl overflow-hidden bg-neutral-100">
              <img src="/assets/productos/12mm/saint-laurent.jpg" alt="Vista previa"
                   class="w-full h-full object-cover">
            </div>
          </div>
        </div>
      </div>

      <a routerLink="/galeria" class="hover:text-[var(--ts-accent)]">Galería</a>
      <a routerLink="/datos-tecnicos" class="hover:text-[var(--ts-accent)]">Datos técnicos</a>
      <a routerLink="/contacto" class="hover:text-[var(--ts-accent)]">Contacto</a>
    </nav>
  </div>

  <!-- Mobile drawer -->
  <div class="md:hidden" *ngIf="mobileOpen">
    <div class="bg-white text-neutral-900 border-t">
      <a class="block px-4 py-3 border-b" routerLink="/" (click)="mobileOpen=false">Home</a>
      <a class="block px-4 py-3 border-b" routerLink="/productos" (click)="mobileOpen=false">Productos</a>
      <a class="block px-4 py-3 border-b" routerLink="/galeria" (click)="mobileOpen=false">Galería</a>
      <a class="block px-4 py-3" routerLink="/datos-tecnicos" (click)="mobileOpen=false">Datos técnicos</a>
      <a class="block px-4 py-3" routerLink="/contacto" (click)="mobileOpen=false">Contacto</a>
    </div>
  </div>
</header>


Why this fixes the flicker

The panel is a child of the same relative container as the trigger, so hover state is continuous.

The before:h-3 pseudo-element creates a tiny invisible strip under “Productos,” so there’s no dead zone while moving the cursor down.

closeMegaDelayed() adds ~140 ms grace so minor mouse wobbles don’t close it.

z-50 ensures nothing overlays the panel.

Style tweaks you can sprinkle in

Make pills/sub-nav easier to read:

<a class="inline-flex items-center px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-800
           hover:bg-neutral-200 font-medium text-sm">12mm</a>


Card hover:

<article class="rounded-xl overflow-hidden shadow-sm ring-1 ring-neutral-200
                hover:shadow-md hover:ring-neutral-300 transition">


Product grid images:

<img class="w-full aspect-[4/3] object-cover" ...>