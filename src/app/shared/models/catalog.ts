export type Calibre = '10' | '12';

export interface ProductLine {
  slug: string;
  nombre: string;
  calibre: Calibre;
  descripcion: string;
  foto: string;
  icono?: string;
}

export interface Product {
  id: string;
  nombre: string;
  linea: string;
  calibre: Calibre;
  material: string;
  descripcion: string;
  acabados: string[];
  formatos: string[];
  colorPrincipal: string;
  imagen: string;
  fichaTecnica: string;
  destacado?: boolean;
}

export interface TechnicalSheet {
  linea: string;
  calibre: Calibre;
  titulo: string;
  descripcion: string;
  propiedades: Array<{ etiqueta: string; valor: string }>;
  enlaceDescarga: string;
}

export interface GalleryItem {
  id: string;
  titulo: string;
  ubicacion: string;
  descripcion: string;
  materiales: string[];
  imagen: string;
}

export interface CartItem {
  producto: Product;
  cantidad: number;
}

export interface CustomerInfo {
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  mensaje?: string;
}
