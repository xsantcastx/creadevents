import { Injectable, inject } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { SettingsService } from './settings.service';

export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  mensaje: string;
  aceptarPrivacidad: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private db = inject(Firestore);
  private settingsService = inject(SettingsService);

  async sendCartEmail(payload: { contact: any, items: any[] }) {
    const { contact, items } = payload;
    
    // Validate required fields
    if (!contact?.name || !contact?.email || !items?.length) {
      throw new Error('Missing required fields: name, email, or items');
    }
    
    // Get settings with force refresh to ensure we have latest values
    const settings = await this.settingsService.getSettings(true);
    
    // Check if order emails are enabled
    if (!settings.orderEmailEnabled) {
      console.log('[EmailService] Order emails are disabled in settings. Email not sent.');
      return { success: true, disabled: true };
    }
    
    const recipientEmail = settings.contactEmail || 'support@theluxmining.com';
    console.log(`[EmailService] Sending cart email to: ${recipientEmail}`);
    
    const rows = items.map((i, idx) =>
      `<tr><td style="padding:6px;border:1px solid #eee">${idx+1}</td>
        <td style="padding:6px;border:1px solid #eee">${i.name || 'Sin nombre'}</td>
        <td style="padding:6px;border:1px solid #eee">${i.thickness||''}</td>
        <td style="padding:6px;border:1px solid #eee;text-align:right">${i.qty || 1}</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif">
        <h2 style="margin:0 0 8px">Nueva selección de productos - TheLuxMining</h2>
        <p><b>Nombre:</b> ${String(contact.name).replace(/</g, '&lt;')}<br>
           <b>Email:</b> ${String(contact.email).replace(/</g, '&lt;')}<br>
           <b>Tel:</b> ${String(contact.phone || 'No proporcionado').replace(/</g, '&lt;')}</p>
        ${contact.message ? `<p><b>Mensaje:</b><br>${String(contact.message).replace(/</g, '&lt;').replace(/\n/g,'<br>')}</p>` : ''}
        <table style="border-collapse:collapse;margin-top:10px;width:100%">
          <thead>
            <tr style="background-color:#f9fafb">
              <th style="padding:8px;border:1px solid #eee;text-align:left">#</th>
              <th style="padding:8px;border:1px solid #eee;text-align:left">Producto</th>
              <th style="padding:8px;border:1px solid #eee;text-align:left">Espesor</th>
              <th style="padding:8px;border:1px solid #eee;text-align:right">Cantidad</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:12px;color:#6b7280">
          Enviado desde el carrito de TheLuxMining - ${new Date().toLocaleString('es-ES')}
        </p>
      </div>`;

    try {
      // Write to Firestore - the Trigger Email extension will automatically send this
      const docRef = await addDoc(collection(this.db, 'mail'), {
        to: [recipientEmail], // Use recipient from settings
        message: { 
          subject: 'TheLuxMining · Selección de carrito', 
          html 
        }
      });
      
      console.log('Email queued successfully with ID:', docRef.id, 'to:', recipientEmail);
      return docRef;
    } catch (error) {
      console.error('Failed to queue email:', error);
      throw new Error('No se pudo enviar el correo. Por favor, intenta más tarde.');
    }
  }

  async sendContactForm(formData: ContactFormData) {
    // Validate required fields
    if (!formData?.nombre || !formData?.email || !formData?.mensaje) {
      throw new Error('Missing required fields: nombre, email, or mensaje');
    }

    // Get settings with force refresh to ensure we have latest values
    const settings = await this.settingsService.getSettings(true);
    const recipientEmail = settings.contactEmail || 'support@theluxmining.com';
    console.log(`[EmailService] Sending contact form to: ${recipientEmail}`);

    const html = `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif">
        <h2 style="margin:0 0 8px">Nuevo mensaje de contacto - TheLuxMining</h2>
        <div style="background-color:#f9fafb;padding:16px;border-radius:8px;margin-bottom:16px">
          <p style="margin:0 0 8px"><b>Nombre:</b> ${String(formData.nombre).replace(/</g, '&lt;')}</p>
          <p style="margin:0 0 8px"><b>Email:</b> ${String(formData.email).replace(/</g, '&lt;')}</p>
          <p style="margin:0 0 8px"><b>Teléfono:</b> ${String(formData.telefono || 'No proporcionado').replace(/</g, '&lt;')}</p>
          ${formData.empresa ? `<p style="margin:0 0 8px"><b>Empresa:</b> ${String(formData.empresa).replace(/</g, '&lt;')}</p>` : ''}
        </div>
        
        <div style="margin:16px 0">
          <h3 style="margin:0 0 8px;color:#374151">Mensaje:</h3>
          <div style="background-color:white;padding:16px;border:1px solid #e5e7eb;border-radius:8px">
            ${String(formData.mensaje).replace(/</g, '&lt;').replace(/\n/g,'<br>')}
          </div>
        </div>
        
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:12px;color:#6b7280">
          Enviado desde el formulario de contacto de TheLuxMining - ${new Date().toLocaleString('es-ES')}
        </p>
      </div>`;

    try {
      // Write to Firestore - the Trigger Email extension will automatically send this
      const docRef = await addDoc(collection(this.db, 'mail'), {
        to: [recipientEmail], // Use recipient from settings
        message: { 
          subject: `TheLuxMining · Contacto de ${formData.nombre}`, 
          html 
        }
      });
      
      console.log('Contact email queued successfully with ID:', docRef.id, 'to:', recipientEmail);
      return docRef;
    } catch (error) {
      console.error('Failed to queue contact email:', error);
      throw new Error('No se pudo enviar el mensaje. Por favor, intenta más tarde.');
    }
  }

  /**
   * Queue a custom email to the mail collection for Trigger Email extension
   */
  async queueEmail(emailData: { to: string; subject: string; html: string }): Promise<{ success: boolean }> {
    try {
      const docRef = await addDoc(collection(this.db, 'mail'), {
        to: [emailData.to],
        message: {
          subject: emailData.subject,
          html: emailData.html
        }
      });
      
      console.log('[EmailService] Email queued successfully with ID:', docRef.id);
      return { success: true };
    } catch (error) {
      console.error('[EmailService] Failed to queue email:', error);
      return { success: false };
    }
  }
}