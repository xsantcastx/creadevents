import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Producto } from '../../../core/services/data.service';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="max-w-7xl mx-auto px-6 py-12" *ngIf="producto">
      <div class="grid lg:grid-cols-2 gap-10">
        <div class="aspect-[4/3] overflow-hidden rounded-2xl bg-ts-paper">
          <img [src]="producto.cover" 
               [alt]="producto.nombre"
               class="w-full h-full object-cover" 
               loading="lazy"/>
        </div>
        <div class="text-ts-ink">
          <h1 class="font-serif text-4xl mb-2">{{producto.nombre}}</h1>
          <p class="text-ts-ink-soft mb-6">{{producto.medida}} · {{producto.grosor}}</p>
          
          <div class="prose prose-invert max-w-none mb-6" *ngIf="producto.descripcion">
            <p>{{producto.descripcion}}</p>
          </div>
          
          <div class="mb-6" *ngIf="producto.aplicaciones && producto.aplicaciones.length > 0">
            <h3 class="font-semibold mb-2">Aplicaciones recomendadas:</h3>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let aplicacion of producto.aplicaciones" 
                    class="px-3 py-1 bg-ts-accent/20 text-ts-accent rounded-full text-sm">
                {{aplicacion}}
              </span>
            </div>
          </div>
          
          <div class="flex gap-4">
            <a href="/assets/fichas/topstone-ficha-general.pdf" 
               target="_blank"
               class="inline-flex items-center gap-2 px-6 py-3 bg-ts-accent text-ts-bg rounded-full font-semibold hover:bg-ts-accent/90 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Descargar ficha técnica
            </a>
            
            <button (click)="goBack()" 
                    class="px-6 py-3 ring-1 ring-ts-line text-ts-ink hover:bg-ts-paper hover:text-ts-bg rounded-full transition-colors">
              Volver
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <div *ngIf="!producto" class="max-w-7xl mx-auto px-6 py-12 text-center">
      <p class="text-ts-ink-soft">Producto no encontrado.</p>
      <button (click)="goBack()" 
              class="mt-4 px-6 py-3 bg-ts-accent text-ts-bg rounded-full font-semibold">
        Volver a productos
      </button>
    </div>
  `
})
export class DetalleComponent implements OnInit {
  producto: Producto | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProducto(slug);
    }
  }

  private loadProducto(slug: string) {
    this.dataService.getProductos().subscribe(data => {
      this.producto = this.dataService.getProductoBySlug(data.items, slug);
    });
  }

  goBack() {
    this.router.navigate(['/productos']);
  }
}