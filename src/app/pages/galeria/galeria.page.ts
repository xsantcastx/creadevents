import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadGaleria();
  }

  private loadGaleria() {
    this.dataService.getGaleria().subscribe(data => {
      this.categorias = data.categorias;
      this.filtrarPorCategoria('todos');
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
  }

  abrirModal(item: GaleriaItem, index: number) {
    this.modalItem = item;
    this.modalIndex = index;
  }

  cerrarModal() {
    this.modalItem = null;
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
}
