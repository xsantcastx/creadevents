import { Component, OnInit, AfterViewInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { ProductsService } from '../../../services/products.service';
import { MediaService } from '../../../services/media.service';
import { CartService } from '../../../services/cart.service';
import { CategoryService } from '../../../services/category.service';
import { ModelService } from '../../../services/model.service';
import { Product } from '../../../models/product';
import { Media } from '../../../models/media';
import { Category } from '../../../models/catalog';
import { Model } from '../../../models/catalog';
import { ImageLightboxComponent } from '../../../shared/components/image-lightbox/image-lightbox.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ImageLightboxComponent],
  templateUrl: './detalle.component.html'
})
export class DetalleComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private productsService = inject(ProductsService);
  private mediaService = inject(MediaService);
  private cartService = inject(CartService);
  private categoryService = inject(CategoryService);
  private modelService = inject(ModelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private cdr = inject(ChangeDetectorRef);
  
  producto: Product | undefined;
  category: Category | undefined;
  model: Model | undefined;
  productosRelacionados: Product[] = [];
  coverImage: Media | undefined;
  galleryImages: Media[] = [];
  loading = true;
  lightboxOpen = false;
  currentLightboxImage = '';
  currentLightboxAlt = '';
  private dataLoaded = false;

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    
    if (slug) {
      await this.loadProducto(slug);
    } else {
      this.loading = false;
    }
  }

  async ngAfterViewInit() {
    // Ensure data loads even if ngOnInit was skipped during SSR
    if (!this.dataLoaded && isPlatformBrowser(this.platformId)) {
      const slug = this.route.snapshot.paramMap.get('slug');
      if (slug && !this.producto) {
        await this.loadProducto(slug);
        this.cdr.detectChanges();
      }
    }
  }

  private async loadProducto(slug: string) {
    try {
      // Mark as loaded to prevent duplicate loads
      this.dataLoaded = true;
      
      // Query product by slug
      const products = await firstValueFrom(this.productsService.getAllProducts());
      
      // Find product matching slug, filter by published status
      this.producto = products.find(p => 
        p.slug === slug &&
        p.status === 'published'
      );
      
      if (this.producto) {
        // Load category information
        if (this.producto.categoryId) {
          const cat = await firstValueFrom(this.categoryService.getCategory(this.producto.categoryId));
          this.category = cat || undefined;
        }
        
        // Load model information
        if (this.producto.modelId) {
          const mod = await firstValueFrom(this.modelService.getModel(this.producto.modelId));
          this.model = mod || undefined;
        }
        
        // Load cover image
        if (this.producto.coverImage) {
          const isMediaId = !this.producto.coverImage.includes('http');
          if (isMediaId) {
            const media = await this.mediaService.getMediaById(this.producto.coverImage);
            this.coverImage = media || undefined;
          }
        }
        
        // Load gallery images
        if (this.producto.galleryImageIds && this.producto.galleryImageIds.length > 0) {
          this.galleryImages = await this.mediaService.getMediaByIds(this.producto.galleryImageIds);
        }
        
        // Update page title and meta tags
        this.updateSEO();
        
        // Load related products
        await this.loadProductosRelacionados(products);
      } else {
        // Product not found or not published - redirect to 404
        this.router.navigate(['/404']);
      }
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading product:', error);
      this.loading = false;
      this.router.navigate(['/404']);
    }
  }

  private async loadProductosRelacionados(todosLosProductos: Product[]) {
    if (!this.producto) return;
    
    // Get other published products from the same category
    let related = todosLosProductos
      .filter(p => 
        p.status === 'published' &&
        p.id !== this.producto!.id &&
        p.categoryId === this.producto!.categoryId
      )
      .slice(0, 3);
    
    // If not enough from same category, fill with any published products
    if (related.length < 3) {
      const additional = todosLosProductos
        .filter(p => 
          p.status === 'published' &&
          p.id !== this.producto!.id &&
          !related.find(r => r.id === p.id)
        )
        .slice(0, 3 - related.length);
      
      related = [...related, ...additional];
    }
    
    // Load cover images for related products
    this.productosRelacionados = await Promise.all(
      related.map(async (product) => {
        if (product.coverImage) {
          const isMediaId = !product.coverImage.includes('http');
          if (isMediaId) {
            const media = await this.mediaService.getMediaById(product.coverImage);
            if (media) {
              return { ...product, imageUrl: media.url };
            }
          } else {
            return { ...product, imageUrl: product.coverImage };
          }
        }
        return product;
      })
    );
  }

  private updateSEO() {
    if (!this.producto) return;
    
    // Update page title
    const title = this.producto.seo?.title || `${this.producto.name} - TheLuxMining`;
    this.titleService.setTitle(title);
    
    // Update meta description
    const description = this.producto.seo?.metaDescription || this.producto.description || '';
    this.metaService.updateTag({ name: 'description', content: description });
    
    // Update Open Graph tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    
    if (this.coverImage?.url) {
      this.metaService.updateTag({ property: 'og:image', content: this.coverImage.url });
    }
  }

  goBack() {
    this.router.navigate(['/productos']);
  }

  openLightbox(imageUrl?: string, altText?: string) {
    this.currentLightboxImage = imageUrl || this.coverImage?.url || '';
    this.currentLightboxAlt = altText || this.producto?.name || '';
    this.lightboxOpen = true;
  }

  addToCart() {
    if (!this.producto) return;
    
    this.cartService.add(this.producto, 1);
  }

  getAdditionalSpecKeys(): string[] {
    if (!this.producto?.specs) return [];
    
    const knownKeys = [
      'size', 'finish', 'thicknessMm', 'usage',
      'hashRate', 'powerConsumption', 'efficiency', 'algorithm',
      'chipType', 'cooling', 'dimensions', 'weight', 'temperature',
      'network', 'voltage', 'warranty',
      'waterAbsorption', 'abrasionResistance', 'chemicalResistance', 'fireResistance'
    ];
    
    return Object.keys(this.producto.specs).filter(key => !knownKeys.includes(key));
  }

  formatSpecLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' ')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Get SVG path for benefit icon
   */
  getBenefitIconPath(iconType: string): string {
    const iconPaths: Record<string, string> = {
      'performance': 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      'efficiency': 'M13 10V3L4 14h7v7l9-11h-7z',
      'reliability': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'support': 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
      'quality': 'M5 13l4 4L19 7',
      'security': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'warranty': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'design': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'value': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return iconPaths[iconType] || iconPaths['performance'];
  }
}