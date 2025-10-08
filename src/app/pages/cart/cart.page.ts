import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { EmailService } from '../../services/email.service';

@Component({
  standalone: true,
  selector: 'ts-cart-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CartPage {
  private fb = inject(FormBuilder);
  cart = inject(CartService);
  mail = inject(EmailService);

  vm$ = this.cart.cart$; // { items: CartItem[] }

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: [''],
  });

  submitting = false;
  success: string | null = null;
  error: string | null = null;

  updateQty(id: string, q: string) { this.cart.updateQty(id, +q); }
  remove(id: string) { this.cart.remove(id); }
  clear() { this.cart.clear(); }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const state = this.cart.snapshot();
    if (!state.items.length) { this.error = 'El carrito está vacío.'; return; }
    this.submitting = true; this.error = null; this.success = null;

    try {
      await this.mail.sendCartEmail({
        contact: this.form.value,
        items: state.items.map(i => ({
          id: i.product.id, 
          name: i.product.name, 
          sku: i.product.sku,
          thickness: i.product.grosor, 
          qty: i.qty,
        })),
      });
      this.success = '¡Enviado! Te contactaremos en breve.';
      this.cart.clear();
      this.form.reset();
    } catch (e: any) {
      this.error = 'No pudimos enviar el correo. Intenta más tarde.';
    } finally {
      this.submitting = false;
    }
  }
}