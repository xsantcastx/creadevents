import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  thickness: string;
  image?: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: ShippingAddress;
  tracking?: string;
  notes?: string;
}

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './orders-admin.page.html',
  styleUrl: './orders-admin.page.scss'
})
export class OrdersAdminComponent implements OnInit {
  orders: Order[] = [];
  selectedStatus: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'all';
  searchQuery = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Detail modal
  showDetailModal = false;
  selectedOrder: Order | null = null;

  // Status update
  showStatusModal = false;
  orderToUpdate: Order | null = null;
  newStatus: Order['status'] = 'pending';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    this.authService.userProfile$.subscribe(profile => {
      if (!profile || profile.role !== 'admin') {
        console.log('Access denied: User is not admin');
        this.router.navigate(['/']);
      }
    });

    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    
    // TODO: Replace with actual Firestore query
    // const ordersRef = collection(this.firestore, 'orders');
    // const q = query(ordersRef, orderBy('date', 'desc'));
    // onSnapshot(q, (snapshot) => {
    //   this.orders = snapshot.docs.map(doc => ({
    //     id: doc.id,
    //     ...doc.data()
    //   } as Order));
    //   this.isLoading = false;
    // });

    // Mock data for now
    setTimeout(() => {
      this.orders = this.getMockOrders();
      this.isLoading = false;
    }, 500);
  }

  get filteredOrders(): Order[] {
    let filtered = [...this.orders];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  getStatusCount(status: string): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.status === status).length;
  }

  getStatusClass(status: Order['status']): string {
    const classes: Record<Order['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status];
  }

  openDetailModal(order: Order): void {
    this.selectedOrder = order;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  openStatusModal(order: Order): void {
    this.orderToUpdate = order;
    this.newStatus = order.status;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.orderToUpdate = null;
  }

  updateStatus(): void {
    if (!this.orderToUpdate) return;

    // TODO: Replace with actual Firestore update
    // const orderRef = doc(this.firestore, 'orders', this.orderToUpdate.id);
    // await updateDoc(orderRef, {
    //   status: this.newStatus,
    //   updatedAt: serverTimestamp()
    // });

    // Update mock data
    const index = this.orders.findIndex(o => o.id === this.orderToUpdate!.id);
    if (index !== -1) {
      this.orders[index].status = this.newStatus;
    }

    this.successMessage = 'admin.status_updated';
    setTimeout(() => this.successMessage = '', 3000);
    
    this.closeStatusModal();
  }

  logout(): void {
    this.authService.signOutUser().then(() => {
      this.router.navigate(['/']);
    });
  }

  private getMockOrders(): Order[] {
    return [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        date: new Date('2024-01-15'),
        status: 'delivered',
        total: 2850.00,
        customer: {
          name: 'María García',
          email: 'maria.garcia@email.com',
          phone: '+34 612 345 678'
        },
        shipping: {
          street: 'Calle Mayor 123',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España'
        },
        tracking: 'TRK123456789',
        items: [
          {
            productId: '1',
            name: 'Arctic White',
            quantity: 15,
            price: 190.00,
            thickness: '12mm',
            image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400'
          }
        ]
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        date: new Date('2024-01-18'),
        status: 'shipped',
        total: 4200.00,
        customer: {
          name: 'Carlos Rodríguez',
          email: 'carlos.r@email.com',
          phone: '+34 623 456 789'
        },
        shipping: {
          street: 'Av. Diagonal 456',
          city: 'Barcelona',
          state: 'Cataluña',
          postalCode: '08008',
          country: 'España'
        },
        tracking: 'TRK987654321',
        items: [
          {
            productId: '2',
            name: 'Carrara Marble',
            quantity: 20,
            price: 210.00,
            thickness: '15mm',
            image: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?w=400'
          }
        ]
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        date: new Date('2024-01-20'),
        status: 'processing',
        total: 3600.00,
        customer: {
          name: 'Ana Martínez',
          email: 'ana.martinez@email.com',
          phone: '+34 634 567 890'
        },
        shipping: {
          street: 'Plaza España 789',
          city: 'Valencia',
          state: 'Valencia',
          postalCode: '46001',
          country: 'España'
        },
        items: [
          {
            productId: '4',
            name: 'Black Granite',
            quantity: 12,
            price: 300.00,
            thickness: '20mm',
            image: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=400'
          }
        ]
      },
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        date: new Date('2024-01-22'),
        status: 'pending',
        total: 5700.00,
        customer: {
          name: 'Juan López',
          email: 'juan.lopez@email.com',
          phone: '+34 645 678 901'
        },
        shipping: {
          street: 'Gran Vía 321',
          city: 'Sevilla',
          state: 'Andalucía',
          postalCode: '41001',
          country: 'España'
        },
        items: [
          {
            productId: '3',
            name: 'Concrete Grey',
            quantity: 30,
            price: 190.00,
            thickness: '12mm',
            image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400'
          }
        ]
      },
      {
        id: '5',
        orderNumber: 'ORD-2024-005',
        date: new Date('2024-01-10'),
        status: 'cancelled',
        total: 1800.00,
        customer: {
          name: 'Laura Sánchez',
          email: 'laura.sanchez@email.com',
          phone: '+34 656 789 012'
        },
        shipping: {
          street: 'Paseo Gracia 654',
          city: 'Bilbao',
          state: 'País Vasco',
          postalCode: '48001',
          country: 'España'
        },
        items: [
          {
            productId: '5',
            name: 'Calacatta Gold',
            quantity: 8,
            price: 225.00,
            thickness: '15mm',
            image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400'
          }
        ],
        notes: 'Cliente solicitó cancelación por cambio de proyecto'
      }
    ];
  }
}
