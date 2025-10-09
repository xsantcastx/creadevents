import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  CollectionReference,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Category } from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private firestore = inject(Firestore);
  private categoriesCollection = collection(this.firestore, 'categories') as CollectionReference<Category>;

  /**
   * Get all categories
   */
  getAllCategories(): Observable<Category[]> {
    const q = query(this.categoriesCollection, orderBy('order', 'asc'));
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  /**
   * Get active categories only
   */
  getActiveCategories(): Observable<Category[]> {
    const q = query(
      this.categoriesCollection, 
      where('active', '==', true),
      orderBy('order', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  /**
   * Get single category by ID
   */
  getCategory(id: string): Observable<Category | null> {
    const docRef = doc(this.categoriesCollection, id) as DocumentReference<Category>;
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } : null)
    );
  }

  /**
   * Get category by slug
   */
  getCategoryBySlug(slug: string): Observable<Category | null> {
    const q = query(this.categoriesCollection, where('slug', '==', slug));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      })
    );
  }

  /**
   * Create new category
   */
  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    const now = Timestamp.now();
    const data = {
      ...category,
      active: category.active !== false,
      createdAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(this.categoriesCollection, data);
    return docRef.id;
  }

  /**
   * Update existing category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(this.categoriesCollection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(this.categoriesCollection, id);
    await deleteDoc(docRef);
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const q = query(this.categoriesCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return false;
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    return true;
  }
}
