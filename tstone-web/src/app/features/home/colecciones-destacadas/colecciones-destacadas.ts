import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title';
import { CatalogService } from '../../../shared/services/catalog';

@Component({
  selector: 'app-colecciones-destacadas',
  standalone: true,
  imports: [AsyncPipe, SectionTitleComponent],
  templateUrl: './colecciones-destacadas.html',
  styleUrl: './colecciones-destacadas.scss'
})
export class ColeccionesDestacadasComponent {
  private readonly catalogService = inject(CatalogService);

  readonly destacados$ = this.catalogService.getFeaturedProducts();
}
