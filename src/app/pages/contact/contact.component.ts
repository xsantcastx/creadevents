import { Component, OnInit, inject, signal } from '@angular/core';
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
  template: `
    <div class="contact-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Let's Create Something Beautiful Together</h1>
          <p class="hero-subtitle">
            Share your vision with us and we'll bring it to life with expert planning, 
            stunning florals, and seamless execution.
          </p>
        </div>
      </section>

      <!-- Contact Form Section -->
      <section class="form-section">
        <div class="container">
          <div class="contact-content">
            
            <!-- Quick Contact Info -->
            <div class="contact-sidebar">
              <div class="contact-card">
                <h3>Get in Touch</h3>
                <div class="contact-methods">
                  <a href="tel:7863562958" class="contact-method">
                    <i class="icon">📞</i>
                    <div>
                      <strong>(786) 356-2958</strong>
                      <span>Call us directly</span>
                    </div>
                  </a>
                  
                  <a href="mailto:info@creadevents.com" class="contact-method">
                    <i class="icon">✉️</i>
                    <div>
                      <strong>info@creadevents.com</strong>
                      <span>Email us anytime</span>
                    </div>
                  </a>
                  
                  <a href="https://wa.me/17863562958" class="contact-method" target="_blank">
                    <i class="icon">💬</i>
                    <div>
                      <strong>WhatsApp</strong>
                      <span>Chat with us</span>
                    </div>
                  </a>
                </div>
              </div>

              <div class="location-card">
                <h3>Service Area</h3>
                <p>Proudly serving Miami-Dade County and surrounding areas in South Florida.</p>
                
                <!-- Google Maps Embed -->
                <div class="map-container">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462560.68665032954!2d-80.43471649999999!3d25.7906073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C%20FL%2C%20USA!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus"
                    width="100%" 
                    height="200" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>

              <div class="hours-card">
                <h3>Business Hours</h3>
                <div class="hours-list">
                  <div class="hours-item">
                    <span>Monday - Friday</span>
                    <strong>9:00 AM - 6:00 PM</strong>
                  </div>
                  <div class="hours-item">
                    <span>Saturday</span>
                    <strong>10:00 AM - 4:00 PM</strong>
                  </div>
                  <div class="hours-item">
                    <span>Sunday</span>
                    <strong>By Appointment</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Contact Form -->
            <div class="form-container">
              <div class="form-header">
                <h2>Tell Us About Your Event</h2>
                <p>Fill out the details below and we'll get back to you within 24 hours with a personalized proposal.</p>
              </div>

              @if (submissionStatus() === 'success') {
                <div class="success-message">
                  <div class="success-icon">✅</div>
                  <h3>Thank you for your inquiry!</h3>
                  <p>We've received your information and will contact you within 24 hours to discuss your event details.</p>
                  <button (click)="resetForm()" class="btn btn-outline">Submit Another Inquiry</button>
                </div>
              } @else {
                <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
                  
                  <!-- Personal Information -->
                  <div class="form-section">
                    <h3>Contact Information</h3>
                    <div class="form-row">
                      <div class="form-group">
                        <label for="fullName">Full Name *</label>
                        <input 
                          type="text" 
                          id="fullName" 
                          formControlName="fullName"
                          placeholder="Your full name">
                        @if (contactForm.get('fullName')?.invalid && contactForm.get('fullName')?.touched) {
                          <span class="error-message">Full name is required</span>
                        }
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input 
                          type="email" 
                          id="email" 
                          formControlName="email"
                          placeholder="your.email@example.com">
                        @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                          <span class="error-message">Valid email is required</span>
                        }
                      </div>
                      
                      <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          formControlName="phone"
                          placeholder="(786) 123-4567">
                        @if (contactForm.get('phone')?.invalid && contactForm.get('phone')?.touched) {
                          <span class="error-message">Phone number is required</span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Event Details -->
                  <div class="form-section">
                    <h3>Event Details</h3>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label for="eventDate">Preferred Event Date *</label>
                        <input 
                          type="date" 
                          id="eventDate" 
                          formControlName="eventDate"
                          [min]="getMinDate()">
                        @if (contactForm.get('eventDate')?.invalid && contactForm.get('eventDate')?.touched) {
                          <span class="error-message">Event date is required</span>
                        }
                      </div>
                      
                      <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                          <input 
                            type="checkbox" 
                            formControlName="isFlexible">
                          <span class="checkmark"></span>
                          I'm flexible with the date
                        </label>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label for="venue">Venue Name</label>
                        <input 
                          type="text" 
                          id="venue" 
                          formControlName="venue"
                          placeholder="Venue name or 'To be determined'">
                      </div>
                      
                      <div class="form-group">
                        <label for="city">City/Location *</label>
                        <input 
                          type="text" 
                          id="city" 
                          formControlName="city"
                          placeholder="Miami, FL">
                        @if (contactForm.get('city')?.invalid && contactForm.get('city')?.touched) {
                          <span class="error-message">City is required</span>
                        }
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label for="guestCount">Expected Guest Count *</label>
                        <select id="guestCount" formControlName="guestCount">
                          <option value="">Select guest count</option>
                          <option value="25">Under 25 guests</option>
                          <option value="50">25-50 guests</option>
                          <option value="100">50-100 guests</option>
                          <option value="150">100-150 guests</option>
                          <option value="200">150-200 guests</option>
                          <option value="300">200+ guests</option>
                        </select>
                        @if (contactForm.get('guestCount')?.invalid && contactForm.get('guestCount')?.touched) {
                          <span class="error-message">Guest count is required</span>
                        }
                      </div>
                      
                      <div class="form-group">
                        <label for="budgetRange">Budget Range *</label>
                        <select id="budgetRange" formControlName="budgetRange">
                          <option value="">Select budget range</option>
                          <option value="under-500">Under $500</option>
                          <option value="500-1000">$500 - $1,000</option>
                          <option value="1000-2500">$1,000 - $2,500</option>
                          <option value="2500-5000">$2,500 - $5,000</option>
                          <option value="5000-10000">$5,000 - $10,000</option>
                          <option value="over-10000">$10,000+</option>
                        </select>
                        @if (contactForm.get('budgetRange')?.invalid && contactForm.get('budgetRange')?.touched) {
                          <span class="error-message">Budget range is required</span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Style Preferences -->
                  <div class="form-section">
                    <h3>Style Preferences</h3>
                    <p class="section-description">Select the styles that appeal to you (select multiple):</p>
                    
                    <div class="style-chips">
                      @for (style of availableStyles; track style) {
                        <label class="style-chip" [class.selected]="isStyleSelected(style)">
                          <input 
                            type="checkbox" 
                            [value]="style"
                            (change)="toggleStyle(style)">
                          <span>{{ style }}</span>
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Additional Notes -->
                  <div class="form-section">
                    <h3>Additional Information</h3>
                    <div class="form-group">
                      <label for="notes">Tell us about your vision</label>
                      <textarea 
                        id="notes" 
                        formControlName="notes"
                        rows="5"
                        placeholder="Describe your event vision, color preferences, special requirements, or any other details you'd like to share with us..."></textarea>
                    </div>

                    <!-- File Upload Placeholder -->
                    <div class="form-group">
                      <label>Inspiration Images</label>
                      <div class="file-upload-area">
                        <div class="upload-placeholder">
                          <i class="upload-icon">📎</i>
                          <p>Drag & drop inspiration images here</p>
                          <p class="upload-note">(Feature coming soon - For now, please email images to info@creadevents.com)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Consent and Submit -->
                  <div class="form-section">
                    <div class="consent-group">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          formControlName="consentGiven">
                        <span class="checkmark"></span>
                        I consent to Creation Design & Events contacting me about my inquiry and agree to the <a routerLink="/privacy">Privacy Policy</a> *
                      </label>
                      @if (contactForm.get('consentGiven')?.invalid && contactForm.get('consentGiven')?.touched) {
                        <span class="error-message">Consent is required to submit the form</span>
                      }
                    </div>

                    <div class="submit-section">
                      @if (submissionStatus() === 'submitting') {
                        <button type="button" class="btn btn-primary" disabled>
                          Sending your inquiry...
                        </button>
                      } @else {
                        <button 
                          type="submit" 
                          class="btn btn-primary"
                          [disabled]="contactForm.invalid">
                          Send Inquiry
                        </button>
                      }
                      
                      @if (submissionStatus() === 'error') {
                        <div class="error-message">
                          There was an error submitting your inquiry. Please try again or call us directly at (786) 356-2958.
                        </div>
                      }
                    </div>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <div class="container">
          <h2>Frequently Asked Questions</h2>
          <div class="faq-grid">
            <div class="faq-item">
              <h3>How far in advance should I book?</h3>
              <p>We recommend booking 2-6 months in advance for weddings and major events, though we can often accommodate shorter timelines.</p>
            </div>
            <div class="faq-item">
              <h3>Do you provide setup and teardown?</h3>
              <p>Yes! Our full-service packages include delivery, professional setup, and complete teardown after your event.</p>
            </div>
            <div class="faq-item">
              <h3>What's included in your consultations?</h3>
              <p>Initial consultations include venue visit, style discussion, preliminary design concepts, and detailed proposal with pricing.</p>
            </div>
            <div class="faq-item">
              <h3>Can you work within my budget?</h3>
              <p>Absolutely! We create beautiful designs at every budget level and will work with you to maximize impact within your range.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      background: linear-gradient(
        135deg,
        var(--theme-primary, #7FB069) 0%,
        var(--theme-secondary, #F7E9E3) 100%
      );
      padding: 4rem 0;
      text-align: center;
      color: white;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .hero-subtitle {
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.95;
    }

    .form-section {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .contact-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 4rem;
      align-items: start;
    }

    .contact-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .contact-card,
    .location-card,
    .hours-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .contact-card h3,
    .location-card h3,
    .hours-card h3 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-method {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 10px;
      text-decoration: none;
      color: var(--theme-text, #2D3436);
      transition: background-color 0.3s ease;
    }

    .contact-method:hover {
      background: var(--theme-secondary, #F7E9E3);
    }

    .contact-method .icon {
      font-size: 1.5rem;
      width: 40px;
      text-align: center;
    }

    .contact-method div {
      display: flex;
      flex-direction: column;
    }

    .contact-method strong {
      color: var(--theme-primary, #7FB069);
      margin-bottom: 0.25rem;
    }

    .contact-method span {
      font-size: 0.9rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .map-container {
      margin-top: 1rem;
      border-radius: 10px;
      overflow: hidden;
    }

    .hours-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .hours-item:last-child {
      border-bottom: none;
    }

    .form-container {
      background: white;
      padding: 3rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .form-header {
      margin-bottom: 2rem;
    }

    .form-header h2 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .form-header p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .form-section h3 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
      font-size: 1.3rem;
      border-bottom: 2px solid var(--theme-primary, #7FB069);
      padding-bottom: 0.5rem;
    }

    .section-description {
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      color: var(--theme-text, #2D3436);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.875rem;
      border: 2px solid #E0E0E0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--theme-primary, #7FB069);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      color: var(--theme-text, #2D3436);
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--theme-primary, #7FB069);
    }

    .style-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .style-chip {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border: 2px solid #E0E0E0;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .style-chip input {
      display: none;
    }

    .style-chip:hover,
    .style-chip.selected {
      border-color: var(--theme-primary, #7FB069);
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .file-upload-area {
      border: 2px dashed #E0E0E0;
      border-radius: 10px;
      padding: 2rem;
      text-align: center;
      transition: border-color 0.3s ease;
    }

    .upload-placeholder {
      color: var(--theme-text-secondary, #636E72);
    }

    .upload-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
    }

    .upload-note {
      font-size: 0.9rem;
      font-style: italic;
      margin-top: 0.5rem;
    }

    .consent-group {
      margin-bottom: 2rem;
    }

    .consent-group .checkbox-label {
      line-height: 1.5;
    }

    .consent-group a {
      color: var(--theme-primary, #7FB069);
      text-decoration: underline;
    }

    .submit-section {
      text-align: center;
    }

    .btn {
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .error-message {
      color: #E74C3C;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .success-message {
      text-align: center;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 15px;
      border: 2px solid var(--theme-primary, #7FB069);
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .success-message h3 {
      color: var(--theme-primary, #7FB069);
      margin-bottom: 1rem;
    }

    .faq-section {
      background: var(--theme-secondary, #F7E9E3);
      padding: 4rem 0;
    }

    .faq-section h2 {
      text-align: center;
      color: var(--theme-text, #2D3436);
      margin-bottom: 3rem;
      font-size: 2.5rem;
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .faq-item {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .faq-item h3 {
      color: var(--theme-primary, #7FB069);
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .faq-item p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .contact-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .form-container {
        padding: 2rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .style-chips {
        justify-content: center;
      }

      .faq-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
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