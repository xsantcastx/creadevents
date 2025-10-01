import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title';
import { EmailService } from '../../../shared/services/email';
import { CustomerInfo } from '../../../shared/models/catalog';

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

  enviar(): void {
    if (this.formulario.invalid) {
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

    this.emailService.sendCartSolicitud([], cliente).subscribe(() => {
      this.enviado = true;
      this.formulario.reset();
    });
  }
}
