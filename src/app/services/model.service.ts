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
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Model } from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class ModelService {
  private firestore = inject(Firestore);

  /**
   * Get all models
   */
  getAllModels(): Observable<Model[]> {
    const modelsCollection = collection(this.firestore, 'materials'); // Keep 'materials' collection name for backwards compatibility
    const q = query(modelsCollection, orderBy('name', 'asc'));
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Model))
      )
    );
  }

  /**
   * Get active models only
   */
  getActiveModels(): Observable<Model[]> {
    const modelsCollection = collection(this.firestore, 'materials'); // Keep 'materials' collection name for backwards compatibility
    const q = query(
      modelsCollection, 
      where('active', '==', true),
      orderBy('name', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Model))
      )
    );
  }

  /**
   * Get single model by ID
   */
  getModel(id: string): Observable<Model | null> {
    const docRef = this.modelDoc(id);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() as any } as Model : null)
    );
  }

  /**
   * Get model by slug
   */
  getModelBySlug(slug: string): Observable<Model | null> {
    const modelsCollection = collection(this.firestore, 'materials'); // Keep 'materials' collection name for backwards compatibility
    const q = query(modelsCollection, where('slug', '==', slug));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() as any } as Model;
      })
    );
  }

  /**
   * Create new model
   */
  async addModel(model: Omit<Model, 'id'>): Promise<string> {
    const modelsCollection = collection(this.firestore, 'materials'); // Keep 'materials' collection name for backwards compatibility
    const now = Timestamp.now();
    const data = this.removeUndefinedFields({
      ...model,
      active: model.active !== false,
      createdAt: now,
      updatedAt: now
    });
    const docRef = await addDoc(modelsCollection, data as any);
    return docRef.id;
  }

  /**
   * Update existing model
   */
  async updateModel(id: string, updates: Partial<Model>): Promise<void> {
    const docRef = this.modelDoc(id);
    const cleanedUpdates = this.removeUndefinedFields({
      ...updates,
      updatedAt: Timestamp.now()
    });
    await updateDoc(docRef, cleanedUpdates as any);
  }

  /**
   * Delete model
   */
  async deleteModel(id: string): Promise<void> {
    const docRef = this.modelDoc(id);
    await deleteDoc(docRef);
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const modelsCollection = collection(this.firestore, 'materials'); // Keep 'materials' collection name for backwards compatibility
    const q = query(modelsCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return false;
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    return true;
  }

  /**
   * Remove undefined fields from object to prevent Firestore errors
   */
  private removeUndefinedFields(obj: any): any {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    }
    return cleaned;
  }

  private modelDoc(id: string) {
    return doc(this.firestore, `materials/${id}`); // Keep 'materials' collection name for backwards compatibility
  }
}
