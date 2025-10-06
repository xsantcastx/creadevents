import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.page.html',
  styleUrl: './contacto.page.scss'
})
export class ContactoPageComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      empresa: [''],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      aceptarPrivacidad: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitError = false;
      
      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
