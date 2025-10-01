import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductLine } from '../../../shared/models/catalog';

@Component({
  selector: 'app-material-grid',
  standalone: true,
  imports: [],
  templateUrl: './material-grid.html',
  styleUrl: './material-grid.scss'
})
export class MaterialGridComponent {
  @Input() materiales: ProductLine[] = [];
  @Input() seleccionado?: string;
  @Output() materialSeleccionado = new EventEmitter<ProductLine>();

  seleccionar(material: ProductLine): void {
    this.materialSeleccionado.emit(material);
  }
}
