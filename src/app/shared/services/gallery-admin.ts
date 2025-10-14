import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  categoria: string;
  proyecto?: string;
  ubicacion?: string;
  producto?: string;
  fechaSubida: Date;
  activo: boolean;
}

export interface UploadResponse {
  success: boolean;
  item?: GalleryItem;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GalleryAdminService {
  private readonly storageKey = 'theluxmining_gallery_items';
  private itemsSubject = new BehaviorSubject<GalleryItem[]>([]);
  
  readonly items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadItems();
  }

  // Load items from localStorage (in real app, this would be from API)
  private loadItems(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const items = JSON.parse(stored).map((item: any) => ({
          ...item,
          fechaSubida: new Date(item.fechaSubida)
        }));
        this.itemsSubject.next(items);
      } else {
        // Initialize with default items if none exist
        this.initializeDefaultItems();
      }
    } catch (error) {
      console.error('Error loading gallery items:', error);
      this.initializeDefaultItems();
    }
  }

  // Save items to localStorage
  private saveItems(items: GalleryItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.itemsSubject.next(items);
    } catch (error) {
      console.error('Error saving gallery items:', error);
    }
  }

  // Initialize with default gallery items
  private initializeDefaultItems(): void {
    const defaultItems: GalleryItem[] = [
      {
        id: '1',
        src: '/assets/Bathroom.jpeg',
        alt: 'Baño moderno con superficies porcelánicas',
        categoria: 'banos',
        proyecto: 'Residencia Valencia',
        ubicacion: 'Valencia',
        producto: 'Porcelánico 12mm',
        fechaSubida: new Date('2024-01-15'),
        activo: true
      },
      {
        id: '2',
        src: '/assets/Bathroom2.jpeg',
        alt: 'Baño minimalista con acabados premium',
        categoria: 'banos',
        proyecto: 'Villa Mediterránea',
        ubicacion: 'Alicante',
        producto: 'Porcelánico 15mm',
        fechaSubida: new Date('2024-02-10'),
        activo: true
      }
    ];
    
    this.saveItems(defaultItems);
  }

  // Upload new gallery item (simulates file upload)
  uploadItem(file: File, metadata: Partial<GalleryItem>): Observable<UploadResponse> {
    return new Observable(observer => {
      // Simulate file upload delay
      setTimeout(() => {
        try {
          // In real app, this would upload to cloud storage
          const reader = new FileReader();
          reader.onload = (e) => {
            const newItem: GalleryItem = {
              id: Date.now().toString(),
              src: e.target?.result as string,
              alt: metadata.alt || 'Nueva imagen',
              categoria: metadata.categoria || 'general',
              proyecto: metadata.proyecto,
              ubicacion: metadata.ubicacion,
              producto: metadata.producto,
              fechaSubida: new Date(),
              activo: true
            };

            const currentItems = this.itemsSubject.value;
            const updatedItems = [...currentItems, newItem];
            this.saveItems(updatedItems);

            observer.next({ success: true, item: newItem });
            observer.complete();
          };
          
          reader.onerror = () => {
            observer.next({ success: false, error: 'Error reading file' });
            observer.complete();
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          observer.next({ success: false, error: 'Upload failed' });
          observer.complete();
        }
      }, 1500); // Simulate upload time
    });
  }

  // Get items by category
  getItemsByCategory(categoria: string): Observable<GalleryItem[]> {
    return this.items$.pipe(
      map(items => 
        categoria === 'todos' 
          ? items.filter(item => item.activo)
          : items.filter(item => item.categoria === categoria && item.activo)
      )
    );
  }

  // Delete item
  deleteItem(id: string): Observable<boolean> {
    const currentItems = this.itemsSubject.value;
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    this.saveItems(updatedItems);
    return of(true).pipe(delay(300));
  }

  // Get available categories
  getCategories(): string[] {
    return [
      'banos',
      'cocinas', 
      'salones',
      'dormitorios',
      'exteriores',
      'comercial',
      'hoteles',
      'oficinas'
    ];
  }
}