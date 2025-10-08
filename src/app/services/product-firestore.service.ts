import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface FirestoreProduct {
  id?: string;
  name: string;
  slug: string;
  thickness: '12mm' | '15mm' | '20mm';
  dimensions: string;
  imageUrl: string;
  description?: string;
  applications?: string[];
  category?: string;
  price?: number;
  available?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductFirestoreService {
  private firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');

  // Get all products
  getProducts(): Observable<FirestoreProduct[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<FirestoreProduct[]>;
  }

  // Get products by thickness
  getProductsByThickness(thickness: string): Observable<FirestoreProduct[]> {
    const q = query(
      this.productsCollection,
      where('thickness', '==', thickness),
      where('available', '==', true),
      orderBy('name')
    );
    return collectionData(q, { idField: 'id' }) as Observable<FirestoreProduct[]>;
  }

  // Get single product
  getProduct(id: string): Observable<FirestoreProduct> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }) as Observable<FirestoreProduct>;
  }

  // Get product by slug
  getProductBySlug(slug: string): Observable<FirestoreProduct[]> {
    const q = query(this.productsCollection, where('slug', '==', slug), limit(1));
    return collectionData(q, { idField: 'id' }) as Observable<FirestoreProduct[]>;
  }

  // Admin: Add product
  async addProduct(product: Omit<FirestoreProduct, 'id'>): Promise<string> {
    const docRef = await addDoc(this.productsCollection, {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      available: product.available ?? true
    });
    return docRef.id;
  }

  // Admin: Update product
  async updateProduct(id: string, product: Partial<FirestoreProduct>): Promise<void> {
    const productDoc = doc(this.firestore, `products/${id}`);
    await updateDoc(productDoc, {
      ...product,
      updatedAt: new Date()
    });
  }

  // Admin: Delete product
  async deleteProduct(id: string): Promise<void> {
    const productDoc = doc(this.firestore, `products/${id}`);
    await deleteDoc(productDoc);
  }
}
