import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CategoriaGaleria, GaleriaItem } from '../../core/services/data.service';
import { Firestore, collection, query, where, orderBy, getDocs, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Media } from '../../models/media';
import { Tag } from '../../models/catalog';
import { TagService } from '../../services/tag.service';
import { PageHeaderComponent, Breadcrumb } from '../../shared/components/page-header/page-header.component';
import { LoadingComponentBase } from '../../core/classes/loading-component.base';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent],
  templateUrl: './galeria.page.html',
  styleUrl: './galeria.page.scss'
})
export class GaleriaPageComponent extends LoadingComponentBase implements OnInit {
  categorias: CategoriaGaleria[] = [];
  categoriaActiva = 'todos';
  itemsVisible: GaleriaItem[] = [];
  modalItem: GaleriaItem | null = null;
  modalIndex = 0;
  availableTags: Tag[] = [];
  
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private tagService = inject(TagService);
  private metaService = inject(MetaService);

  // Breadcrumbs for navigation
  breadcrumbs: Breadcrumb[] = [
    { label: 'NAV.HOME', url: '/', icon: 'home' },
    { label: 'GALLERY.TITLE', icon: 'gallery' }
  ];

  constructor(
    private firestore: Firestore
  ) {
    super(); // Call parent constructor
  }

  ngOnInit() {
    // Set page meta tags from settings
    this.metaService.setPageMeta({
      title: 'GALLERY.TITLE',
      description: 'GALLERY.DESCRIPTION'
    });

    // Load gallery from Firestore only
    if (this.isBrowser) {
      this.loadTagsAndGallery();
    } else {
      this.isLoading = false;
    }
  }

  private async loadTagsAndGallery() {
    try {
      // Load tags first
      this.tagService.getActiveTags().subscribe({
        next: (tags) => {
          this.availableTags = tags;
          console.log('🏷️ Tags loaded:', tags.length);
          // Then load gallery
          this.loadGaleriaFromFirebase();
        },
        error: (error) => {
          console.error('Error loading tags:', error);
          // Continue loading gallery even if tags fail
          this.loadGaleriaFromFirebase();
        }
      });
    } catch (error) {
      console.error('Error in loadTagsAndGallery:', error);
      this.loadGaleriaFromFirebase();
    }
  }

  private async loadGaleriaFromFirebase() {
    await this.withLoading(async () => {
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
    });
  }

  // Group media by tags - Map to category structure using dynamic tags from Firestore
  private groupMediaByTags(mediaItems: Media[]): CategoriaGaleria[] {
    // Create a map of tag slugs to tag objects for quick lookup
    const tagMap = new Map<string, Tag>();
    this.availableTags.forEach(tag => {
      tagMap.set(tag.slug, tag);
    });

    // Group images by their first tag
    const categoriesMap = new Map<string, GaleriaItem[]>();

    mediaItems.forEach(media => {
      if (!media.tags || media.tags.length === 0) {
        // Default to 'other' if no tags
        if (!categoriesMap.has('other')) {
          categoriesMap.set('other', []);
        }
        categoriesMap.get('other')!.push({
          src: media.url,
          alt: media.altText || 'TheLuxMining Project',
          producto: 'Other',
          proyecto: media.altText || '',
          ubicacion: media.caption || ''
        });
        return;
      }

      const firstTag = media.tags[0]; // Use first tag as category
      const tag = tagMap.get(firstTag);
      
      if (!tag) {
        // Unknown tag - add to 'other'
        if (!categoriesMap.has('other')) {
          categoriesMap.set('other', []);
        }
        categoriesMap.get('other')!.push({
          src: media.url,
          alt: media.altText || 'TheLuxMining Project',
          producto: 'Other',
          proyecto: media.altText || '',
          ubicacion: media.caption || ''
        });
        return;
      }

      if (!categoriesMap.has(tag.slug)) {
        categoriesMap.set(tag.slug, []);
      }

      categoriesMap.get(tag.slug)!.push({
        src: media.url,
        alt: media.altText || 'TheLuxMining Project',
        producto: tag.name,
        proyecto: media.altText || '',
        ubicacion: media.caption || ''
      });
    });

    // Convert map to array of categories using tag information
    return Array.from(categoriesMap.entries()).map(([slug, items]) => {
      const tag = tagMap.get(slug);
      return {
        slug,
        titulo: tag?.name || (slug === 'other' ? 'Others' : slug),
        items
      };
    }).sort((a, b) => {
      // Sort by tag order if available
      const tagA = tagMap.get(a.slug);
      const tagB = tagMap.get(b.slug);
      if (tagA && tagB) {
        return (tagA.order || 999) - (tagB.order || 999);
      }
      return 0;
    });
  }

  // Get tag by slug for accessing color/icon
  getTag(slug: string): Tag | undefined {
    return this.availableTags.find(t => t.slug === slug);
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
