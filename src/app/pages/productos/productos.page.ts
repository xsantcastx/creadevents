import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductsService } from '../../services/products.service';
import { MediaService } from '../../services/media.service';
import { CategoryService } from '../../services/category.service';
import { ModelService } from '../../services/model.service';
import { TagService } from '../../services/tag.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { Category, Model, Tag } from '../../models/catalog';
import { Media } from '../../models/media';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './productos.page.html',
  styleUrl: './productos.page.scss'
})
export class ProductosPageComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private productsService = inject(ProductsService);
  private mediaService = inject(MediaService);
  private categoryService = inject(CategoryService);
  private modelService = inject(ModelService);
  private tagService = inject(TagService);
  private cartService = inject(CartService);
  
  // Firestore products
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Products by thickness for display
  productos12mm: Product[] = [];
  productos15mm: Product[] = [];
  productos20mm: Product[] = [];
  
  // Filter options
  categories: Category[] = [];
  models: Model[] = [];
  tags: Tag[] = [];
  allTags: string[] = [];
  selectedCategoryId = '';
  selectedModelId = '';
  selectedTags: string[] = [];
  searchTerm = '';
  
  // Loading state
  isLoading = true;

  async ngOnInit() {
    // Load filter options
    await this.loadFilterOptions();
    
    // Load products if in browser
    if (isPlatformBrowser(this.platformId)) {
      await this.loadProducts();
    } else {
      // During SSR, set loading to false
      this.isLoading = false;
    }
  }

  private async loadFilterOptions() {
    try {
      this.categoryService.getActiveCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (err) => console.error('Error loading categories:', err)
      });

      this.modelService.getActiveModels().subscribe({
        next: (models) => {
          this.models = models;
        },
        error: (err) => console.error('Error loading models:', err)
      });

      this.tagService.getActiveTags().subscribe({
        next: (tags) => {
          this.tags = tags;
        },
        error: (err) => console.error('Error loading tags:', err)
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }

  private async loadProducts() {
    this.isLoading = true;

    try {
      // Get all published products from Firestore
      this.productsService.getAllProducts().subscribe({
        next: async (products) => {
          console.log('📦 All products loaded:', products.length, products);
          
          // Filter only published products
          const publishedProducts = products.filter(p => p.status === 'published');
          console.log('✅ Published products:', publishedProducts.length, publishedProducts);
          
          // Load cover images from media
          this.allProducts = await this.loadProductCovers(publishedProducts);
          console.log('🖼️ Products with covers:', this.allProducts);
          
          // Extract all unique tags
          this.extractAllTags();
          
          // Apply filters
          this.applyFilters();
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading products:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('❌ Error in loadProducts:', error);
      this.isLoading = false;
    }
  }

  private async loadProductCovers(products: Product[]): Promise<Product[]> {
    const productsWithCovers = await Promise.all(
      products.map(async (product) => {
        if (product.coverImage) {
          try {
            // Check if coverImage is a media ID or a URL
            const isMediaId = !product.coverImage.includes('http');
            
            if (isMediaId) {
              const media = await this.mediaService.getMediaById(product.coverImage);
              if (media) {
                return { ...product, imageUrl: media.url };
              }
            } else {
              // Already a URL (legacy products)
              return { ...product, imageUrl: product.coverImage };
            }
          } catch (error) {
            console.error('Error loading cover for product:', product.name, error);
          }
        }
        
        // No cover image or error loading it
        return { ...product, imageUrl: '' };
      })
    );

    return productsWithCovers;
  }

  private extractAllTags() {
    const tagsSet = new Set<string>();
    this.allProducts.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    this.allTags = Array.from(tagsSet).sort();
  }

  getTagName(tagSlug: string): string {
    const tag = this.tags.find(t => t.slug === tagSlug);
    return tag?.name || tagSlug;
  }

  getTagColor(tagSlug: string): string {
    const tag = this.tags.find(t => t.slug === tagSlug);
    return tag?.color || '#F7931A';
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    // Filter by category
    if (this.selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategoryId);
    }

    // Filter by model
    if (this.selectedModelId) {
      filtered = filtered.filter(p => p.modelId === this.selectedModelId);
    }

    // Filter by tags (products must have ALL selected tags)
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.tags || !Array.isArray(p.tags)) return false;
        return this.selectedTags.every(tag => p.tags!.includes(tag));
      });
    }

    // Filter by search term (search in name and slug)
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.search_name && p.search_name.includes(term))
      );
    }

    this.filteredProducts = filtered;
    
    // No longer grouping by hardcoded thickness values
    // Products will be grouped dynamically by their actual categories from Firestore
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onModelChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategoryId = '';
    this.selectedModelId = '';
    this.selectedTags = [];
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  addToCart(product: Product, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.add(product, 1);
  }

  get hasFilters(): boolean {
    return !!(this.selectedCategoryId || this.selectedModelId || this.selectedTags.length > 0 || this.searchTerm);
  }

  get totalProductsCount(): number {
    return this.allProducts.length;
  }

  get filteredProductsCount(): number {
    return this.filteredProducts.length;
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  getModelName(modelId: string | undefined): string {
    if (!modelId) return '';
    const model = this.models.find(m => m.id === modelId);
    return model?.name || '';
  }
}
