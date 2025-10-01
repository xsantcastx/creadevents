import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title';
import { CatalogService } from '../../../shared/services/catalog';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [SectionTitleComponent, AsyncPipe],
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss'
})
export class GaleriaComponent {
  private readonly catalogService = inject(CatalogService);

  readonly proyectos$ = this.catalogService.getGallery();
}
