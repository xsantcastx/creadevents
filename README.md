Navbar: click a Productos + mega-menú que no se cierra al bajar el mouse
src/app/components/navbar/navbar.component.ts
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'ts-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  scrolled = false;
  showMega = false;
  mobileOpen = false;
  private hideTimer: any;

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 8; }

  // Evita “parpadeo” del mega-menú al pasar del trigger al panel
  openMega() { clearTimeout(this.hideTimer); this.showMega = true; }
  closeMegaDelayed() { this.hideTimer = setTimeout(() => (this.showMega = false), 140); }

  get logoSrc() {
    return this.scrolled ? '/assets/logo_topstone-dark.svg' : '/assets/logo_topstone.svg';
  }

  onEsc(evt: KeyboardEvent) {
    if (evt.key === 'Escape') this.showMega = false;
  }
}

src/app/components/navbar/navbar.component.html
<header (keydown)="onEsc($event)"
  class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
  [class.bg-white/90]="scrolled"
  [class.text-neutral-900]="scrolled"
  [class.backdrop-blur]="scrolled"
  [class.text-white]="!scrolled"
>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <a routerLink="/" class="flex items-center gap-3">
        <img [src]="logoSrc" alt="TopStone" class="h-8" />
      </a>

      <!-- Toggle móvil -->
      <button class="md:hidden p-2 ring-1 rounded-lg"
              [class.ring-white/20]="!scrolled" [class.ring-neutral-200]="scrolled"
              (click)="mobileOpen = !mobileOpen" aria-label="Abrir menú">
        <div class="w-5 h-[2px] mb-1" [class.bg-white]="!scrolled" [class.bg-neutral-900]="scrolled"></div>
        <div class="w-5 h-[2px] mb-1" [class.bg-white]="!scrolled" [class.bg-neutral-900]="scrolled"></div>
        <div class="w-5 h-[2px]"     [class.bg-white]="!scrolled" [class.bg-neutral-900]="scrolled"></div>
      </button>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-8 font-sans text-sm">
        <a routerLink="/" class="hover:text-[var(--ts-accent)]">Home</a>

        <!-- Contenedor del trigger + panel -->
        <div class="relative"
             (mouseenter)="openMega()" (mouseleave)="closeMegaDelayed()">
          <!-- Importante: esto NAVEGA -->
          <a routerLink="/productos"
             class="hover:text-[var(--ts-accent)] relative inline-flex items-center gap-1
                    before:content-[''] before:absolute before:left-0 before:top-full
                    before:w-full before:h-3">
            Productos <span aria-hidden>▾</span>
          </a>

          <!-- Mega menú centrado al viewport y sin “hueco” -->
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
                  <!-- ... -->
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
                <img src="/assets/productos/12mm/saint-laurent.jpg" alt="Vista previa" class="w-full h-full object-cover"/>
              </div>
            </div>
          </div>
        </div>

        <a routerLink="/galeria" class="hover:text-[var(--ts-accent)]">Galería</a>
        <a routerLink="/datos-tecnicos" class="hover:text-[var(--ts-accent)]">Datos técnicos</a>
        <a routerLink="/contacto" class="hover:text-[var(--ts-accent)]">Contacto</a>
      </nav>
    </div>
  </div>

  <!-- Mobile overlay + drawer -->
  <div *ngIf="mobileOpen" class="md:hidden fixed inset-0 z-40 bg-black/60" (click)="mobileOpen = false"></div>
  <aside *ngIf="mobileOpen"
         class="md:hidden fixed top-0 right-0 z-50 w-[84%] max-w-sm h-full bg-white text-neutral-900 shadow-xl p-6 overflow-y-auto">
    <nav class="flex flex-col gap-4">
      <a routerLink="/" (click)="mobileOpen=false">Home</a>
      <details>
        <summary class="cursor-pointer">Productos</summary>
        <div class="mt-2 grid grid-cols-2 gap-3 text-sm">
          <a routerLink="/productos" (click)="mobileOpen=false" class="underline">Todos</a>
          <a routerLink="/productos/12mm" (click)="mobileOpen=false" class="underline">12mm</a>
          <a routerLink="/productos/15mm" (click)="mobileOpen=false" class="underline">15mm</a>
          <a routerLink="/productos/20mm" (click)="mobileOpen=false" class="underline">20mm</a>
        </div>
      </details>
      <a routerLink="/galeria" (click)="mobileOpen=false">Galería</a>
      <a routerLink="/datos-tecnicos" (click)="mobileOpen=false">Datos técnicos</a>
      <a routerLink="/contacto" (click)="mobileOpen=false">Contacto</a>
    </nav>
  </aside>
</header>


Puntos clave que arreglan tus síntomas:

Click en “Productos” ahora es un <a routerLink="/productos"> (antes era un <button>).

