import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService, CategoriaGaleria, GaleriaItem } from '../../core/services/data.service';

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [CommonModule],
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

  // Fallback data for immediate display
  private fallbackData: CategoriaGaleria[] = [
    {
      slug: 'cocinas',
      titulo: 'Cocinas',
      items: [
        {
          src: '/assets/galeria/cocinas/isla-saint-laurent.jpg',
          alt: 'Isla moderna en Saint Laurent',
          producto: 'saint-laurent',
          proyecto: 'Residencia Los Pinos',
          ubicacion: 'Valencia'
        },
        {
          src: '/assets/galeria/cocinas/encimera-black-gold.jpg',
          alt: 'Encimera Black Gold con iluminación',
          producto: 'black-gold',
          proyecto: 'Casa Mediterránea',
          ubicacion: 'Castellón'
        },
        {
          src: '/assets/galeria/cocinas/minimalista-arenaria.jpg',
          alt: 'Cocina minimalista Arenaria Ivory',
          producto: 'arenaria-ivory',
          proyecto: 'Apartamento Moderno',
          ubicacion: 'Barcelona'
        }
      ]
    },
    {
      slug: 'banos',
      titulo: 'Baños',
      items: [
        {
          src: '/assets/galeria/banos/elegante-apollo.jpg',
          alt: 'Baño elegante Apollo White',
          producto: 'apollo-white',
          proyecto: 'Suite Master',
          ubicacion: 'Valencia'
        },
        {
          src: '/assets/galeria/banos/lavabo-calacatta.jpg',
          alt: 'Lavabo Calacatta Gold premium',
          producto: 'calacatta-gold',
          proyecto: 'Baño Principal',
          ubicacion: 'Castellón'
        }
      ]
    }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Load fallback data immediately
    this.categorias = this.fallbackData;
    this.filtrarPorCategoria('todos');
    this.isLoading = false;
    
    // Then try to load real data if in browser
    if (this.isBrowser) {
      this.loadGaleria();
    }
  }

  private loadGaleria() {
    this.dataService.getGaleria().subscribe({
      next: (data) => {
        if (data.categorias.length > 0) {
          this.categorias = data.categorias;
          this.filtrarPorCategoria(this.categoriaActiva);
        }
        this.isLoading = false;
      },
      error: () => {
        // Keep fallback data on error
        this.isLoading = false;
      }
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
