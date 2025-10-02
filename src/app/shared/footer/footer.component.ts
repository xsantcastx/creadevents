import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { Settings } from '../../models/data.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <!-- Company Info -->
          <div class="footer-section">
            <h3>CreaDEvents</h3>
            <p>Professional floral design and event decorations for every special occasion.</p>
            @if (settings$ | async; as settings) {
              <div class="contact-info">
                <p><strong>Email:</strong> {{ settings.contactEmail }}</p>
                @if (settings.businessInfo && settings.businessInfo.phone) {
                  <p><strong>Phone:</strong> {{ settings.businessInfo.phone }}</p>
                }
                @if (settings.businessInfo && settings.businessInfo.address) {
                  <p><strong>Address:</strong> {{ settings.businessInfo.address }}</p>
                }
              </div>
            }
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/services">Services</a></li>
              <li><a routerLink="/portfolio">Portfolio</a></li>
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/testimonials">Testimonials</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <!-- Seasonal Collections -->
          <div class="footer-section">
            <h4>Seasonal Collections</h4>
            <ul class="footer-links">
              <li><a routerLink="/season/spring">Spring</a></li>
              <li><a routerLink="/season/summer">Summer</a></li>
              <li><a routerLink="/season/autumn">Autumn</a></li>
              <li><a routerLink="/season/winter">Winter</a></li>
            </ul>
          </div>

          <!-- Social & Contact -->
          <div class="footer-section">
            <h4>Connect With Us</h4>
            @if (settings$ | async; as settings) {
              <div class="social-links">
                @if (settings.socialLinks && settings.socialLinks.instagram) {
                  <a [href]="settings.socialLinks.instagram" target="_blank" rel="noopener" class="social-link">
                    <span class="social-icon">📷</span> Instagram
                  </a>
                }
                @if (settings.socialLinks && settings.socialLinks.whatsapp) {
                  <a [href]="settings.socialLinks.whatsapp" target="_blank" rel="noopener" class="social-link">
                    <span class="social-icon">💬</span> WhatsApp
                  </a>
                }
                @if (settings.socialLinks && settings.socialLinks.facebook) {
                  <a [href]="settings.socialLinks.facebook" target="_blank" rel="noopener" class="social-link">
                    <span class="social-icon">📘</span> Facebook
                  </a>
                }
                <a [href]="'mailto:' + settings.contactEmail" class="social-link">
                  <span class="social-icon">✉️</span> Email
                </a>
              </div>
            }
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p>&copy; {{ currentYear }} CreaDEvents. All rights reserved.</p>
            <div class="footer-legal">
              <a href="/privacy" class="legal-link">Privacy Policy</a>
              <a href="/terms" class="legal-link">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--theme-text, #2D3436);
      color: white;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 3rem;
      padding: 3rem 0 2rem;
    }

    .footer-section h3 {
      color: var(--theme-accent, #FFEAA7);
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .footer-section h4 {
      color: var(--theme-primary, #7FB069);
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .footer-section p {
      line-height: 1.6;
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .contact-info p {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: all 0.3s ease;
    }

    .footer-links a:hover {
      opacity: 1;
      color: var(--theme-primary, #7FB069);
    }

    .social-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      opacity: 1;
      color: var(--theme-primary, #7FB069);
    }

    .social-icon {
      font-size: 1.2rem;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.5rem 0;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-bottom p {
      margin: 0;
      opacity: 0.7;
      font-size: 0.9rem;
    }

    .footer-legal {
      display: flex;
      gap: 1rem;
    }

    .legal-link {
      color: white;
      text-decoration: none;
      opacity: 0.7;
      font-size: 0.9rem;
      transition: opacity 0.3s ease;
    }

    .legal-link:hover {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }

      .footer-bottom-content {
        flex-direction: column;
        text-align: center;
      }

      .social-links {
        align-items: center;
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  
  settings$!: Observable<Settings | undefined>;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.settings$ = this.firestoreService.getSettings();
  }
}