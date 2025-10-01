import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CartService } from '../../../shared/services/cart';

interface EnlaceNav {
  etiqueta: string;
  ruta: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  @Output() toggleCart = new EventEmitter<void>();

  private readonly cartService = inject(CartService);

  readonly enlaces: EnlaceNav[] = [
    { etiqueta: 'Home', ruta: '/', exact: true },
    { etiqueta: 'Productos', ruta: '/productos' },
    { etiqueta: 'Galeria', ruta: '/galeria' },
    { etiqueta: 'Datos Tecnicos', ruta: '/datos-tecnicos' },
    { etiqueta: 'Contacto', ruta: '/contacto' }
  ];

  readonly menuAbierto = signal(false);
  readonly totalItems = toSignal(
    this.cartService.items$.pipe(
      map((items) => items.reduce((total, item) => total + item.cantidad, 0))
    ),
    { initialValue: 0 }
  );

  activarCarrito(): void {
    this.toggleCart.emit();
  }

  alternarMenu(): void {
    this.menuAbierto.update((valor) => !valor);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
