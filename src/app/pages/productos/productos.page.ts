import { Component } from '@angular/core';
import { ProductosComponent } from '../../features/productos/productos/productos';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [ProductosComponent],
  templateUrl: './productos.page.html',
  styleUrl: './productos.page.scss'
})
export class ProductosPageComponent {}
