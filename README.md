1) Mega-menu that doesn’t disappear

This version avoids JS timing glitches by using pure CSS “group-hover”, removes the hover “gap”, and ensures the panel sits above everything.

navbar.component.html

<!-- Wrap trigger + panel in the same relative group -->
<div class="relative group" >
  <!-- The link still navigates to /productos -->
  <a routerLink="/productos"
     class="relative inline-flex items-center gap-1 hover:text-[var(--ts-accent)]
            before:content-[''] before:absolute before:left-0 before:top-full
            before:w-full before:h-5">
    Productos <span aria-hidden>▾</span>
  </a>

  <!-- Mega panel -->
  <div
    class="pointer-events-none group-hover:pointer-events-auto
           invisible opacity-0 group-hover:visible group-hover:opacity-100
           transition-opacity duration-150
           absolute left-1/2 -translate-x-1/2 top-full pt-5 z-[60]">
    <div class="w-[min(100vw-2rem,960px)] p-6 rounded-2xl bg-white text-neutral-900
                shadow-xl ring-1 ring-neutral-200 grid grid-cols-4 gap-6">
      <!-- col 1 -->
      <div>
        <h4 class="font-semibold mb-3">12mm (160×320cm)</h4>
        <ul class="space-y-2">
          <li><a routerLink="/productos/12mm/saint-laurent" class="hover:text-[var(--ts-accent)]">Saint Laurent</a></li>
          <li><a routerLink="/productos/12mm/black-gold" class="hover:text-[var(--ts-accent)]">Black Gold</a></li>
        </ul>
      </div>
      <!-- col 2, 3 ... -->
      <div class="rounded-xl overflow-hidden bg-neutral-100">
        <img src="/assets/productos/12mm/saint-laurent.jpg" alt="Vista previa" class="w-full h-full object-cover">
      </div>
    </div>
  </div>
</div>


Important parent fixes (common culprits)

Make sure no ancestor of the panel has overflow:hidden (except intentionally). If your <header> or a container has it, remove it or scope it.

Keep the nav high: e.g. <header class="fixed inset-x-0 top-0 z-[70]">.

If you previously bound (mouseenter)/(mouseleave) with timers, you can remove that logic now.

2) “Galería” sub-nav color (match “Datos técnicos”)

Unify the tab/pill styles and make the active route consistent.

tabs.component.html (or wherever those pills live)

<nav class="flex flex-wrap gap-2">
  <a routerLink="/galeria"
     routerLinkActive="ts-tab-active"
     [routerLinkActiveOptions]="{ exact: true }"
     class="ts-tab">Galería</a>

  <a routerLink="/datos-tecnicos"
     routerLinkActive="ts-tab-active"
     class="ts-tab">Datos técnicos</a>
</nav>


Global styles (Tailwind layer)

/* tailwind.css or styles.css */
@layer components {
  .ts-tab {
    @apply inline-flex items-center px-3 py-1.5 rounded-full
           text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200;
  }
  .ts-tab-active {
    @apply bg-neutral-900 text-white hover:bg-neutral-900;
  }
}


If you don’t have a shared tabs component, paste those classes directly on the Galería pills so they match Datos técnicos.

3) Small polish while you’re here

Set product card images to a fixed ratio so grids don’t jump:

<img class="w-full aspect-[4/3] object-cover" ...>


Ensure the nav flips to dark logo + dark text on scroll for contrast:

// navbar.component.ts
scrolled = false;
@HostListener('window:scroll') onScroll(){ this.scrolled = window.scrollY > 8; }
get logoSrc(){ return this.scrolled ? '/assets/logo_topstone-dark.svg' : '/assets/logo_topstone.svg'; }

<!-- header text colors -->
<nav [class.text-white]="!scrolled" [class.text-neutral-900]="scrolled">...</nav>