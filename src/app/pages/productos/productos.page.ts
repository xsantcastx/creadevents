import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DataService, Producto } from '../../core/services/data.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './productos.page.html',
  styleUrl: './productos.page.scss'
})
export class ProductosPageComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  productos12mm: Producto[] = [];
  productos15mm: Producto[] = [];
  productos20mm: Producto[] = [];
  
  // Fallback data for immediate display and SSR
  fallbackData = {
    productos12mm: [
      { nombre: 'Saint Laurent', slug: 'saint-laurent', grosor: '12mm' as const, medida: '160x320cm', cover: 'assets/productos/12mm/saint-laurent.jpg' },
      { nombre: 'Black Gold', slug: 'black-gold', grosor: '12mm' as const, medida: '160x320cm', cover: 'assets/productos/12mm/black-gold.jpg' },
      { nombre: 'Arenaria Ivory', slug: 'arenaria-ivory', grosor: '12mm' as const, medida: '160x320cm', cover: 'assets/productos/12mm/arenaria-ivory.jpg' },
      { nombre: 'Calacatta Gold', slug: 'calacatta-gold', grosor: '12mm' as const, medida: '160x320cm', cover: 'assets/productos/12mm/calacatta-gold.jpg' }
    ],
    productos15mm: [
      { nombre: 'Statuario Elegance', slug: 'statuario-elegance', grosor: '15mm' as const, medida: '160x320cm', cover: 'assets/productos/15mm/statuario-elegance.jpg' },
      { nombre: 'Laponia Black', slug: 'laponia-black', grosor: '15mm' as const, medida: '160x320cm', cover: 'assets/productos/15mm/laponia-black.jpg' },
      { nombre: 'Patagonia Natural', slug: 'patagonia-natural', grosor: '15mm' as const, medida: '160x320cm', cover: 'assets/productos/15mm/patagonia-natural.jpg' }
    ],
    productos20mm: [
      { nombre: 'Saint Laurent', slug: 'saint-laurent-20', grosor: '20mm' as const, medida: '160x320cm', cover: 'assets/productos/20mm/saint-laurent.jpg' },
      { nombre: 'Black Gold', slug: 'black-gold-20', grosor: '20mm' as const, medida: '160x320cm', cover: 'assets/productos/20mm/black-gold.jpg' },
      { nombre: 'Limestone Ivory', slug: 'limestone-ivory-20', grosor: '20mm' as const, medida: '160x320cm', cover: 'assets/productos/20mm/limestone-ivory.jpg' }
    ]
  };

  constructor(
    private dataService: DataService,
    private cartService: CartService
  ) {}

  addToCart(producto: Producto, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Convert Producto to Product interface
    const product: Product = {
      id: `${producto.grosor}-${producto.slug}`,
      name: producto.nombre,
      slug: producto.slug,
      grosor: producto.grosor as '12mm'|'15mm'|'20mm',
      size: producto.medida,
      imageUrl: producto.cover,
      sku: producto.slug
    };
    
    this.cartService.add(product, 1);
  }

  ngOnInit() {
    // Set fallback data immediately
    this.productos12mm = this.fallbackData.productos12mm;
    this.productos15mm = this.fallbackData.productos15mm;
    this.productos20mm = this.fallbackData.productos20mm;
    
    // Load real data if in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadProductos();
    }
  }

  private loadProductos() {
    this.dataService.getProductos().subscribe({
      next: (data) => {
        const productos12 = this.dataService.getProductosByGrosor(data.items, '12mm');
        const productos15 = this.dataService.getProductosByGrosor(data.items, '15mm');
        const productos20 = this.dataService.getProductosByGrosor(data.items, '20mm');
        
        if (productos12.length > 0) this.productos12mm = productos12;
        if (productos15.length > 0) this.productos15mm = productos15;
        if (productos20.length > 0) this.productos20mm = productos20;
      },
      error: () => {
        console.log('Using fallback product data');
        // Fallback data is already set
      }
    });
  }
}
