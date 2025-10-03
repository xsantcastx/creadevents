import { Injectable, inject, signal } from '@angular/core';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { ImageAssetService, ImageDoc } from './image-asset.service';

export type Section = 'hero' | 'gallery' | 'services' | 'about' | 'footer';
export type NotificationLevel = 'success' | 'error' | 'warning' | 'info';

export interface SlotDoc {
  key: string;       // e.g. "home.header"
  label: string;     // human-friendly name for admins
  section?: Section; // optional: restrict intended section (hero/gallery/etc.)
  imageId?: string;  // Firestore id from /images
  url?: string;      // resolved URL from the selected image
  alt?: string;
  caption?: string;
  updatedAt?: any;   // Firestore Timestamp
}

export interface Notification {
  id: string;
  message: string;
  level: NotificationLevel;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CmsService {
  private db = getFirestore();
  
  // User feedback signals
  notifications = signal<Notification[]>([]);
  loading = signal<boolean>(false);
  lastError = signal<string | null>(null);

  private showNotification(message: string, level: NotificationLevel = 'info') {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      level,
      timestamp: Date.now()
    };
    
    this.notifications.update(current => [...current, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.notifications.update(current => 
        current.filter(n => n.id !== notification.id)
      );
    }, 5000);
  }

  dismissNotification(id: string) {
    this.notifications.update(current => 
      current.filter(n => n.id !== id)
    );
  }

  clearAllNotifications() {
    this.notifications.set([]);
  }

  private async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> {
    try {
      this.loading.set(true);
      this.lastError.set(null);
      
      const result = await operation();
      
      // Show success notification for write operations
      if (operationName.includes('save') || operationName.includes('update') || operationName.includes('delete')) {
        this.showNotification(`✅ ${operationName} completed successfully`, 'success');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`CmsService ${operationName} failed:`, error);
      
      this.lastError.set(errorMessage);
      this.showNotification(`❌ ${operationName} failed: ${errorMessage}`, 'error');
      
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async listSlots(section?: Section): Promise<SlotDoc[]> {
    const result = await this.executeWithErrorHandling(async () => {
      const col = collection(this.db, 'slots');
      const q = section 
        ? query(col, where('section', '==', section), orderBy('key', 'asc')) 
        : query(col, orderBy('key', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ key: d.id, ...(d.data() as any) }));
    }, 'Loading slots');
    
    return result ?? [];
  }

  async getSlot(key: string): Promise<SlotDoc | null> {
    return await this.executeWithErrorHandling(async () => {
      const ref = doc(this.db, 'slots', key);
      const snap = await getDoc(ref);
      return snap.exists() ? ({ key, ...(snap.data() as any) }) : null;
    }, `Loading slot ${key}`);
  }

  async upsertSlot(slot: SlotDoc): Promise<boolean> {
    const result = await this.executeWithErrorHandling(async () => {
      const ref = doc(this.db, 'slots', slot.key);
      await setDoc(ref, { ...slot, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    }, `Saving slot ${slot.label || slot.key}`);
    
    return result === true;
  }

  async assignSlot(key: string, img: ImageDoc): Promise<boolean> {
    const result = await this.executeWithErrorHandling(async () => {
      const ref = doc(this.db, 'slots', key);
      await setDoc(ref, {
        key,
        imageId: img.id,
        url: img.url,
        alt: img.alt ?? '',
        caption: img.caption ?? '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    }, `Assigning image to slot ${key}`);
    
    return result === true;
  }

  async clearSlot(key: string): Promise<boolean> {
    const result = await this.executeWithErrorHandling(async () => {
      const ref = doc(this.db, 'slots', key);
      await setDoc(ref, { 
        imageId: null, 
        url: null, 
        alt: '', 
        caption: '', 
        updatedAt: serverTimestamp() 
      }, { merge: true });
      return true;
    }, `Clearing slot ${key}`);
    
    return result === true;
  }

  async deleteSlot(key: string): Promise<boolean> {
    const result = await this.executeWithErrorHandling(async () => {
      await deleteDoc(doc(this.db, 'slots', key));
      return true;
    }, `Deleting slot ${key}`);
    
    return result === true;
  }
}