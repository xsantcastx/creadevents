import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem, CartState, Product } from '../models/product';

const LS_KEY = 'ts_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private state$ = new BehaviorSubject<CartState>(this.load());
  readonly cart$ = this.state$.asObservable();
  readonly count$ = this.cart$.pipe(map(s => s.items.reduce((n, i) => n + i.qty, 0)));

  private load(): CartState {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{"items":[]}'); }
    catch { return { items: [] }; }
  }
  private save(state: CartState) { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

  add(product: Product, qty = 1) {
    const s = structuredClone(this.state$.value);
    const found = s.items.find(i => i.product.id === product.id);
    if (found) found.qty += qty;
    else s.items.push({ product, qty });
    this.save(s); this.state$.next(s);
  }
  remove(productId: string) {
    const s = structuredClone(this.state$.value);
    s.items = s.items.filter(i => i.product.id !== productId);
    this.save(s); this.state$.next(s);
  }
  updateQty(productId: string, qty: number) {
    const s = structuredClone(this.state$.value);
    const it = s.items.find(i => i.product.id === productId);
    if (it) { it.qty = Math.max(1, qty|0); this.save(s); this.state$.next(s); }
  }
  clear() { const s: CartState = { items: [] }; this.save(s); this.state$.next(s); }
  snapshot() { return this.state$.value; }
}