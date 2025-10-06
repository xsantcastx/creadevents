import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CartItem, CustomerInfo } from '../../shared/models/catalog';

export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  mensaje: string;
  aceptarPrivacidad: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  sendCartSolicitud(items: CartItem[], cliente: CustomerInfo): Observable<boolean> {
    console.group('📤 Solicitud de carrito');
    console.table(items.map((item) => ({
      producto: item.producto.nombre,
      calibre: item.producto.calibre,
      cantidad: item.cantidad
    })));
    console.log('Cliente', cliente);
    console.groupEnd();
    return of(true);
  }

  sendContactForm(data: ContactFormData): Observable<boolean> {
    console.group('📧 Formulario de contacto');
    console.log('Datos del contacto:', {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      empresa: data.empresa || 'No especificada',
      mensaje: data.mensaje.substring(0, 100) + (data.mensaje.length > 100 ? '...' : ''),
      privacidad: data.aceptarPrivacidad
    });
    console.groupEnd();

    // Simulate potential errors (5% failure rate)
    const shouldFail = Math.random() < 0.05;
    
    if (shouldFail) {
      return throwError(() => new Error('Error de conexión. Por favor, inténtalo de nuevo.'));
    }

    // Simulate network delay and success
    return of(true).pipe(delay(1500));
  }
}