Sin pérdida de foco: el panel cuelga de top-full y añadimos un “puente” invisible (before:h-3) bajo el trigger + delay de cierre (140ms) para cruzar el hueco sin que desaparezca.

z-index alto (z-50) para que nada tape el mega-menú.

Extra: añade dos logos (/assets/logo_topstone.svg blanco y /assets/logo_topstone-dark.svg negro) para evitar “logo invisible” en el header blanco al hacer scroll.

2) Legibilidad en Galería y Datos técnicos (píldoras y subnav)

Crea utilidades en tu CSS global (Tailwind):

/* src/styles.css o globals.css */
@tailwind base; @tailwind components; @tailwind utilities;

@layer components {
  .pill { @apply inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ring-1 transition; }
  .pill-light { @apply bg-white/90 text-neutral-900 ring-neutral-200 backdrop-blur; }
  .pill-dark  { @apply bg-black/50 text-white ring-white/20 backdrop-blur; }
  .pill-active { @apply ring-[var(--ts-accent)] text-[var(--ts-accent)] bg-white; }

  .subnav {
    @apply sticky top-16 z-40 flex flex-wrap gap-2 items-center py-3;
  }
}

Ejemplo en Galería (galeria.component.html)
<section class="max-w-7xl mx-auto px-6">
  <div class="subnav">
    <a class="pill pill-light" routerLink="/galeria" [class.pill-active]="cat==='todas'">Todas</a>
    <a class="pill pill-light" routerLink="/galeria/cocinas" [class.pill-active]="cat==='cocinas'">Cocinas</a>
    <a class="pill pill-light" routerLink="/galeria/banos"   [class.pill-active]="cat==='banos'">Baños</a>
    <a class="pill pill-light" routerLink="/galeria/fachadas"[class.pill-active]="cat==='fachadas'">Fachadas</a>
    <a class="pill pill-light" routerLink="/galeria/industria"[class.pill-active]="cat==='industria'">Industria</a>
    <a class="pill pill-light" routerLink="/galeria/otros"   [class.pill-active]="cat==='otros'">Otros</a>
  </div>
  <!-- tu grid masonry aquí -->
</section>

“Navegación rápida” en Datos técnicos
<nav class="subnav">
  <a class="pill pill-dark" href="#acabados">Acabados</a>
  <a class="pill pill-dark" href="#fichas">Fichas técnicas</a>
  <a class="pill pill-dark" href="#packing">Packing</a>
  <a class="pill pill-dark" href="#bordes">Acabados de bordes</a>
  <a class="pill pill-dark" href="#fachada">Fijaciones en fachada</a>
</nav>


Notas de legibilidad:

Usa peso 600 para las etiquetas, tracking-wide si van en MAYÚSCULAS.

Si el fondo es fotográfico, prefiere pill-light (blanco/blur) para contrastar.

Mantén tamaño 14–15px (Tailwind text-sm) para chips; 16px (text-base) si están sobre imágenes muy cargadas.

3) Rutas de Productos (asegura navegación al listado)

Confirma que /productos tiene componente índice y no solo subrutas:

// src/app/pages/productos/productos.routes.ts
import { Routes } from '@angular/router';

export const PRODUCTOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./listado/listado.component').then(m => m.ListadoComponent) },
  { path: ':grosor', children: [
      { path: '', loadComponent: () => import('./grosor/grosor.component').then(m => m.GrosorComponent) },
      { path: ':slug', loadComponent: () => import('./detalle/detalle.component').then(m => m.DetalleComponent) },
    ] },
];


Y en el header asegúrate de usar routerLink="/productos" (como en el parche de arriba).

4) Micro-mejoras de UX/estilo que elevan el look

Focus visible: añade focus:outline-none focus:ring-2 focus:ring-[var(--ts-accent)] a los enlaces del header y chips para accesibilidad.

Active state en header:

<a routerLink="/galeria" routerLinkActive="text-[var(--ts-accent)]" [routerLinkActiveOptions]="{exact:false}">Galería</a>


Sombra y borde sutil para el mega-menú: shadow-xl ring-1 ring-neutral-200 (ya incluido).

Transiciones coherentes: duration-200 ease-out en hovers y paneles.

Z-index: header z-50, mega-menú dentro con z-50 para evitar que se tape al hacer scroll sobre el hero.

5) Checklist rápido de verificación

 Click en Productos te lleva a /productos.

 Pasar del trigger al panel no cierra el mega-menú (gracias al puente + delay).

 Galería: chips con pill-light (se leen siempre).

 Datos técnicos: “Navegación rápida” con pill-dark sobre fondos oscuros.

 routerLinkActive pinta activo en header/subnav.

 Dos logos (claro/oscuro) para no desaparecer sobre blanco.