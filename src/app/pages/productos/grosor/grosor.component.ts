import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, Producto } from '../../../core/services/data.service';

@Component({
  selector: 'app-grosor',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-16">
      <!-- Header Section -->
      <div class="mb-12">
        <nav class="mb-6">
          <ol class="flex items-center space-x-2 text-sm text-neutral-600">
            <li><a routerLink="/" class="hover:text-ts-accent">Home</a></li>
            <li>/</li>
            <li><a routerLink="/productos" class="hover:text-ts-accent">Productos</a></li>
            <li>/</li>
            <li class="text-ts-accent font-medium">{{grosor}}</li>
          </ol>
        </nav>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-4xl lg:text-5xl text-ts-bg mb-4">
              Colección {{grosor}}
            </h1>
            <p class="text-xl text-neutral-600 max-w-2xl">
              Superficies porcelánicas de gran formato {{medidaInfo}} perfectas para 
              {{aplicacionesInfo}}
            </p>
          </div>
          
          <!-- Filter/Sort Controls -->
          <div class="hidden lg:flex items-center gap-4">
            <div class="flex bg-neutral-100 rounded-full p-1">
              <button 
                [class.bg-white]="viewMode === 'grid'"
                [class.shadow-sm]="viewMode === 'grid'"
                (click)="viewMode = 'grid'"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all">
                Grid
              </button>
              <button 
                [class.bg-white]="viewMode === 'list'"
                [class.shadow-sm]="viewMode === 'list'"
                (click)="viewMode = 'list'"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all">
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Thickness Navigation Tabs -->
      <div class="flex gap-2 mb-12 overflow-x-auto pb-2">
        <a routerLink="/productos/12mm" 
           [class.bg-ts-accent]="grosor === '12mm'"
           [class.text-black]="grosor === '12mm'"
           [class.bg-neutral-100]="grosor !== '12mm'"
           class="px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors hover:bg-ts-accent hover:text-black">
          12mm (160×320cm)
        </a>
        <a routerLink="/productos/15mm" 
           [class.bg-ts-accent]="grosor === '15mm'"
           [class.text-black]="grosor === '15mm'"
           [class.bg-neutral-100]="grosor !== '15mm'"
           class="px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors hover:bg-ts-accent hover:text-black">
          15mm (160×320cm)
        </a>
        <a routerLink="/productos/20mm" 
           [class.bg-ts-accent]="grosor === '20mm'"
           [class.text-black]="grosor === '20mm'"
           [class.bg-neutral-100]="grosor !== '20mm'"
           class="px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors hover:bg-ts-accent hover:text-black">
          20mm (160×320cm)
        </a>
      </div>

      <!-- Products Count -->
      <div class="mb-8">
        <p class="text-neutral-600">
          {{productosFiltrados.length}} producto{{productosFiltrados.length !== 1 ? 's' : ''}} disponible{{productosFiltrados.length !== 1 ? 's' : ''}}
        </p>
      </div>

      <!-- Products Grid -->
      <div [class]="viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-6'"
           *ngIf="productosFiltrados.length > 0">
        <article *ngFor="let producto of productosFiltrados" 
                 [class]="viewMode === 'grid' ? 'product-card-grid' : 'product-card-list'"
                 class="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300">
          
          <!-- Grid View -->
          <ng-container *ngIf="viewMode === 'grid'">
            <div class="aspect-[4/3] overflow-hidden">
              <img [src]="producto.cover" 
                   [alt]="producto.nombre" 
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                   loading="lazy"/>
            </div>
            <div class="p-6">
              <h3 class="font-serif text-xl text-ts-bg mb-2">{{ producto.nombre }}</h3>
              <p class="text-sm text-neutral-600 mb-4">{{ producto.medida }} · {{ producto.grosor }}</p>
              <div class="flex items-center justify-between">
                <a [routerLink]="['/productos', grosor, producto.slug]" 
                   class="text-ts-accent hover:underline font-medium transition-colors">
                  Ver detalles →
                </a>
                <button class="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                        title="Agregar a favoritos">
                  <svg class="w-5 h-5 text-neutral-400 hover:text-ts-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>
            </div>
          </ng-container>

          <!-- List View -->
          <ng-container *ngIf="viewMode === 'list'">
            <div class="flex gap-6">
              <div class="w-48 aspect-[4/3] overflow-hidden rounded-xl">
                <img [src]="producto.cover" 
                     [alt]="producto.nombre" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy"/>
              </div>
              <div class="flex-1 p-6">
                <h3 class="font-serif text-2xl text-ts-bg mb-2">{{ producto.nombre }}</h3>
                <p class="text-neutral-600 mb-4">{{ producto.medida }} · {{ producto.grosor }}</p>
                <p class="text-neutral-700 mb-6 leading-relaxed">
                  Superficie porcelánica de gran formato con acabado premium. 
                  Ideal para {{getAplicaciones(producto.grosor)}}.
                </p>
                <div class="flex items-center justify-between">
                  <a [routerLink]="['/productos', grosor, producto.slug]" 
                     class="inline-flex items-center px-6 py-3 bg-ts-accent text-black rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
                    Ver detalles
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </ng-container>
        </article>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="productosFiltrados.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h3 class="font-serif text-2xl text-ts-bg mb-2">No hay productos disponibles</h3>
        <p class="text-neutral-600 mb-6">
          Actualmente no tenemos productos disponibles para el grosor {{grosor}}.
        </p>
        <a routerLink="/productos" 
           class="inline-block px-6 py-3 bg-ts-accent text-black rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
          Ver todos los productos
        </a>
      </div>
    </div>
  `
})
export class GrosorComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  grosor = '';
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  // Fallback data for immediate display
  fallbackData = {
    '12mm': [
      { nombre: 'Saint Laurent', slug: 'saint-laurent', grosor: '12mm', medida: '160x320cm', cover: 'assets/productos/12mm/saint-laurent.jpg' },
      { nombre: 'Black Gold', slug: 'black-gold', grosor: '12mm', medida: '160x320cm', cover: 'assets/productos/12mm/black-gold.jpg' },
      { nombre: 'Arenaria Ivory', slug: 'arenaria-ivory', grosor: '12mm', medida: '160x320cm', cover: 'assets/productos/12mm/arenaria-ivory.jpg' },
      { nombre: 'Calacatta Gold', slug: 'calacatta-gold', grosor: '12mm', medida: '160x320cm', cover: 'assets/productos/12mm/calacatta-gold.jpg' }
    ],
    '15mm': [
      { nombre: 'Statuario Elegance', slug: 'statuario-elegance', grosor: '15mm', medida: '160x320cm', cover: 'assets/productos/15mm/statuario-elegance.jpg' },
      { nombre: 'Laponia Black', slug: 'laponia-black', grosor: '15mm', medida: '160x320cm', cover: 'assets/productos/15mm/laponia-black.jpg' },
      { nombre: 'Patagonia Natural', slug: 'patagonia-natural', grosor: '15mm', medida: '160x320cm', cover: 'assets/productos/15mm/patagonia-natural.jpg' }
    ],
    '20mm': [
      { nombre: 'Saint Laurent', slug: 'saint-laurent-20', grosor: '20mm', medida: '160x320cm', cover: 'assets/productos/20mm/saint-laurent.jpg' },
      { nombre: 'Black Gold', slug: 'black-gold-20', grosor: '20mm', medida: '160x320cm', cover: 'assets/productos/20mm/black-gold.jpg' },
      { nombre: 'Limestone Ivory', slug: 'limestone-ivory-20', grosor: '20mm', medida: '160x320cm', cover: 'assets/productos/20mm/limestone-ivory.jpg' }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.grosor = this.route.snapshot.paramMap.get('grosor') || '';
    
    // Set fallback data immediately
    this.productosFiltrados = (this.fallbackData as any)[this.grosor] || [];
    
    // Load real data if in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadProductos();
    }
  }

  private loadProductos() {
    this.dataService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.items;
        const filtered = this.dataService.getProductosByGrosor(this.productos, this.grosor);
        if (filtered.length > 0) {
          this.productosFiltrados = filtered;
        }
      },
      error: () => {
        // Keep fallback data on error
        console.log('Using fallback product data for grosor:', this.grosor);
      }
    });
  }

  get medidaInfo(): string {
    return '160×320cm';
  }

  get aplicacionesInfo(): string {
    switch (this.grosor) {
      case '12mm': return 'revestimientos interiores y exteriores';
      case '15mm': return 'pavimentos y encimeras';
      case '20mm': return 'pavimentos exteriores y aplicaciones de alto tránsito';
      default: return 'múltiples aplicaciones';
    }
  }

  getAplicaciones(grosor: string): string {
    switch (grosor) {
      case '12mm': return 'cocinas y baños residenciales';
      case '15mm': return 'espacios comerciales y residenciales';
      case '20mm': return 'exteriores y zonas de alto tránsito';
      default: return 'diversos proyectos';
    }
  }
}