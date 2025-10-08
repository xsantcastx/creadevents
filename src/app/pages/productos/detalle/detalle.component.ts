import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DataService, Producto } from '../../../core/services/data.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product';
import { ImageLightboxComponent } from '../../../shared/components/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ImageLightboxComponent],
  template: `
    <section *ngIf="producto" class="bg-ts-paper min-h-screen">
      <!-- Breadcrumb Navigation -->
      <div class="max-w-7xl mx-auto px-6 pt-8">
        <nav class="mb-6">
          <ol class="flex items-center space-x-2 text-sm text-neutral-600">
            <li><a routerLink="/" class="hover:text-ts-accent">Home</a></li>
            <li>/</li>
            <li><a routerLink="/productos" class="hover:text-ts-accent">Productos</a></li>
            <li>/</li>
            <li><a [routerLink]="['/productos', grosor]" class="hover:text-ts-accent">{{grosor}}</a></li>
            <li>/</li>
            <li class="text-ts-accent font-medium">{{producto.nombre}}</li>
          </ol>
        </nav>
      </div>

      <!-- Product Detail -->
      <div class="max-w-7xl mx-auto px-6 pb-16">
        <div class="grid lg:grid-cols-2 gap-12 mb-16">
          <!-- Product Image Gallery -->
          <div>
            <div class="aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-lg mb-4 cursor-zoom-in"
                 (click)="openLightbox()">
              <img [src]="producto.cover" 
                   [alt]="producto.nombre"
                   class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                   loading="lazy"/>
            </div>
            
            <!-- Additional images placeholder -->
            <div class="grid grid-cols-4 gap-2">
              <div class="aspect-square rounded-lg bg-neutral-200 opacity-60"></div>
              <div class="aspect-square rounded-lg bg-neutral-200 opacity-60"></div>
              <div class="aspect-square rounded-lg bg-neutral-200 opacity-60"></div>
              <div class="aspect-square rounded-lg bg-neutral-200 opacity-60"></div>
            </div>
          </div>
          
          <!-- Product Information -->
          <div>
            <h1 class="font-serif text-4xl lg:text-5xl text-ts-bg mb-4">{{producto.nombre}}</h1>
            <p class="text-xl text-neutral-600 mb-2">{{producto.medida}} · {{producto.grosor}}</p>
            <p class="text-lg text-ts-accent font-medium mb-8">Superficie porcelánica de gran formato</p>
            
            <div class="prose max-w-none mb-8" *ngIf="producto.descripcion">
              <p class="text-neutral-700 leading-relaxed text-lg">{{producto.descripcion}}</p>
            </div>
            
            <!-- Applications -->
            <div class="mb-8" *ngIf="producto.aplicaciones && producto.aplicaciones.length > 0">
              <h3 class="font-serif text-xl text-ts-bg mb-4">Aplicaciones recomendadas</h3>
              <div class="flex flex-wrap gap-3">
                @for (aplicacion of producto.aplicaciones; track aplicacion) {
                  <span class="px-4 py-2 bg-ts-accent/10 text-ts-accent rounded-xl font-medium">
                    {{aplicacion}}
                  </span>
                }
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                (click)="addToCart()"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ts-accent text-black rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ 'products.addToCart' | translate }}
              </button>
              
              <a href="assets/fichas/topstone-ficha-general.pdf" 
                 target="_blank"
                 class="inline-flex items-center justify-center gap-2 px-8 py-4 ring-2 ring-ts-accent text-ts-accent hover:bg-ts-accent hover:text-black rounded-full font-semibold transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ 'technical.sections.datasheets' | translate }}
              </a>
            </div>

            <div class="mb-8">
              <a routerLink="/contacto" 
                 class="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto ring-2 ring-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-full font-semibold transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.793-.793L3 21l1.793-6.207A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z"></path>
                </svg>
                {{ 'nav.contact' | translate }}
              </a>
            </div>

            <!-- Quick Navigation -->
            <div class="flex items-center gap-4 text-sm">
              <button (click)="goBack()" 
                      class="flex items-center gap-2 text-neutral-600 hover:text-ts-accent transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver a {{grosor}}
              </button>
            </div>
          </div>
        </div>

        <!-- Specifications Table -->
        <div class="mb-16">
          <h2 class="font-serif text-3xl text-ts-bg mb-8 text-center">Especificaciones técnicas</h2>
          
          <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <table class="w-full">
              <tbody class="divide-y divide-neutral-100">
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900 w-1/3">Medida</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">{{producto.medida}}</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Grosor</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">{{producto.grosor}}</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Material</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">Porcelánico gran formato</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Acabado</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">Mate / Pulido</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Absorción de agua</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">≤ 0,5%</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Resistencia a la abrasión</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">Clase 4</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Resistencia a químicos</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">Alta</td>
                </tr>
                <tr class="hover:bg-neutral-50">
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900">Resistencia al fuego</td>
                  <td class="px-6 py-4 text-sm text-neutral-700">Clase A1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Related Products -->
        <div *ngIf="productosRelacionados.length > 0">
          <h2 class="font-serif text-3xl text-ts-bg mb-8 text-center">Productos relacionados</h2>
          
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (relacionado of productosRelacionados; track relacionado.slug) {
              <article class="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                <div class="aspect-[4/3] overflow-hidden">
                  <img [src]="relacionado.cover" 
                       [alt]="relacionado.nombre"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       loading="lazy"/>
                </div>
                <div class="p-6">
                  <h3 class="font-serif text-xl text-ts-bg mb-2">{{relacionado.nombre}}</h3>
                  <p class="text-sm text-neutral-600 mb-4">{{relacionado.medida}} · {{relacionado.grosor}}</p>
                  <a [routerLink]="['/productos', relacionado.grosor, relacionado.slug]" 
                     class="text-ts-accent hover:underline font-medium">
                    Ver detalles →
                  </a>
                </div>
              </article>
            }
          </div>
        </div>
      </div>
    </section>
    
    <!-- Error State -->
    <div *ngIf="!producto && !loading" class="max-w-7xl mx-auto px-6 py-16 text-center">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h2 class="font-serif text-2xl text-ts-bg mb-4">Producto no encontrado</h2>
      <p class="text-neutral-600 mb-6">El producto que buscas no está disponible o ha sido descontinuado.</p>
      <a routerLink="/productos" 
         class="inline-block px-8 py-4 bg-ts-accent text-black rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
        Ver todos los productos
      </a>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="max-w-7xl mx-auto px-6 py-16 text-center">
      <div class="w-16 h-16 mx-auto mb-6 border-4 border-ts-accent/30 border-t-ts-accent rounded-full animate-spin"></div>
      <p class="text-neutral-600">Cargando producto...</p>
    </div>

    <!-- Image Lightbox -->
    <app-image-lightbox
      [imageUrl]="producto?.cover || ''"
      [altText]="producto?.nombre || ''"
      [(isOpen)]="lightboxOpen"
    />
  `
})
export class DetalleComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  producto: Producto | undefined;
  productosRelacionados: Producto[] = [];
  grosor = '';
  loading = true;
  lightboxOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.grosor = this.route.snapshot.paramMap.get('grosor') || '';
    const slug = this.route.snapshot.paramMap.get('slug');
    
    if (slug) {
      this.loadProducto(slug);
    } else {
      this.loading = false;
    }
  }

  private loadProducto(slug: string) {
    // Only load from service if in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.dataService.getProductos().subscribe({
        next: (data) => {
          this.producto = this.dataService.getProductoBySlug(data.items, slug);
          if (this.producto) {
            this.loadProductosRelacionados(data.items);
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          console.log('Error loading product details');
        }
      });
    } else {
      // Basic SSR fallback
      this.loading = false;
    }
  }

  private loadProductosRelacionados(todosLosProductos: Producto[]) {
    if (!this.producto) return;
    
    // Get other products from the same thickness
    this.productosRelacionados = todosLosProductos
      .filter(p => p.grosor === this.producto!.grosor && p.slug !== this.producto!.slug)
      .slice(0, 3);
  }

  goBack() {
    if (this.grosor) {
      this.router.navigate(['/productos', this.grosor]);
    } else {
      this.router.navigate(['/productos']);
    }
  }

  openLightbox() {
    this.lightboxOpen = true;
  }

  addToCart() {
    if (!this.producto) return;
    
    const product: Product = {
      id: `${this.producto.grosor}-${this.producto.slug}`,
      name: this.producto.nombre,
      slug: this.producto.slug,
      grosor: this.producto.grosor as '12mm'|'15mm'|'20mm',
      size: this.producto.medida,
      imageUrl: this.producto.cover,
      sku: this.producto.slug
    };
    
    this.cartService.add(product, 1);
  }
}