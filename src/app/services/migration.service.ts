import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductsService } from './products.service';
import { CategoryService } from './category.service';
import { MaterialService } from './material.service';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';

interface LegacyProduct {
  nombre: string;
  slug: string;
  grosor: string;
  medida: string;
  cover: string;
  descripcion: string;
  aplicaciones: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private http = inject(HttpClient);
  private productsService = inject(ProductsService);
  private categoryService = inject(CategoryService);
  private materialService = inject(MaterialService);
  private storageService = inject(StorageService);

  /**
   * Migrate products from productos.json to new catalog structure
   */
  async migrateProductsFromJSON(): Promise<void> {
    console.log('🔄 Starting product migration...');

    try {
      // Load legacy products from JSON
      const response = await firstValueFrom(
        this.http.get<{ items: LegacyProduct[] }>('/assets/data/productos.json')
      );
      const legacyProducts = response.items;

      console.log(`Found ${legacyProducts.length} products to migrate`);

      // Load categories and materials
      const categories = await firstValueFrom(this.categoryService.getAllCategories());
      const materials = await firstValueFrom(this.materialService.getAllMaterials());

      console.log(`Loaded ${categories.length} categories and ${materials.length} materials`);

      // Create a map for quick lookups
      const categoryMap = new Map(categories.map(c => [c.slug, c]));
      const materialMap = new Map(materials.map(m => [m.slug, m]));

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      // Migrate each product
      for (const legacy of legacyProducts) {
        try {
          // Find matching category by grosor
          const category = categoryMap.get(legacy.grosor);
          if (!category) {
            console.warn(`⚠️ Category not found for grosor: ${legacy.grosor} (${legacy.nombre})`);
            skipCount++;
            continue;
          }

          // Extract material name from product name
          const materialName = this.extractMaterialName(legacy.nombre);
          const materialSlug = this.slugify(materialName);
          const material = materialMap.get(materialSlug);

          if (!material) {
            console.warn(`⚠️ Material not found: ${materialSlug} (${legacy.nombre})`);
            skipCount++;
            continue;
          }

          // Download and re-upload image to Firebase Storage
          let imageUrl = legacy.cover;
          if (legacy.cover.startsWith('/assets/')) {
            console.log(`Uploading image for ${legacy.nombre}...`);
            // For local assets, we'll keep the original path for now
            // In production, you'd want to upload to Firebase Storage
            imageUrl = legacy.cover;
          }

          // Create product data
          const productData = {
            name: legacy.nombre,
            slug: legacy.slug,
            categoryId: category.id!,
            materialId: material.id!,
            description: legacy.descripcion,
            coverImage: imageUrl,
            price: 0, // Default price, update manually later
            stock: 0,  // Default stock, update manually later
            size: legacy.medida,
            sku: `TS-${category.slug}-${material.slug}`.toUpperCase(),
            active: true,
            featured: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            
            // New catalog structure
            specs: {
              grosor: legacy.grosor,
              size: legacy.medida,
              finish: 'Pulido',
              usage: legacy.aplicaciones,
              weight: '',
              thickness: legacy.grosor
            },
            variants: [],
            seo: {
              title: `${legacy.nombre} - Mining Hardware ${legacy.grosor} | TheLuxMining`,
              metaDescription: legacy.descripcion,
              keywords: [
                legacy.nombre,
                'bitcoin mining',
                legacy.grosor,
                'ASIC miner',
                ...legacy.aplicaciones
              ]
            },
            media: {
              coverImage: imageUrl,
              images: [imageUrl],
              videos: []
            },
            
            // Compatibility with old system
            grosor: legacy.grosor,
            features: legacy.aplicaciones.join(', ')
          };

          // Check if product already exists by slug
          const existingProducts = await firstValueFrom(this.productsService.getAllProducts());
          const exists = existingProducts.some(p => p.slug === legacy.slug);

          if (exists) {
            console.log(`⏭️ Product already exists: ${legacy.nombre}`);
            skipCount++;
            continue;
          }

          // Add product to Firestore
          await this.productsService.addProduct(productData as any);
          console.log(`✅ Migrated: ${legacy.nombre}`);
          successCount++;

          // Small delay to avoid rate limiting
          await this.delay(100);

        } catch (error: any) {
          console.error(`❌ Failed to migrate ${legacy.nombre}:`, error.message);
          errorCount++;
        }
      }

      console.log('\n📊 Migration Summary:');
      console.log(`✅ Successfully migrated: ${successCount}`);
      console.log(`⏭️ Skipped (already exist or missing data): ${skipCount}`);
      console.log(`❌ Failed: ${errorCount}`);
      console.log(`📦 Total processed: ${legacyProducts.length}`);

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Extract material name from product name
   * E.g., "Black Gold Premium" -> "Black Gold"
   */
  private extractMaterialName(productName: string): string {
    // Remove common suffixes
    return productName
      .replace(/\s+(Premium|Natural|Elegance)$/i, '')
      .trim();
  }

  /**
   * Convert string to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
