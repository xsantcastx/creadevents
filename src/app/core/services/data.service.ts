import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

export interface ProductoMock {
  nombre: string;
  slug: string;
  grosor: string;  // Dynamic category identifier
  medida?: string;
  cover: string;
  descripcion?: string;
  aplicaciones?: string[];
}

export interface ProductosData {
  items: ProductoMock[];
}

export interface GaleriaItem {
  src: string;
  alt: string;
  producto?: string;
  proyecto?: string;
  ubicacion?: string;
}

export interface CategoriaGaleria {
  slug: string;
  titulo: string;
  items: GaleriaItem[];
}

export interface GaleriaData {
  categorias: CategoriaGaleria[];
}

export interface AcabadoSuperficie {
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface FichaTecnica {
  nombre: string;
  url: string;
  tamano: string;
  descripcion: string;
}

export interface PackingInfo {
  grosor: string;
  piezasPorPallet: number;
  pesoAprox: string;
  dimensionesPallet: string;
  volumen: string;
}

export interface AcabadoBorde {
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface FijacionesFachada {
  descripcion: string;
  imagen: string;
  ventajas: string[];
}

export interface Mantenimiento {
  limpieza: string;
  frecuencia: string;
  productos: string[];
  evitar: string[];
}

// Removed DatosTecnicosData - ceramic tile data no longer needed

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  getProductos(): Observable<ProductosData> {
    if (!isPlatformBrowser(this.platformId)) {
      // Return empty data during SSR
      return of({ items: [] });
    }
    return this.http.get<ProductosData>('/assets/data/productos.json');
  }

  getGaleria(): Observable<GaleriaData> {
    if (!isPlatformBrowser(this.platformId)) {
      // Return empty data during SSR
      return of({ categorias: [] });
    }
    return this.http.get<GaleriaData>('/assets/data/galeria.json');
  }

  // Removed getDatosTecnicos() - ceramic tile technical data no longer needed
  // Removed getProductosByGrosor(), getProductoBySlug() - legacy helper methods for ceramic tiles
  
  getCategoriaBySlug(categorias: CategoriaGaleria[], slug: string): CategoriaGaleria | undefined {
    return categorias.find(c => c.slug === slug);
  }
}