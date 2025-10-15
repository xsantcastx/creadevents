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
import { Observable, combineLatest, map } from 'rxjs';

export interface FirestoreProduct {
  id?: string;
  name: string;
  slug: string;
  grosor?: string;  // Dynamic category identifier
  thickness?: string; // legacy support
  dimensions?: string;
  size?: string;
  imageUrl?: string;
  coverImage?: string;
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

  // Get all products
  getProducts(): Observable<FirestoreProduct[]> {
    const productsCol = collection(this.firestore, 'products');
    return collectionData(productsCol, { idField: 'id' }) as Observable<FirestoreProduct[]>;
  }

  // Get products by thickness
  getProductsByThickness(thickness: string): Observable<FirestoreProduct[]> {
    const productsRef = collection(this.firestore, 'products');
    const grosorQuery = query(productsRef, where('grosor', '==', thickness));
    const legacyQuery = query(productsRef, where('thickness', '==', thickness));

    const grosor$ = collectionData(grosorQuery, { idField: 'id' }) as Observable<FirestoreProduct[]>;
    const legacy$ = collectionData(legacyQuery, { idField: 'id' }) as Observable<FirestoreProduct[]>;

    return combineLatest([grosor$, legacy$]).pipe(
      map(([grosorResults, legacyResults]) => {
        const merged = [...grosorResults];
        legacyResults.forEach(product => {
          if (!merged.some(existing => existing.id === product.id)) {
            merged.push({ ...product, grosor: product.grosor ?? (product as any).thickness });
          }
        });
        return merged.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
      })
    );
  }

  // Get single product
  getProduct(id: string): Observable<FirestoreProduct> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }) as Observable<FirestoreProduct>;
  }

  // Get product by slug
  getProductBySlug(slug: string): Observable<FirestoreProduct[]> {
    const productsCol = collection(this.firestore, 'products');
    const q = query(productsCol, where('slug', '==', slug), limit(1));
    return collectionData(q, { idField: 'id' }) as Observable<FirestoreProduct[]>;
  }

  // Admin: Add product
  async addProduct(product: Omit<FirestoreProduct, 'id'>): Promise<string> {
    const productsCol = collection(this.firestore, 'products');
    const docRef = await addDoc(productsCol, {
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
