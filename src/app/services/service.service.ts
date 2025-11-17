import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ServiceItem {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  bullets: string[];
  image?: string;
  order?: number;
  anchor?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private firestore = inject(Firestore);
  private collectionRef = collection(this.firestore, 'services');

  getServices(): Observable<ServiceItem[]> {
    const q = query(this.collectionRef, orderBy('order', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<ServiceItem[]>;
  }

  async addService(item: ServiceItem) {
    const payload = { ...item, createdAt: serverTimestamp() };
    return addDoc(this.collectionRef, payload);
  }

  async updateService(id: string, item: Partial<ServiceItem>) {
    const ref = doc(this.firestore, 'services', id);
    return updateDoc(ref, { ...item, updatedAt: serverTimestamp() });
  }

  async deleteService(id: string) {
    const ref = doc(this.firestore, 'services', id);
    return deleteDoc(ref);
  }
}
