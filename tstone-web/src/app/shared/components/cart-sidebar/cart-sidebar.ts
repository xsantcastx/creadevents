import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../shared/services/cart';
import { EmailService } from '../../../shared/services/email';
import { CartItem, CustomerInfo } from '../../../shared/models/catalog';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.scss'
})
export class CartSidebarComponent {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  private readonly cartService = inject(CartService);
  private readonly emailService = inject(EmailService);
  private readonly fb = inject(FormBuilder);

  enviado = false;

  readonly items$ = this.cartService.items$;

  readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    empresa: [''],
    mensaje: ['']
  });

  cerrar(): void {
    this.close.emit();
  }

  eliminar(item: CartItem): void {
    this.cartService.remove(item.producto.id);
  }

  cambiarCantidad(item: CartItem, incremento: number): void {
    const nuevaCantidad = item.cantidad + incremento;
    if (nuevaCantidad >= 1) {
      this.cartService.updateCantidad(item.producto.id, nuevaCantidad);
    }
  }

  enviar(): void {
    if (this.formulario.invalid || !this.cartService.items.length) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const cliente: CustomerInfo = {
      nombre: datos.nombre ?? '',
      email: datos.email ?? '',
      telefono: datos.telefono ?? '',
      empresa: datos.empresa ?? undefined,
      mensaje: datos.mensaje ?? undefined
    };

    this.emailService
      .sendCartSolicitud(this.cartService.items, cliente)
      .subscribe(() => {
        this.enviado = true;
        this.cartService.clear();
        this.formulario.reset();
        setTimeout(() => {
          this.enviado = false;
        }, 5000);
      });
  }
}
