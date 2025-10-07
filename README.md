1) Mega-menu: make hover continuous (no flicker)
Replace the “Productos” block with this

Make sure trigger + panel are inside the same .group.relative and that the panel uses group-hover + an invisible bridge under the trigger.

<!-- Productos + Mega menu -->
<div class="relative group">
  <!-- Trigger (still navigates to /productos) -->
  <a routerLink="/productos"
     class="relative inline-flex items-center gap-1 hover:text-[var(--ts-accent)]
            before:content-[''] before:absolute before:left-0 before:top-full
            before:w-full before:h-5">
    Productos <span aria-hidden>▾</span>
  </a>

  <!-- Panel -->
  <div
    class="pointer-events-none group-hover:pointer-events-auto
           invisible opacity-0 group-hover:visible group-hover:opacity-100
           transition-opacity duration-150
           absolute left-1/2 -translate-x-1/2 top-full pt-5 z-[80]">
    <div class="w-[min(100vw-2rem,960px)] p-6 rounded-2xl bg-white text-neutral-900
                shadow-xl ring-1 ring-neutral-200 grid grid-cols-4 gap-6">
      <div>
        <h4 class="font-semibold mb-3">12mm (160×320cm)</h4>
        <ul class="space-y-2">
          <li><a routerLink="/productos/12mm/saint-laurent" class="hover:text-[var(--ts-accent)]">Saint Laurent</a></li>
          <li><a routerLink="/productos/12mm/black-gold" class="hover:text-[var(--ts-accent)]">Black Gold</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-3">15mm (160×320cm)</h4>
        <!-- items... -->
      </div>
      <div>
        <h4 class="font-semibold mb-3">20mm (160×320cm)</h4>
        <!-- items... -->
      </div>
      <div class="rounded-xl overflow-hidden bg-neutral-100">
        <img src="/assets/productos/12mm/saint-laurent.jpg" alt="Vista previa" class="w-full h-full object-cover">
      </div>
    </div>
  </div>
</div>

Important parent fixes (do these too)

Give the header a high stacking context and no clipping:

<header class="fixed inset-x-0 top-0 z-[90]"> <!-- remove any overflow-hidden here -->


Make sure no ancestor of the mega-panel has overflow-hidden (common cause of “disappears/clipped”).

If you previously added (mouseenter)/(mouseleave) timers in TS, remove them—the CSS above is enough.

2) “Galería” pill looks gray: unify its style with “Datos técnicos”

Create two small utility classes (component layer) and apply them to all sub-nav pills.

In styles.css (or your Tailwind entry)
@layer components {
  .ts-tab {
    @apply inline-flex items-center px-3 py-1.5 rounded-full
           text-sm font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200;
  }
  .ts-tab-active {
    @apply bg-neutral-900 text-white hover:bg-neutral-900;
  }
}

In the sub-nav (where “Galería” and “Datos técnicos” render)
<nav class="flex flex-wrap gap-2">
  <a routerLink="/galeria"
     routerLinkActive="ts-tab-active"
     [routerLinkActiveOptions]="{ exact: true }"
     class="ts-tab">Galería</a>

  <a routerLink="/datos-tecnicos"
     routerLinkActive="ts-tab-active"
     class="ts-tab">Datos técnicos</a>
</nav>


If you don’t want to add the utility classes, you can inline the same @apply styles directly on the anchors for a quick test.

3) Two tiny polish tweaks (optional but helpful)

Ensure nav text color flips on scroll so links never look washed out:

// navbar.component.ts
scrolled = false;
@HostListener('window:scroll') onScroll(){ this.scrolled = window.scrollY > 8; }

<nav [class.text-white]="!scrolled" [class.text-neutral-900]="scrolled"> ... </nav>


Lock product card images to one ratio to prevent grid jump:

<img class="w-full aspect-[4/3] object-cover" ...>