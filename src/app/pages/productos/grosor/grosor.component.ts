import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, Producto } from '../../../core/services/data.service';

@Component({
  selector: 'app-grosor',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <article *ngFor="let producto of productosFiltrados" 
               class="group rounded-2xl overflow-hidden bg-ts-paper shadow hover:shadow-lg transition-all duration-300">
        <div class="aspect-[4/3] overflow-hidden">
          <img [src]="producto.cover" 
               [alt]="producto.nombre" 
               class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
               loading="lazy"/>
        </div>
        <div class="p-4">
          <h3 class="font-serif text-xl text-ts-bg">{{ producto.nombre }}</h3>
          <p class="text-sm text-neutral-600">{{ producto.medida }} · {{ producto.grosor }}</p>
          <a [routerLink]="['/productos', grosor, producto.slug]" 
             class="mt-3 inline-block text-ts-accent hover:underline">
            Ver ficha →
          </a>
        </div>
      </article>
    </div>
    
    <div *ngIf="productosFiltrados.length === 0" class="text-center py-16">
      <p class="text-ts-ink-soft">No hay productos disponibles para este grosor.</p>
    </div>
  `
})
export class GrosorComponent implements OnInit {
  grosor = '';
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.grosor = this.route.snapshot.paramMap.get('grosor') || '';
    this.loadProductos();
  }

  private loadProductos() {
    this.dataService.getProductos().subscribe(data => {
      this.productos = data.items;
      this.productosFiltrados = this.dataService.getProductosByGrosor(this.productos, this.grosor);
    });
  }
}