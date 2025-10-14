import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../models/product';
import { CartService } from '../../../services/cart.service';

@Component({
  standalone: true,
  selector: 'ts-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Input() grosorPath?: string; // e.g., "12mm" for routing
  
  adding = false;
  
  constructor(private cart: CartService) {}

  add() {
    this.adding = true;
    this.cart.add(this.product, 1);
    setTimeout(() => this.adding = false, 800);
  }

  getProductRoute(): string[] {
    if (this.grosorPath && this.product.grosor) {
      return ['/productos', this.product.grosor, this.product.slug || this.product.id || ''];
    }
    return ['/productos', this.product.slug || this.product.id || ''];
  }

  getAplicaciones(grosor?: string): string {
    switch (grosor) {
      case '12mm': return 'cocinas y baños residenciales';
      case '15mm': return 'espacios comerciales y residenciales';
      case '20mm': return 'exteriores y zonas de alto tránsito';
      default: return 'diversos proyectos';
    }
  }
}