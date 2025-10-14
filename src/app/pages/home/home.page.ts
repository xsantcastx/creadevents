import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductFirestoreService, FirestoreProduct } from '../../services/product-firestore.service';
import { GalleryService, GalleryImage } from '../../services/gallery.service';
import { HomeHeroComponent } from '../../features/home/home-hero/home-hero.component';
import { HomeStatsComponent } from '../../features/home/home-stats/home-stats.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, HomeHeroComponent, HomeStatsComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePageComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private productService = inject(ProductFirestoreService);
  private galleryService = inject(GalleryService);
  
  // Dynamic product data from Firestore
  featuredProducts: FirestoreProduct[] = [];
  galleryImages: GalleryImage[] = [];
  loading = true;
  hasProducts = false;

  ngOnInit() {
    // Only load from service if in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.loadLatestProducts();
      this.loadGalleryPreview();
    } else {
      // During SSR, set loading to false to show empty state
      this.loading = false;
    }
  }

  private loadLatestProducts() {
    // Get all products and show the latest/featured ones
    this.productService.getProducts()
      .pipe(take(1))
      .subscribe({
        next: (products) => {
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
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.hasProducts = false;
          this.loading = false;
        }
      });
  }

  private loadGalleryPreview() {
    // Get latest 6 gallery images
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
