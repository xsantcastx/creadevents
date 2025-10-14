import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map, firstValueFrom } from 'rxjs';
import { Product } from '../models/product';
import { Product as CatalogProduct, TemplateComposition, ProductFormData } from '../models/catalog';
import { CategoryService } from './category.service';
import { MaterialService } from './material.service';
import { TemplateService } from './template.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private firestore = inject(Firestore);
  private categoryService = inject(CategoryService);
  private materialService = inject(MaterialService);
  private templateService = inject(TemplateService);

  /**
   * Generate auto-filled data for a product based on templates
   * This is the magic that makes admin life easier!
   */
  async generateProductData(formData: ProductFormData): Promise<TemplateComposition> {
    try {
      // Fetch category and material in parallel
      const [category, material] = await Promise.all([
        firstValueFrom(this.categoryService.getCategory(formData.categoryId)),
        firstValueFrom(this.materialService.getMaterial(formData.materialId))
      ]);

      if (!category || !material) {
        throw new Error('Category or Material not found');
      }

      // Prepare placeholders for template rendering
      const placeholders: Record<string, string> = {
        name: formData.name,
        material: material.name,
        grosor: category.slug, // '12mm', '15mm', '20mm'
        size: category.defaultSpecOverrides?.size || '160×320cm',
        aplicaciones: formData.specs?.usage?.join(', ') || 'cocinas, baños, fachadas',
        // Add more placeholders as needed
        finish: formData.finish || 'Pulido',
        thickness: category.defaultSpecOverrides?.thicknessMm?.toString() || '12'
      };

      // Compose templates
      const composition = await this.templateService.composeTemplates(
        formData.categoryId,
        formData.materialId,
        placeholders
      );

      // Merge specs from category defaults + composition + user input
      const finalSpecs = {
        ...category.defaultSpecOverrides,
        ...composition.specs,
        ...formData.specs
      };

      // Merge tags from material defaults + user input
      const finalTags = [
        ...(material.defaultTags || []),
        ...(composition.tags || []),
        ...(formData.tags || [])
      ];

      return {
        description: composition.description,
        seoTitle: composition.seoTitle,
        seoMeta: composition.seoMeta,
        specs: finalSpecs,
        tags: [...new Set(finalTags)] // Remove duplicates
      };
    } catch (error) {
      console.error('Error generating product data:', error);
      throw error;
    }
  }

  /**
   * Get all products
   */
  getAllProducts(): Observable<Product[]> {
    const productsCol = collection(this.firestore, 'products');
    const q = query(productsCol, orderBy('name', 'asc'));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product)))
    );
  }

  /**
   * Get products by thickness
   */
  getProductsByGrosor(grosor: string): Observable<Product[]> {
    const productsCol = collection(this.firestore, 'products');
    const q = query(
      productsCol, 
      where('grosor', '==', grosor),
      orderBy('name', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product)))
    );
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: string): Observable<Product | null> {
    const docRef = doc(this.firestore, `products/${id}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
      })
    );
  }

  /**
   * Get a product by slug and thickness
   */
  getProductBySlug(slug: string, grosor: string): Observable<Product | null> {
    const productsCol = collection(this.firestore, 'products');
    const q = query(
      productsCol,
      where('slug', '==', slug),
      where('grosor', '==', grosor)
    );
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Product;
        }
        return null;
      })
    );
  }

  /**
   * Add a new product
   */
  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    try {
      const productData = {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Clean undefined values (Firestore doesn't accept undefined)
      const cleanedData = this.removeUndefinedFields(productData);
      
      const productsCol = collection(this.firestore, 'products');
      const docRef = await addDoc(productsCol, cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `products/${id}`);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // Clean undefined values (Firestore doesn't accept undefined)
      const cleanedData = this.removeUndefinedFields(updateData);
      
      await updateDoc(docRef, cleanedData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Remove undefined fields from object (recursively)
   * Firestore doesn't accept undefined values
   */
  private removeUndefinedFields(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedFields(item));
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (value !== undefined) {
            cleaned[key] = this.removeUndefinedFields(value);
          }
        }
      }
      return cleaned;
    }

    return obj;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `products/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Check if a slug already exists for a given thickness
   */
  async slugExists(slug: string, grosor: string, excludeId?: string): Promise<boolean> {
    try {
      const productsCol = collection(this.firestore, 'products');
      const q = query(
        productsCol,
        where('slug', '==', slug),
        where('grosor', '==', grosor)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return false;
      }

      // If excludeId is provided, check if the found document is different
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId);
      }

      return true;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }
}
