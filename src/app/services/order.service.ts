import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CartItem } from '../models/product';

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  company?: string;
  items: CartItem[];
  message?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  totalItems: number;
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private ordersCollection = collection(this.firestore, 'orders');

  // Create new order
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.ordersCollection, {
      ...orderData,
      createdAt: new Date(),
      status: 'pending'
    });
    return docRef.id;
  }

  // Get orders for a specific user
  getUserOrders(userId: string): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  // Get all orders (admin)
  getAllOrders(): Observable<Order[]> {
    const q = query(this.ordersCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  // Get single order
  getOrder(id: string): Observable<Order> {
    const orderDoc = doc(this.firestore, `orders/${id}`);
    return docData(orderDoc, { idField: 'id' }) as Observable<Order>;
  }

  // Update order status (admin)
  async updateOrderStatus(id: string, status: Order['status'], adminNotes?: string): Promise<void> {
    const orderDoc = doc(this.firestore, `orders/${id}`);
    await updateDoc(orderDoc, {
      status,
      adminNotes: adminNotes || '',
      updatedAt: new Date()
    });
  }

  // Update order
  async updateOrder(id: string, data: Partial<Order>): Promise<void> {
    const orderDoc = doc(this.firestore, `orders/${id}`);
    await updateDoc(orderDoc, {
      ...data,
      updatedAt: new Date()
    });
  }
}
