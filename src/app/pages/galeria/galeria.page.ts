import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CategoriaGaleria, GaleriaItem } from '../../core/services/data.service';
import { Firestore, collection, query, where, orderBy, getDocs, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Media } from '../../models/media';

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './galeria.page.html',
  styleUrl: './galeria.page.scss'
})
export class GaleriaPageComponent implements OnInit {
  categorias: CategoriaGaleria[] = [];
  categoriaActiva = 'todos';
  itemsVisible: GaleriaItem[] = [];
  modalItem: GaleriaItem | null = null;
  modalIndex = 0;
  isLoading = true;
  
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // Load gallery from Firestore only
    if (this.isBrowser) {
      this.loadGaleriaFromFirebase();
    } else {
      this.isLoading = false;
    }
  }

  private async loadGaleriaFromFirebase() {
    try {
      // Load all gallery media from Media collection (relatedEntityType='gallery')
      const mediaQuery = query(
        collection(this.firestore, 'media'),
        where('relatedEntityType', '==', 'gallery')
        // Note: orderBy removed to avoid index requirement - sorting in memory instead
      );
      
      const snapshot = await getDocs(mediaQuery);
      const mediaItems: Media[] = snapshot.docs
        .map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data() as Omit<Media, 'id'>
        }))
        .sort((a, b) => {
          // Sort by uploadedAt descending (newest first) in memory
          const dateA = a.uploadedAt instanceof Date ? a.uploadedAt : (a.uploadedAt as any).toDate();
          const dateB = b.uploadedAt instanceof Date ? b.uploadedAt : (b.uploadedAt as any).toDate();
          return dateB.getTime() - dateA.getTime();
        });
      
      console.log('📸 Gallery loaded from Firestore:', mediaItems.length, 'images');
      
      if (mediaItems.length > 0) {
        // Group media by tags (using tags as categories)
        this.categorias = this.groupMediaByTags(mediaItems);
        this.filtrarPorCategoria(this.categoriaActiva);
      } else {
        console.log('ℹ️ No gallery images found in Firestore');
        this.categorias = [];
        this.itemsVisible = [];
      }
      this.isLoading = false;
    } catch (error) {
      console.error('❌ Error loading gallery from Firebase:', error);
      this.categorias = [];
      this.itemsVisible = [];
      this.isLoading = false;
    }
  }

  // Group media by tags - Map to category structure
  private groupMediaByTags(mediaItems: Media[]): CategoriaGaleria[] {
    // Tag to category mapping
    const tagToCategoryMap: Record<string, { slug: string, titulo: string }> = {
      'kitchen': { slug: 'cocinas', titulo: 'Cocinas' },
      'bathroom': { slug: 'banos', titulo: 'Baños' },
      'facade': { slug: 'fachadas', titulo: 'Fachadas' },
      'industrial': { slug: 'industria', titulo: 'Industria' },
      'other': { slug: 'otros', titulo: 'Otros' }
    };

    // Group images by their first tag
    const categoriesMap = new Map<string, GaleriaItem[]>();

    mediaItems.forEach(media => {
      if (!media.tags || media.tags.length === 0) return;

      const firstTag = media.tags[0]; // Use first tag as category
      const category = tagToCategoryMap[firstTag];
      
      if (!category) return; // Skip if unknown tag

      if (!categoriesMap.has(category.slug)) {
        categoriesMap.set(category.slug, []);
      }

      categoriesMap.get(category.slug)!.push({
        src: media.url,
        alt: media.altText || media.caption || 'Proyecto TStone',
        producto: media.filename,
        proyecto: '',
        ubicacion: ''
      });
    });

    // Convert map to array of categories
    return Array.from(categoriesMap.entries()).map(([slug, items]) => {
      const categoryInfo = Object.values(tagToCategoryMap).find(cat => cat.slug === slug);
      return {
        slug,
        titulo: categoryInfo?.titulo || slug,
        items
      };
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaActiva = categoria;
    
    if (categoria === 'todos') {
      this.itemsVisible = this.categorias.flatMap(cat => cat.items);
    } else {
      const categoriaEncontrada = this.categorias.find(cat => cat.slug === categoria);
      this.itemsVisible = categoriaEncontrada ? categoriaEncontrada.items : [];
    }
    
    // Reset modal if open
    if (this.modalItem) {
      this.cerrarModal();
    }
  }

  abrirModal(item: GaleriaItem, index: number) {
    this.modalItem = item;
    this.modalIndex = index;
    
    // Prevent body scroll when modal is open
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrarModal() {
    this.modalItem = null;
    
    // Restore body scroll
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  anterior() {
    if (this.modalIndex > 0) {
      this.modalIndex--;
      this.modalItem = this.itemsVisible[this.modalIndex];
    }
  }

  siguiente() {
    if (this.modalIndex < this.itemsVisible.length - 1) {
      this.modalIndex++;
      this.modalItem = this.itemsVisible[this.modalIndex];
    }
  }

  // Keyboard navigation
  onKeydown(event: KeyboardEvent) {
    if (!this.modalItem) return;
    
    switch (event.key) {
      case 'Escape':
        this.cerrarModal();
        break;
      case 'ArrowLeft':
        this.anterior();
        break;
      case 'ArrowRight':
        this.siguiente();
        break;
    }
  }

  // Get total items count
  getTotalItems(): number {
    return this.itemsVisible.length;
  }

  // Get category item count
  getCategoryCount(slug: string): number {
    if (slug === 'todos') {
      return this.categorias.flatMap(cat => cat.items).length;
    }
    const categoria = this.categorias.find(cat => cat.slug === slug);
    return categoria ? categoria.items.length : 0;
  }

  // Get category title
  getCategoryTitle(slug: string): string {
    const categoria = this.categorias.find(cat => cat.slug === slug);
    return categoria ? categoria.titulo : slug;
  }
}
