import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../../services/category.service';
import { SettingsService, AppSettings } from '../../../services/settings.service';
import { BrandConfigService } from '../../services/brand-config.service';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  active?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <footer class="bg-gradient-to-b from-[#13151a] to-[#0a0b0d] py-16 border-t border-bitcoin-orange/20">
      <div class="page-container">
        <div class="grid md:grid-cols-4 gap-8 mb-12">
          <div class="md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <img [src]="brandLogo" [alt]="siteName" class="h-10 w-10 rounded-lg shadow-bitcoin" />
              <span class="font-serif text-xl font-semibold text-bitcoin-orange">{{ siteName }}</span>
            </div>
            <p class="text-white/70 mb-6 max-w-md">
              {{ 'footer.description' | translate }}
            </p>
            @if (supportHours) {
              <p class="text-white/60 text-sm mb-4">
                <span class="text-bitcoin-orange">{{ 'footer.business_hours' | translate }}:</span> {{ supportHours }}
              </p>
            }
            <div class="flex gap-4">
              @if (linkedinUrl) {
                <a [href]="linkedinUrl" target="_blank" rel="noopener noreferrer"
                   class="w-10 h-10 bg-bitcoin-orange/20 rounded-full flex items-center justify-center text-bitcoin-orange hover:bg-bitcoin-orange hover:text-bitcoin-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              }
              @if (instagramUrl) {
                <a [href]="instagramUrl" target="_blank" rel="noopener noreferrer"
                   class="w-10 h-10 bg-bitcoin-orange/20 rounded-full flex items-center justify-center text-bitcoin-orange hover:bg-bitcoin-orange hover:text-bitcoin-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              }
              @if (twitterUrl) {
                <a [href]="twitterUrl" target="_blank" rel="noopener noreferrer"
                   class="w-10 h-10 bg-bitcoin-orange/20 rounded-full flex items-center justify-center text-bitcoin-orange hover:bg-bitcoin-orange hover:text-bitcoin-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
              }
              @if (facebookUrl) {
                <a [href]="facebookUrl" target="_blank" rel="noopener noreferrer"
                   class="w-10 h-10 bg-bitcoin-orange/20 rounded-full flex items-center justify-center text-bitcoin-orange hover:bg-bitcoin-orange hover:text-bitcoin-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              }
              @if (youtubeUrl) {
                <a [href]="youtubeUrl" target="_blank" rel="noopener noreferrer"
                   class="w-10 h-10 bg-bitcoin-orange/20 rounded-full flex items-center justify-center text-bitcoin-orange hover:bg-bitcoin-orange hover:text-bitcoin-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              }
              @if (whatsappNumber) {
                <a [href]="getWhatsAppUrl()" target="_blank" rel="noopener noreferrer"
                   class="w-10 h-10 bg-bitcoin-orange/20 rounded-full flex items-center justify-center text-bitcoin-orange hover:bg-bitcoin-orange hover:text-bitcoin-dark transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              }
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-white mb-4">{{ 'footer.quick_links' | translate }}</h3>
            <ul class="space-y-2">
              <li><a routerLink="/" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'nav.home' | translate }}</a></li>
              <li><a routerLink="/productos" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'nav.products' | translate }}</a></li>
              <li><a routerLink="/galeria" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'nav.gallery' | translate }}</a></li>
              <li><a routerLink="/contacto" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'nav.contact' | translate }}</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold text-white mb-4">{{ 'footer.products_title' | translate }}</h3>
            <ul class="space-y-2">
              <li><a routerLink="/productos" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'nav.all_products' | translate }}</a></li>
              @for (category of categories; track category.id) {
                <li><a [routerLink]="['/productos']" [queryParams]="{category: category.slug}" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ category.name }}</a></li>
              }
            </ul>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-12 p-6 bg-bitcoin-dark/40 rounded-xl border border-bitcoin-orange/20">
          <div class="text-center">
            <h4 class="font-semibold text-bitcoin-gold mb-2">{{ 'footer.address' | translate }}</h4>
            <p class="text-white/70 text-sm whitespace-pre-line">{{ contactAddress }}</p>
          </div>
          <div class="text-center space-y-2">
            <h4 class="font-semibold text-bitcoin-gold mb-2">{{ 'footer.contact_info' | translate }}</h4>
            <p class="text-white/70 text-sm">
              <a *ngIf="contactEmail" [href]="'mailto:' + contactEmail" class="hover:text-bitcoin-orange transition-colors">{{ contactEmail }}</a>
            </p>
            @if (contactPhone) {
              <p class="text-white/70 text-sm">{{ contactPhone }}</p>
            }
          </div>
        </div>

        <div class="border-t border-bitcoin-orange/20 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-white/70 text-sm">
              &copy; 2025 {{ businessName || siteName }}. {{ 'footer.rights' | translate }}.
              <br class="md:hidden">
              <span class="text-white/50 text-xs">
                This site is protected by reCAPTCHA and the Google
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" class="underline hover:text-bitcoin-orange">Privacy Policy</a> and
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener" class="underline hover:text-bitcoin-orange">Terms of Service</a> apply.
              </span>
            </p>
            <div class="flex gap-6 text-sm">
              @if (privacyPolicyUrl && privacyPolicyUrl !== '/privacy-policy') {
                <a [routerLink]="privacyPolicyUrl" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'footer.privacy' | translate }}</a>
              }
              @if (termsOfServiceUrl && termsOfServiceUrl !== '/terms') {
                <a [routerLink]="termsOfServiceUrl" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'footer.terms' | translate }}</a>
              }
              @if (returnPolicyUrl && returnPolicyUrl !== '/return-policy') {
                <a [routerLink]="returnPolicyUrl" class="text-white/70 hover:text-bitcoin-orange transition-colors">{{ 'footer.returns' | translate }}</a>
              }
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private categoryService = inject(CategoryService);
  private brandConfig = inject(BrandConfigService);

  categories: Category[] = [];
  siteName = this.brandConfig.siteName;
  contactEmail = this.brandConfig.site.contact.email;
  contactPhone = this.brandConfig.site.contact.phone || '';
  contactAddress = this.brandConfig.site.contact.address || '';
  brandLogo = this.brandConfig.site.brand.logo;
  
  // Social Media Links
  facebookUrl = this.getSocialUrl('facebook');
  twitterUrl = this.getSocialUrl('twitter') || this.getSocialUrl('x');
  instagramUrl = this.getSocialUrl('instagram');
  linkedinUrl = this.getSocialUrl('linkedin');
  youtubeUrl = this.getSocialUrl('youtube');
  whatsappNumber = '';

  // Business Info
  businessName = '';
  supportHours = '';
  returnPolicyUrl = '';
  privacyPolicyUrl = '';
  termsOfServiceUrl = '';

  constructor() {
    // Subscribe to settings in constructor (injection context)
    this.settingsService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.applySettings(settings));
  }

  ngOnInit() {
    this.loadCategories();
    this.settingsService.getSettings().then(settings => this.applySettings(settings));
  }

  private applySettings(settings: AppSettings) {
    if (!settings) {
      return;
    }

    // General Settings
    this.siteName = settings.siteName || this.siteName;
    this.contactEmail = settings.contactEmail || this.contactEmail;
    this.contactPhone = settings.contactPhone || this.contactPhone;
    this.contactAddress = settings.contactAddress || this.contactAddress;

    // Social Media
    this.facebookUrl = settings.facebookUrl || this.facebookUrl;
    this.twitterUrl = settings.twitterUrl || this.twitterUrl;
    this.instagramUrl = settings.instagramUrl || this.instagramUrl;
    this.linkedinUrl = settings.linkedinUrl || this.linkedinUrl;
    this.youtubeUrl = settings.youtubeUrl || this.youtubeUrl;
    this.whatsappNumber = settings.whatsappNumber || '';

    // Business Info
    this.businessName = settings.businessName || settings.siteName;
    this.supportHours = settings.supportHours || '';
    this.returnPolicyUrl = settings.returnPolicy || '/return-policy';
    this.privacyPolicyUrl = settings.privacyPolicy || '/privacy-policy';
    this.termsOfServiceUrl = settings.termsOfService || '/terms';
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories
          .filter((cat: Category) => cat.active !== false)
          .sort((a: Category, b: Category) => (a.order || 0) - (b.order || 0))
          .slice(0, 3);
      },
      error: (error: any) => {
        console.error('Error loading categories for footer:', error);
      }
    });
  }

  private getSocialUrl(platform: string): string {
    const match = this.brandConfig.nav.social.find((link: { platform: string; href: string }) => link.platform === platform);
    return match?.href || '';
  }

  getWhatsAppUrl(): string {
    if (!this.whatsappNumber) return '#';
    const cleanNumber = this.whatsappNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  }
}
