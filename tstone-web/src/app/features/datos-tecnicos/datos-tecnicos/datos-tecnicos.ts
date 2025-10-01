import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title';
import { CatalogService } from '../../../shared/services/catalog';

@Component({
  selector: 'app-datos-tecnicos',
  standalone: true,
  imports: [SectionTitleComponent, AsyncPipe],
  templateUrl: './datos-tecnicos.html',
  styleUrl: './datos-tecnicos.scss'
})
export class DatosTecnicosComponent {
  private readonly catalogService = inject(CatalogService);

  readonly fichas$ = this.catalogService.getTechnicalSheets();
}
