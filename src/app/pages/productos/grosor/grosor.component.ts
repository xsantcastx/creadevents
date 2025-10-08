import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, Producto } from '../../../core/services/data.service';
import { Product } from '../../../models/product';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-grosor',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <!-- Hero Section with matching background -->
    <section class="relative py-16 lg:py-24 bg-gradient-to-b from-ts-paper to-white overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-ts-bg/5 to-ts-accent/5"></div>
      <div class="relative max-w-7xl mx-auto px-6">
        <!-- Breadcrumb Navigation -->
        <nav class="mb-8">
          <ol class="flex items-center space-x-2 text-sm text-neutral-700">
            <li><a routerLink="/" class="hover:text-ts-accent transition-colors text-neutral-800">Home</a></li>
            <li class="text-neutral-500">/</li>
            <li><a routerLink="/productos" class="hover:text-ts-accent transition-colors text-neutral-800">Productos</a></li>
            <li class="text-neutral-500">/</li>
            <li class="text-ts-accent font-medium">{{grosor}}</li>
          </ol>
        </nav>
        
        <!-- Header Content -->
        <div class="text-center">
          <h1 class="font-serif text-4xl lg:text-6xl text-neutral-800 mb-6 leading-tight">
            Colección <span class="text-ts-accent">{{grosor}}</span>
          </h1>
          <p class="text-xl lg:text-2xl text-neutral-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Superficies porcelánicas de gran formato {{medidaInfo}} perfectas para 
            {{aplicacionesInfo}}
          </p>
          
          <!-- Results Info -->
          <div class="flex items-center justify-center gap-4 text-neutral-700">
            <div class="w-16 h-px bg-ts-accent"></div>
            <span class="text-sm font-medium tracking-wider uppercase">
              {{productosFiltrados.length}} producto{{productosFiltrados.length !== 1 ? 's' : ''}} disponible{{productosFiltrados.length !== 1 ? 's' : ''}}
            </span>
            <div class="w-16 h-px bg-ts-accent"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation and Content Section -->
    <section class="bg-white min-h-screen">
      <div class="max-w-7xl mx-auto px-6 py-16">
        
        <!-- Controls Section -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">
          
          <!-- Thickness Navigation Tabs -->
          <div class="bg-gradient-to-r from-ts-paper to-white rounded-2xl p-6 shadow-sm flex-1">
            <h3 class="text-lg font-medium text-neutral-800 mb-4">Explorar por grosor</h3>
            <div class="flex gap-2 overflow-x-auto pb-2">
              <a routerLink="/productos/12mm" 
                 [class.bg-ts-accent]="grosor === '12mm'"
                 [class.text-black]="grosor === '12mm'"
                 [class.bg-white]="grosor !== '12mm'"
                 [class.border-ts-accent]="grosor !== '12mm'"
                 [class.text-neutral-700]="grosor !== '12mm'"
                 class="px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 border hover:bg-ts-accent hover:text-black hover:border-ts-accent">
                12mm (160×320cm)
              </a>
              <a routerLink="/productos/15mm" 
                 [class.bg-ts-accent]="grosor === '15mm'"
                 [class.text-black]="grosor === '15mm'"
                 [class.bg-white]="grosor !== '15mm'"
                 [class.border-ts-accent]="grosor !== '15mm'"
                 [class.text-neutral-700]="grosor !== '15mm'"
                 class="px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 border hover:bg-ts-accent hover:text-black hover:border-ts-accent">
                15mm (160×320cm)
              </a>
              <a routerLink="/productos/20mm" 
                 [class.bg-ts-accent]="grosor === '20mm'"
                 [class.text-black]="grosor === '20mm'"
                 [class.bg-white]="grosor !== '20mm'"
                 [class.border-ts-accent]="grosor !== '20mm'"
                 [class.text-neutral-700]="grosor !== '20mm'"
                 class="px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 border hover:bg-ts-accent hover:text-black hover:border-ts-accent">
                20mm (160×320cm)
              </a>
            </div>
          </div>

          <!-- View Mode Controls -->
          <div class="bg-gradient-to-r from-ts-paper to-white rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-medium text-neutral-800 mb-4 text-center">Vista</h3>
            <div class="flex bg-white border border-ts-accent/20 rounded-full p-1">
              <button 
                [class.bg-ts-accent]="viewMode === 'grid'"
                [class.text-black]="viewMode === 'grid'"
                [class.shadow-sm]="viewMode === 'grid'"
                [class.text-neutral-700]="viewMode !== 'grid'"
                (click)="viewMode = 'grid'"
                class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300">
                Grid
              </button>
              <button 
                [class.bg-ts-accent]="viewMode === 'list'"
                [class.text-black]="viewMode === 'list'"
                [class.shadow-sm]="viewMode === 'list'"
                [class.text-neutral-700]="viewMode !== 'list'"
                (click)="viewMode = 'list'"
                class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300">
                Lista
              </button>
            </div>
          </div>
        </div>


      <!-- Products Grid -->
      <div [class]="viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-6'"
           *ngIf="productosFiltrados.length > 0">
        <ts-product-card 
          *ngFor="let producto of productosFiltrados" 
          [product]="producto"
          [viewMode]="viewMode"
          [grosorPath]="grosor">
        </ts-product-card>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="productosFiltrados.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h3 class="font-serif text-2xl text-neutral-800 mb-2">No hay productos disponibles</h3>
        <p class="text-neutral-600 mb-6">
          Actualmente no tenemos productos disponibles para el grosor {{grosor}}.
        </p>
        <a routerLink="/productos" 
           class="inline-block px-6 py-3 bg-ts-accent text-black rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
          Ver todos los productos
        </a>
      </div>
      
      <!-- Call to Action Section -->
      <div class="mt-20 text-center py-16 bg-gradient-to-r from-ts-paper to-white rounded-2xl">
        <div class="max-w-3xl mx-auto">
          <h2 class="font-serif text-3xl text-neutral-800 mb-4">
            ¿Necesitas más información?
          </h2>
          <p class="text-lg text-neutral-600 mb-8">
            Descarga nuestros datos técnicos o contacta con nuestro equipo para asesoramiento personalizado.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/datos-tecnicos" 
               class="inline-flex items-center gap-2 px-8 py-4 bg-ts-accent text-black rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
              </svg>
              Datos técnicos
            </a>
            <a routerLink="/contacto" 
               class="inline-flex items-center gap-2 px-8 py-4 ring-2 ring-ts-accent text-ts-accent hover:bg-ts-accent hover:text-black rounded-full font-semibold transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.793-.793L3 21l1.793-6.207A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z"/>
              </svg>
              Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
    </section>
  `
})
export class GrosorComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  grosor = '';
  productos: Producto[] = [];
  productosFiltrados: Product[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  // Fallback data for immediate display - converted to Product interface
  fallbackData: Record<string, Product[]> = {
    '12mm': [
      { id: '12mm-saint-laurent', name: 'Saint Laurent', slug: 'saint-laurent', grosor: '12mm', size: '160×320cm', imageUrl: 'assets/productos/12mm/saint-laurent.jpg' },
      { id: '12mm-black-gold', name: 'Black Gold', slug: 'black-gold', grosor: '12mm', size: '160×320cm', imageUrl: 'assets/productos/12mm/black-gold.jpg' },
      { id: '12mm-arenaria-ivory', name: 'Arenaria Ivory', slug: 'arenaria-ivory', grosor: '12mm', size: '160×320cm', imageUrl: 'assets/productos/12mm/arenaria-ivory.jpg' },
      { id: '12mm-calacatta-gold', name: 'Calacatta Gold', slug: 'calacatta-gold', grosor: '12mm', size: '160×320cm', imageUrl: 'assets/productos/12mm/calacatta-gold.jpg' }
    ],
    '15mm': [
      { id: '15mm-statuario-elegance', name: 'Statuario Elegance', slug: 'statuario-elegance', grosor: '15mm', size: '160×320cm', imageUrl: 'assets/productos/15mm/statuario-elegance.jpg' },
      { id: '15mm-laponia-black', name: 'Laponia Black', slug: 'laponia-black', grosor: '15mm', size: '160×320cm', imageUrl: 'assets/productos/15mm/laponia-black.jpg' },
      { id: '15mm-patagonia-natural', name: 'Patagonia Natural', slug: 'patagonia-natural', grosor: '15mm', size: '160×320cm', imageUrl: 'assets/productos/15mm/patagonia-natural.jpg' }
    ],
    '20mm': [
      { id: '20mm-saint-laurent', name: 'Saint Laurent', slug: 'saint-laurent', grosor: '20mm', size: '160×320cm', imageUrl: 'assets/productos/20mm/saint-laurent.jpg' },
      { id: '20mm-black-gold', name: 'Black Gold', slug: 'black-gold', grosor: '20mm', size: '160×320cm', imageUrl: 'assets/productos/20mm/black-gold.jpg' },
      { id: '20mm-limestone-ivory', name: 'Limestone Ivory', slug: 'limestone-ivory', grosor: '20mm', size: '160×320cm', imageUrl: 'assets/productos/20mm/limestone-ivory.jpg' }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.grosor = this.route.snapshot.paramMap.get('grosor') || '';
    
    // Set fallback data immediately
    this.productosFiltrados = this.fallbackData[this.grosor] || [];
    
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
          // Convert to Product interface
          this.productosFiltrados = filtered.map(p => ({
            id: `${p.grosor}-${p.slug}`,
            name: p.nombre,
            slug: p.slug,
            grosor: p.grosor as '12mm'|'15mm'|'20mm',
            size: p.medida,
            imageUrl: p.cover
          }));
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