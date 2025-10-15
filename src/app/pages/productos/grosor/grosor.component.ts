import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../models/product';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-grosor',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, TranslateModule],
  template: `
    <!-- Hero Section with Bitcoin Theme -->
    <section class="relative py-16 lg:py-24 bg-gradient-to-b from-[#0a0b0d] to-[#13151a] overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-bitcoin-orange/5 to-bitcoin-gold/5"></div>
      <div class="relative max-w-7xl mx-auto px-6">
        <!-- Breadcrumb Navigation -->
        <nav class="mb-8">
          <ol class="flex items-center space-x-2 text-sm text-bitcoin-gray">
            <li><a routerLink="/" class="hover:text-bitcoin-orange transition-colors text-white">{{ 'grosor.breadcrumb.home' | translate }}</a></li>
            <li class="text-bitcoin-gray/50">/</li>
            <li><a routerLink="/productos" class="hover:text-bitcoin-orange transition-colors text-white">{{ 'grosor.breadcrumb.products' | translate }}</a></li>
            <li class="text-bitcoin-gray/50">/</li>
            <li class="bitcoin-gradient-text font-medium">{{category}}</li>
          </ol>
        </nav>
        
        <!-- Header Content -->
        <div class="text-center">
          <h1 class="text-4xl lg:text-6xl text-white mb-6 leading-tight font-bold">
            <span class="bitcoin-gradient-text">{{category}}</span> {{ 'grosor.collection' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl text-bitcoin-gray max-w-3xl mx-auto leading-relaxed mb-8">
            {{ 'grosor.subtitle' | translate }}
          </p>
          
          <!-- Results Info -->
          <div class="flex items-center justify-center gap-4 text-bitcoin-gray">
            <div class="w-16 h-px bg-bitcoin-orange"></div>
            <span class="text-sm font-medium tracking-wider uppercase">
              {{productosFiltrados.length}} {{ productosFiltrados.length !== 1 ? ('grosor.products_available' | translate) : ('grosor.product_available' | translate) }}
            </span>
            <div class="w-16 h-px bg-bitcoin-orange"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation and Content Section -->
    <section class="bg-gradient-to-b from-[#13151a] to-[#0a0b0d] min-h-screen">
      <div class="max-w-7xl mx-auto px-6 py-16">
        
        <!-- View Mode Controls -->
        <div class="mb-12 flex justify-end">
          <div class="bg-bitcoin-dark/40 border border-bitcoin-gray/20 rounded-2xl p-6 shadow-bitcoin">
            <h3 class="text-lg font-medium text-white mb-4 text-center">{{ 'grosor.view_mode' | translate }}</h3>
            <div class="flex bg-black/30 border border-bitcoin-orange/20 rounded-full p-1">
              <button 
                [class.bg-bitcoin-orange]="viewMode === 'grid'"
                [class.text-black]="viewMode === 'grid'"
                [class.shadow-bitcoin]="viewMode === 'grid'"
                [class.text-bitcoin-gray]="viewMode !== 'grid'"
                (click)="viewMode = 'grid'"
                class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300">
                {{ 'grosor.grid' | translate }}
              </button>
              <button 
                [class.bg-bitcoin-orange]="viewMode === 'list'"
                [class.text-black]="viewMode === 'list'"
                [class.shadow-bitcoin]="viewMode === 'list'"
                [class.text-bitcoin-gray]="viewMode !== 'list'"
                (click)="viewMode = 'list'"
                class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300">
                {{ 'grosor.list' | translate }}
              </button>
            </div>
          </div>
        </div>


      <!-- Products Grid -->
      <div *ngIf="isLoading" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="animate-pulse">
          <div class="bg-bitcoin-gray/20 aspect-square rounded-2xl mb-4"></div>
          <div class="h-4 bg-bitcoin-gray/20 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-bitcoin-gray/20 rounded w-1/2"></div>
        </div>
      </div>

      <div [class]="viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-6'"
           *ngIf="!isLoading && productosFiltrados.length > 0">
        <ts-product-card 
          *ngFor="let producto of productosFiltrados" 
          [product]="producto"
          [viewMode]="viewMode"
          [categoryPath]="category">
        </ts-product-card>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!isLoading && productosFiltrados.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-bitcoin-dark/40 border border-bitcoin-gray/20 flex items-center justify-center">
          <svg class="w-12 h-12 text-bitcoin-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h3 class="text-2xl text-white mb-2 font-bold">{{ 'grosor.no_products' | translate }}</h3>
        <p class="text-bitcoin-gray mb-6">
          {{ 'grosor.no_products_desc' | translate:{ category: category } }}
        </p>
        <a routerLink="/productos" 
           class="inline-block px-6 py-3 bg-bitcoin-orange hover:bg-bitcoin-orange/90 text-black rounded-full font-semibold transition-colors shadow-bitcoin">
          {{ 'grosor.view_all_products' | translate }}
        </a>
      </div>
      
      <!-- Call to Action Section -->
      <div class="mt-20 text-center py-16 bg-gradient-to-r from-bitcoin-dark/40 to-bitcoin-dark/20 border border-bitcoin-orange/20 rounded-2xl shadow-bitcoin">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl bitcoin-gradient-text mb-4 font-bold">
            {{ 'grosor.cta.title' | translate }}
          </h2>
          <p class="text-lg text-bitcoin-gray mb-8">
            {{ 'grosor.cta.description' | translate }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/contacto" 
               class="inline-flex items-center gap-2 px-8 py-4 bg-bitcoin-orange hover:bg-bitcoin-orange/90 text-black rounded-full font-semibold transition-colors shadow-bitcoin">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.793-.793L3 21l1.793-6.207A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z"/>
              </svg>
              {{ 'grosor.cta.contact_us' | translate }}
            </a>
            <a routerLink="/productos" 
               class="inline-flex items-center gap-2 px-8 py-4 border-2 border-bitcoin-orange text-bitcoin-orange hover:bg-bitcoin-orange hover:text-black rounded-full font-semibold transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              {{ 'grosor.cta.all_products' | translate }}
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
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  
  category = '';
  productosFiltrados: Product[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = true;

  ngOnInit() {
    // Watch for route parameter changes to reload products when switching category
    this.route.paramMap.subscribe(params => {
      this.category = params.get('category') || '';
      
      // Load real products from Firestore
      if (isPlatformBrowser(this.platformId)) {
        this.loadProducts();
      }
    });
  }

  private loadProducts() {
    this.isLoading = true;
    this.productsService.getProductsByGrosor(this.category).subscribe({
      next: (products) => {
        // Filter only published and active products
        this.productosFiltrados = products
          .filter(p => p.status === 'published' && p.active !== false)
          .sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.productosFiltrados = [];
        this.isLoading = false;
      }
    });
  }
}
