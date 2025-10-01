import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title';
import { MaterialGridComponent } from '../material-grid/material-grid';
import { ProductListComponent } from '../product-list/product-list';
import { Calibre, Product, ProductLine } from '../../../shared/models/catalog';
import { CatalogService } from '../../../shared/services/catalog';
import { CartService } from '../../../shared/services/cart';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [SectionTitleComponent, MaterialGridComponent, ProductListComponent],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class ProductosComponent implements OnInit {
  calibreActivo: Calibre = '10';
  materiales: ProductLine[] = [];
  productos: Product[] = [];
  materialSeleccionado?: ProductLine;

  constructor(
    private readonly catalogService: CatalogService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cargarLineas('10');
  }

  cambiarCalibre(calibre: Calibre): void {
    if (this.calibreActivo === calibre) {
      return;
    }
    this.calibreActivo = calibre;
    this.cargarLineas(calibre);
  }

  seleccionarMaterial(material: ProductLine): void {
    this.materialSeleccionado = material;
    this.catalogService
      .getProductsByLine(material.slug)
      .pipe(take(1))
      .subscribe((productos) => {
        this.productos = productos;
      });
  }

  agregarAlCarrito(producto: Product): void {
    this.cartService.add(producto);
  }

  private cargarLineas(calibre: Calibre): void {
    this.catalogService
      .getProductLines(calibre)
      .pipe(take(1))
      .subscribe((materiales) => {
        this.materiales = materiales;
        if (materiales.length) {
          this.seleccionarMaterial(materiales[0]);
        } else {
          this.productos = [];
          this.materialSeleccionado = undefined;
        }
      });
  }
}
