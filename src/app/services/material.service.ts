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
import { Material } from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private firestore = inject(Firestore);
  private materialsCollection = collection(this.firestore, 'materials') as CollectionReference<Material>;

  /**
   * Get all materials
   */
  getAllMaterials(): Observable<Material[]> {
    const q = query(this.materialsCollection, orderBy('name', 'asc'));
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  /**
   * Get active materials only
   */
  getActiveMaterials(): Observable<Material[]> {
    const q = query(
      this.materialsCollection, 
      where('active', '==', true),
      orderBy('name', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  /**
   * Get single material by ID
   */
  getMaterial(id: string): Observable<Material | null> {
    const docRef = doc(this.materialsCollection, id) as DocumentReference<Material>;
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() } : null)
    );
  }

  /**
   * Get material by slug
   */
  getMaterialBySlug(slug: string): Observable<Material | null> {
    const q = query(this.materialsCollection, where('slug', '==', slug));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      })
    );
  }

  /**
   * Create new material
   */
  async addMaterial(material: Omit<Material, 'id'>): Promise<string> {
    const now = Timestamp.now();
    const data = {
      ...material,
      active: material.active !== false,
      createdAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(this.materialsCollection, data);
    return docRef.id;
  }

  /**
   * Update existing material
   */
  async updateMaterial(id: string, updates: Partial<Material>): Promise<void> {
    const docRef = doc(this.materialsCollection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Delete material
   */
  async deleteMaterial(id: string): Promise<void> {
    const docRef = doc(this.materialsCollection, id);
    await deleteDoc(docRef);
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const q = query(this.materialsCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return false;
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    return true;
  }
}
