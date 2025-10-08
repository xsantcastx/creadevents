import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');

  /**
   * Get all products
   */
  getAllProducts(): Observable<Product[]> {
    const q = query(this.productsCollection, orderBy('name', 'asc'));
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
    const q = query(
      this.productsCollection, 
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
    const q = query(
      this.productsCollection,
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
      const docRef = await addDoc(this.productsCollection, productData);
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
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
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
      const q = query(
        this.productsCollection,
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
