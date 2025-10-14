import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QuerySnapshot
} from '@angular/fire/firestore';

export type AdminActivityType = 'order' | 'product' | 'gallery' | 'user';

export interface AdminActivityItem {
  id: string;
  type: AdminActivityType;
  description: string;
  timestamp: Date;
  icon: string;
}

export interface AdminDashboardSnapshot {
  totalProducts: number;
  totalOrders: number;
  totalGalleryImages: number;
  totalUsers: number;
  pendingOrders: number;
  recentActivity: AdminActivityItem[];
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private firestore = inject(Firestore);

  async getDashboardStats(): Promise<AdminDashboardSnapshot> {
    try {
      const [
        totalProducts,
        ordersSummary,
        totalGalleryImages,
        totalUsers,
        recentActivity
      ] = await Promise.all([
        this.getCollectionCount('products'),
        this.getOrdersSummary(),
        this.getGalleryImagesCount(),  // Use custom method for gallery count
        this.getCollectionCount('users'),
        this.getRecentActivity()
      ]);

      return {
        totalProducts,
        totalOrders: ordersSummary.total,
        totalGalleryImages,
        totalUsers,
        pendingOrders: ordersSummary.pending,
        recentActivity
      };
    } catch (error) {
      console.error('[AdminDashboardService] Error in getDashboardStats:', error);
      // Return safe defaults on error
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalGalleryImages: 0,
        totalUsers: 0,
        pendingOrders: 0,
        recentActivity: []
      };
    }
  }

  private async getCollectionCount(path: string): Promise<number> {
    const snapshot = await getDocs(collection(this.firestore, path));
    return snapshot.size;
  }

  private async getGalleryImagesCount(): Promise<number> {
    // Count media items where relatedEntityType = 'gallery'
    const mediaRef = collection(this.firestore, 'media');
    const snapshot = await getDocs(mediaRef);
    
    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data?.['relatedEntityType'] === 'gallery') {
        count++;
      }
    });
    
    return count;
  }

  private async getOrdersSummary(): Promise<{ total: number; pending: number }> {
    const snapshot = await getDocs(collection(this.firestore, 'orders'));
    let pending = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data() as any;
      const status = (data?.status || 'pending').toString().toLowerCase();
      if (status === 'pending') {
        pending += 1;
      }
    });

    return {
      total: snapshot.size,
      pending
    };
  }

  private async getRecentActivity(): Promise<AdminActivityItem[]> {
    const [orderEvents, productEvents] = await Promise.all([
      this.getRecentOrdersActivity(5),
      this.getRecentProductsActivity(5)
    ]);

    return [...orderEvents, ...productEvents]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }

  private async getRecentOrdersActivity(limitCount: number): Promise<AdminActivityItem[]> {
    const snapshot = await this.safeQuery(
      'orders',
      [orderBy('updatedAt', 'desc'), limit(limitCount)],
      'createdAt',
      limitCount
    );

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data() as any;
      const orderNumber = data?.orderNumber || docSnap.id;
      const status = (data?.status || 'pending').toString();
      const total = typeof data?.total === 'number' ? data.total : null;
      const timestamp = this.extractTimestamp(data?.updatedAt || data?.createdAt);

      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      const amountLabel = total !== null ? ` • ${total.toLocaleString()}` : '';

      return {
        id: docSnap.id,
        type: 'order' as AdminActivityType,
        description: `Pedido ${orderNumber} • ${statusLabel}${amountLabel}`,
        timestamp,
        icon: 'order'
      };
    });
  }

  private async getRecentProductsActivity(limitCount: number): Promise<AdminActivityItem[]> {
    const snapshot = await this.safeQuery(
      'products',
      [orderBy('updatedAt', 'desc'), limit(limitCount)],
      'createdAt',
      limitCount
    );

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data() as any;
      const name = data?.name || 'Producto';
      const grosor = data?.specs?.grosor || data?.grosor || '';
      const timestamp = this.extractTimestamp(data?.updatedAt || data?.createdAt);

      return {
        id: docSnap.id,
        type: 'product' as AdminActivityType,
        description: grosor ? `${name} (${grosor}) actualizado` : `${name} actualizado`,
        timestamp,
        icon: 'product'
      };
    });
  }

  /**
   * Attempt to run a Firestore query and fall back to an alternate orderBy field
   * when composite indexes are missing.
   */
  private async safeQuery(
    collectionPath: string,
    constraints: QueryConstraint[],
    fallbackOrderField: string,
    limitCount: number
  ): Promise<QuerySnapshot<any>> {
    const ref = collection(this.firestore, collectionPath);
    try {
      return await getDocs(query(ref, ...constraints));
    } catch (error) {
      // Fallback to alternate ordering (usually createdAt) when index is missing
      console.warn(
        `[AdminDashboardService] Falling back to ${fallbackOrderField} for ${collectionPath}:`,
        (error as Error).message
      );
      return getDocs(query(ref, orderBy(fallbackOrderField, 'desc'), limit(limitCount)));
    }
  }

  private extractTimestamp(value: any): Date {
    if (!value) {
      return new Date();
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (value?.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }

    if (typeof value === 'number') {
      return new Date(value);
    }

    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? new Date() : new Date(parsed);
    }

    if (value?.seconds) {
      return new Date(value.seconds * 1000);
    }

    return new Date();
  }
}
