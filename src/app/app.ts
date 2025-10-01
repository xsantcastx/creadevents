import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar';
import { FooterComponent } from './core/components/footer/footer';
import { CartSidebarComponent } from './shared/components/cart-sidebar/cart-sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CartSidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  readonly carritoVisible = signal(false);

  alternarCarrito(): void {
    this.carritoVisible.update((visible) => !visible);
  }

  cerrarCarrito(): void {
    this.carritoVisible.set(false);
  }
}
