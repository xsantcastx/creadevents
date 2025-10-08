import { Timestamp } from '@angular/fire/firestore';

export interface Product {
  id?: string;             // Firestore document ID
  name: string;            // "Saint Laurent"
  slug: string;            // "saint-laurent" (URL-friendly)
  grosor: '12mm' | '15mm' | '20mm';  // Thickness
  size: string;            // e.g., "160×320cm"
  imageUrl: string;        // Main product image URL
  description?: string;    // Product description
  price?: number;          // Price per unit
  stock?: number;          // Available stock
  sku?: string;            // SKU code
  features?: string[];     // Product features
  active?: boolean;        // Is product active/visible
  createdAt?: Timestamp;   // Creation timestamp
  updatedAt?: Timestamp;   // Last update timestamp
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CartState {
  items: CartItem[];
}
