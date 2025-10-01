import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem, CustomerInfo } from '../../shared/models/catalog';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  sendCartSolicitud(items: CartItem[], cliente: CustomerInfo): Observable<boolean> {
    console.group('?? Solicitud de carrito');
    console.table(items.map((item) => ({
      producto: item.producto.nombre,
      calibre: item.producto.calibre,
      cantidad: item.cantidad
    })));
    console.log('Cliente', cliente);
    console.groupEnd();
    return of(true);
  }
}
