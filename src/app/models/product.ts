export interface Product {
  id: string;              // e.g. "12mm-saint-laurent"
  name: string;            // "Saint Laurent"
  sku?: string;            // optional
  thickness?: '12mm'|'15mm'|'20mm';
  category?: string;       // e.g., "160×320"
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CartState {
  items: CartItem[];
}