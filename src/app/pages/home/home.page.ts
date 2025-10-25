import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductFirestoreService, FirestoreProduct } from '../../services/product-firestore.service';
import { GalleryService, GalleryImage } from '../../services/gallery.service';
import { HomeHeroComponent } from '../../features/home/home-hero/home-hero.component';
import { HomeStatsComponent } from '../../features/home/home-stats/home-stats.component';
import { LoadingComponentBase } from '../../core/classes/loading-component.base';
import { MetaService } from '../../services/meta.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, HomeHeroComponent, HomeStatsComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePageComponent extends LoadingComponentBase implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private productService = inject(ProductFirestoreService);
  private galleryService = inject(GalleryService);
  private metaService = inject(MetaService);
  
  // Dynamic product data from Firestore
  featuredProducts: FirestoreProduct[] = [];
  galleryImages: GalleryImage[] = [];
  hasProducts = false;

  ngOnInit() {
    // Set page meta tags from settings
    this.metaService.setPageMeta({
      title: 'HOME.TITLE',
      description: 'HOME.DESCRIPTION'
    });

    // Only load from service if in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.loadLatestProducts();
      this.loadGalleryPreview();
    } else {
      // During SSR, set loading to false to show empty state
      this.setLoading(false);
    }
  }

  private async loadLatestProducts() {
    await this.withLoading(async () => {
      const products = await new Promise<FirestoreProduct[]>((resolve, reject) => {
        this.productService.getProducts()
          .pipe(take(1))
          .subscribe({
            next: (products) => resolve(products),
            error: (error) => reject(error)
          });
      });
      
      // Filter available products and sort by creation date (newest first)
      const availableProducts = products
        .filter(p => p.available !== false)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      
      // Take up to 8 latest products for featured section
      this.featuredProducts = availableProducts.slice(0, 8);
      this.hasProducts = this.featuredProducts.length > 0;
    });
  }

  private async loadGalleryPreview() {
    // Get latest 6 gallery images (don't show loading for this secondary content)
    this.galleryService.getAllImages()
      .pipe(take(1))
      .subscribe({
        next: (images: GalleryImage[]) => {
          this.galleryImages = images.slice(0, 6);
        },
        error: (error: any) => {
          console.error('Error loading gallery:', error);
        }
      });
  }
}
