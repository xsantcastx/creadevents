import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../shared/models/catalog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent {
  @Input() productos: Product[] = [];
  @Output() agregar = new EventEmitter<Product>();

  agregarProducto(producto: Product): void {
    this.agregar.emit(producto);
  }
}
