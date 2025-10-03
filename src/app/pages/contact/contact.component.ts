import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { BudgetRange } from '../../models/data.models';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  isFlexible: boolean;
  venue: string;
  city: string;
  guestCount: number | string;
  budgetRange: BudgetRange;
  selectedStyles: string[];
  notes: string;
  consentGiven: boolean;
}

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  submissionStatus = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  contactForm: FormGroup;
  selectedStyles: string[] = [];

  availableStyles = [
    'Elegant & Classic',
    'Rustic & Natural',
    'Modern & Minimalist',
    'Bohemian & Free-spirited',
    'Vintage & Romantic',
    'Tropical & Vibrant',
    'Seasonal & Festive',
    'Corporate & Professional'
  ];

  constructor() {
    this.contactForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      eventDate: ['', [Validators.required]],
      isFlexible: [false],
      venue: [''],
      city: ['', [Validators.required]],
      guestCount: ['', [Validators.required]],
      budgetRange: ['', [Validators.required]],
      notes: [''],
      consentGiven: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isStyleSelected(style: string): boolean {
    return this.selectedStyles.includes(style);
  }

  toggleStyle(style: string): void {
    const index = this.selectedStyles.indexOf(style);
    if (index > -1) {
      this.selectedStyles.splice(index, 1);
    } else {
      this.selectedStyles.push(style);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      this.submissionStatus.set('submitting');
      
      try {
        const formData: ContactFormData = {
          ...this.contactForm.value,
          selectedStyles: this.selectedStyles
        };

        // Submit to Firestore
        await this.firestoreService.addInquiry({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          eventDate: new Date(formData.eventDate),
          isFlexible: formData.isFlexible,
          venue: formData.venue || 'To be determined',
          city: formData.city,
          guestCount: parseInt(formData.guestCount.toString()),
          budgetRange: formData.budgetRange,
          selectedStyles: formData.selectedStyles,
          notes: formData.notes || '',
          consentGiven: formData.consentGiven
        });

        this.submissionStatus.set('success');
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        this.submissionStatus.set('error');
      }
    }
  }

  resetForm(): void {
    this.contactForm.reset();
    this.selectedStyles = [];
    this.submissionStatus.set('idle');
  }
}