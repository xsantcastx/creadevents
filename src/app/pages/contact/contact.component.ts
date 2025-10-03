import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlotImgComponent } from '../../shared/slot-img/slot-img.component';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, SlotImgComponent],
  template: `
    <div class="contact">
      <!-- Hero Section with Slot -->
      <section class="hero-section">
        <slot-img key="contact.header" class="hero-img" altDefault="Contact Us – CreaDEvents"></slot-img>
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>Let's Plan Your Celebration</h1>
            <p>Tell us about your vision and we'll create a custom proposal just for you.</p>
          </div>
        </div>
      </section>

      <!-- Contact Form Section -->
      <section class="form-section">
        <div class="container">
          <div class="contact-grid">
            <!-- Contact Info -->
            <div class="contact-info">
              <h2>Get in Touch</h2>
              <p>Ready to start planning? We'd love to hear about your upcoming celebration.</p>
              
              <div class="contact-methods">
                <div class="method">
                  <div class="method-icon">📞</div>
                  <div class="method-content">
                    <h3>Call Us</h3>
                    <a href="tel:+17863562958">(786) 356-2958</a>
                  </div>
                </div>
                
                <div class="method">
                  <div class="method-icon">✉️</div>
                  <div class="method-content">
                    <h3>Email</h3>
                    <a href="mailto:info@creadevents.com">info@creadevents.com</a>
                  </div>
                </div>
                
                <div class="method">
                  <div class="method-icon">📍</div>
                  <div class="method-content">
                    <h3>Service Area</h3>
                    <p>Miami-Dade, Broward<br>& Destination Events</p>
                  </div>
                </div>
                
                <div class="method">
                  <div class="method-icon">💬</div>
                  <div class="method-content">
                    <h3>WhatsApp</h3>
                    <a href="https://wa.me/17863562958" target="_blank">Message Us</a>
                  </div>
                </div>
              </div>
              
              <div class="response-time">
                <h3>Response Time</h3>
                <p>We typically respond to inquiries within 24 hours during business days.</p>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="contact-form">
              <h2>Start Your Inquiry</h2>
              <p>Share some details about your event and we'll get back to you with ideas and next steps.</p>
              
              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="inquiry-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="fullName">Full Name *</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      formControlName="fullName"
                      placeholder="Your full name">
                  </div>
                  
                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      formControlName="email"
                      placeholder="your@email.com">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="phone">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      formControlName="phone"
                      placeholder="(xxx) xxx-xxxx">
                  </div>
                  
                  <div class="form-group">
                    <label for="eventDate">Event Date</label>
                    <input 
                      type="date" 
                      id="eventDate" 
                      formControlName="eventDate">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="eventType">Event Type *</label>
                    <select id="eventType" formControlName="eventType">
                      <option value="">Select event type</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="private">Private Celebration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="budget">Budget Range</label>
                    <select id="budget" formControlName="budget">
                      <option value="">Select budget range</option>
                      <option value="under-1000">Under $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500-5000">$2,500 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="over-10000">Over $10,000</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="venue">Venue/Location</label>
                  <input 
                    type="text" 
                    id="venue" 
                    formControlName="venue"
                    placeholder="Venue name or city">
                </div>

                <div class="form-group">
                  <label for="message">Tell Us About Your Vision *</label>
                  <textarea 
                    id="message" 
                    formControlName="message"
                    rows="5"
                    placeholder="Describe your celebration, style preferences, any special requests, or questions you have..."></textarea>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="contactForm.invalid || isSubmitting()">
                    @if (isSubmitting()) {
                      Sending...
                    } @else {
                      Send Inquiry
                    }
                  </button>
                  
                  @if (submitSuccess()) {
                    <div class="success-message">
                      ✅ Thank you! We'll get back to you within 24 hours.
                    </div>
                  }
                  
                  @if (submitError()) {
                    <div class="error-message">
                      ❌ There was an error sending your message. Please try again or call us directly.
                    </div>
                  }
                </div>
              </form>
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
              <p>We recommend booking 6-8 months in advance for weddings and 2-3 months for other events to ensure availability.</p>
            </div>
            
            <div class="faq-item">
              <h3>Do you travel for destination events?</h3>
              <p>Yes! We love destination events. Travel fees may apply depending on location.</p>
            </div>
            
            <div class="faq-item">
              <h3>What's included in your services?</h3>
              <p>Our services include consultation, design, sourcing, arrangement, delivery, and setup. Each package is customized to your needs.</p>
            </div>
            
            <div class="faq-item">
              <h3>Can you work within my budget?</h3>
              <p>Absolutely! We work with various budgets and will create a proposal that maximizes impact within your range.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      min-height: 50vh;
      display: flex;
      align-items: center;
    }

    .hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(15, 61, 62, 0.8) 0%, rgba(15, 61, 62, 0.5) 100%);
      z-index: 2;
      display: flex;
      align-items: center;
      padding: 0 var(--pad);
    }

    .hero-content {
      max-width: var(--container);
      margin: 0 auto;
      color: white;
      text-align: center;
    }

    .hero-content h1 {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      opacity: 0.95;
    }

    /* Form Section */
    .form-section {
      padding: 5rem 0;
      background: var(--surface);
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    }

    /* Contact Info */
    .contact-info h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .contact-info > p {
      margin-bottom: 2rem;
      color: var(--muted);
      font-size: 1.1rem;
    }

    .contact-methods {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .method {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: var(--radius);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .method-icon {
      font-size: 1.5rem;
    }

    .method-content h3 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
      color: var(--brand);
    }

    .method-content a {
      color: var(--brand);
      text-decoration: none;
    }

    .method-content a:hover {
      text-decoration: underline;
    }

    .method-content p {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    .response-time {
      padding: 1.5rem;
      background: var(--brand-ghost);
      border-radius: var(--radius);
    }

    .response-time h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: var(--brand);
    }

    .response-time p {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    /* Contact Form */
    .contact-form h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .contact-form > p {
      margin-bottom: 2rem;
      color: var(--muted);
      font-size: 1.1rem;
    }

    .inquiry-form {
      display: grid;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: grid;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--brand);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--brand);
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: var(--radius);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: var(--brand);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--brand) 90%, black);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-message {
      padding: 1rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: var(--radius);
      color: #155724;
    }

    .error-message {
      padding: 1rem;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: var(--radius);
      color: #721c24;
    }

    /* FAQ Section */
    .faq-section {
      padding: 5rem 0;
    }

    .faq-section h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: var(--brand);
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .faq-item {
      padding: 2rem;
      background: white;
      border-radius: var(--radius);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .faq-item h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: var(--brand);
    }

    .faq-item p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .faq-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private firestoreService = inject(FirestoreService);
  
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);

  contactForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    eventDate: [''],
    eventType: ['', Validators.required],
    budget: [''],
    venue: [''],
    message: ['', Validators.required]
  });

  async onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.submitSuccess.set(false);
      this.submitError.set(false);

      try {
        const formData = this.contactForm.value;
        
        // Add system fields
        const inquiry = {
          ...formData,
          status: 'new',
          createdAt: new Date(),
          source: 'website'
        };

        // Submit to Firestore
        await this.firestoreService.addInquiry(inquiry);
        
        this.submitSuccess.set(true);
        this.contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess.set(false);
        }, 5000);
        
      } catch (error) {
        console.error('Error submitting form:', error);
        this.submitError.set(true);
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          this.submitError.set(false);
        }, 5000);
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }
}