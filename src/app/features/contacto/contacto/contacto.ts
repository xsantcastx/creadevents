import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title';
import { EmailService } from '../../../services/email.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [SectionTitleComponent, ReactiveFormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class ContactoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly emailService = inject(EmailService);

  enviado = false;

  readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    empresa: [''],
    mensaje: ['', Validators.required]
  });

  async enviar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const contactData = {
      nombre: datos.nombre ?? '',
      email: datos.email ?? '',
      telefono: datos.telefono ?? '',
      empresa: datos.empresa ?? undefined,
      mensaje: datos.mensaje ?? '',
      aceptarPrivacidad: true // Since this is an older component, auto-accept
    };

    try {
      await this.emailService.sendContactForm(contactData);
      this.enviado = true;
      this.formulario.reset();
    } catch (error) {
      console.error('Error sending contact form:', error);
      // Could add error handling UI here
    }
  }
}
