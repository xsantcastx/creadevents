import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminQuickActionsComponent } from '../../../shared/components/admin-quick-actions/admin-quick-actions.component';
import { ImagePickerComponent } from '../../../shared/components/image-picker/image-picker.component';
import { LoadingComponentBase } from '../../../core/classes/loading-component.base';
import { SettingsService, AppSettings } from '../../../services/settings.service';

interface SettingSection {
  title: string;
  icon: string;
  color: string;
  settings: Setting[];
  expanded?: boolean;
}

interface Setting {
  key: keyof AppSettings;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'image';
  value: any;
  options?: { label: string; value: any }[];
  description?: string;
  placeholder?: string;
  sensitive?: boolean;
  locked?: boolean;
  showValue?: boolean;
  storagePath?: string; // For image uploads
  helpText?: string; // For image picker help text
}

type MessageType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-settings-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdminQuickActionsComponent, ImagePickerComponent],
  templateUrl: './settings-admin.page.html',
  styleUrl: './settings-admin.page.scss'
})
export class SettingsAdminComponent extends LoadingComponentBase implements OnInit {
  private settingsService = inject(SettingsService);
  
  sections: SettingSection[] = [];
  isSaving = false;
  messageKey: string | null = null;
  messageType: 'success' | 'error' | 'info' = 'info';
  messageParams: Record<string, unknown> = {};
  
  private currentSettings: AppSettings | null = null;
  private messageTimeout: any = null;

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    await this.withLoading(async () => {
      this.currentSettings = await this.settingsService.getSettings();
      this.buildSections();
    });
  }
  
  private buildSections() {
    if (!this.currentSettings) return;
    
    this.sections = [
      {
        title: 'General Settings',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        color: 'blue',
        expanded: true,
        settings: [
          { key: 'siteName', label: 'Site Name', type: 'text', value: this.currentSettings.siteName, placeholder: 'Enter site name' },
          { key: 'siteDescription', label: 'Site Description', type: 'textarea', value: this.currentSettings.siteDescription, placeholder: 'Enter site description' },
          { key: 'contactEmail', label: 'Contact Email', type: 'text', value: this.currentSettings.contactEmail, placeholder: 'email@example.com' },
          { key: 'contactPhone', label: 'Contact Phone', type: 'text', value: this.currentSettings.contactPhone, placeholder: '+1 (800) 555-0199' },
          { key: 'contactAddress', label: 'Contact Address', type: 'textarea', value: this.currentSettings.contactAddress, placeholder: 'Company address and logistics details' },
          { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'boolean', value: this.currentSettings.maintenanceMode, description: 'Enable to show maintenance page to visitors' },
          { key: 'maintenanceMessage', label: 'Maintenance Message', type: 'textarea', value: this.currentSettings.maintenanceMessage, placeholder: 'We are performing scheduled maintenance. Please check back soon.' }
        ]
      },
      {
        title: 'Stripe Configuration',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        color: 'purple',
        expanded: false,
        settings: [
          { key: 'stripePublicKey', label: 'Stripe Publishable Key', type: 'text', value: this.currentSettings.stripePublicKey, placeholder: 'pk_live_...', sensitive: true, locked: true, showValue: false },
          { key: 'stripeSecretKey', label: 'Stripe Secret Key', type: 'text', value: this.currentSettings.stripeSecretKey, placeholder: 'sk_live_...', sensitive: true, locked: true, showValue: false },
          { key: 'stripeCurrency', label: 'Currency', type: 'select', value: this.currentSettings.stripeCurrency, options: [
            { label: 'USD ($)', value: 'usd' },
            { label: 'EUR (€)', value: 'eur' },
            { label: 'GBP (£)', value: 'gbp' }
          ]},
          { key: 'stripeTestMode', label: 'Test Mode', type: 'boolean', value: this.currentSettings.stripeTestMode, description: 'Use Stripe test keys instead of live keys' }
        ]
      },
      {
        title: 'Email Configuration',
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'green',
        expanded: false,
        settings: [
          { key: 'emailProvider', label: 'Email Provider', type: 'select', value: this.currentSettings.emailProvider, options: [
            { label: 'Brevo (Sendinblue)', value: 'brevo' },
            { label: 'SendGrid', value: 'sendgrid' },
            { label: 'Mailgun', value: 'mailgun' }
          ]},
          { key: 'emailApiKey', label: 'API Key', type: 'text', value: this.currentSettings.emailApiKey, placeholder: 'Enter email service API key', sensitive: true, locked: true, showValue: false },
          { key: 'emailFrom', label: 'From Email', type: 'text', value: this.currentSettings.emailFrom, placeholder: 'noreply@example.com' },
          { key: 'emailFromName', label: 'From Name', type: 'text', value: this.currentSettings.emailFromName, placeholder: 'Your Company Name' }
        ]
      },
      {
        title: 'Shipping Settings',
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        color: 'orange',
        expanded: false,
        settings: [
          { key: 'shippingEnabled', label: 'Enable Shipping', type: 'boolean', value: this.currentSettings.shippingEnabled },
          { key: 'freeShippingThreshold', label: 'Free Shipping Threshold', type: 'number', value: this.currentSettings.freeShippingThreshold, placeholder: '0', description: 'Minimum order value for free shipping' },
          { key: 'defaultShippingCost', label: 'Default Shipping Cost', type: 'number', value: this.currentSettings.defaultShippingCost, placeholder: '0' },
          { key: 'shippingEstimate', label: 'Shipping Estimate (days)', type: 'text', value: this.currentSettings.shippingEstimate, placeholder: 'e.g., 3-5 business days' }
        ]
      },
      {
        title: 'Analytics & Tracking',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        color: 'cyan',
        expanded: false,
        settings: [
          { key: 'googleAnalyticsId', label: 'Google Analytics ID', type: 'text', value: this.currentSettings.googleAnalyticsId, placeholder: 'G-XXXXXXXXXX' },
          { key: 'facebookPixelId', label: 'Facebook Pixel ID', type: 'text', value: this.currentSettings.facebookPixelId, placeholder: 'Enter Facebook Pixel ID' },
          { key: 'analyticsEnabled', label: 'Enable Analytics', type: 'boolean', value: this.currentSettings.analyticsEnabled },
          { key: 'cookieConsentRequired', label: 'Cookie Consent Required', type: 'boolean', value: this.currentSettings.cookieConsentRequired, description: 'Show cookie consent banner (GDPR compliance)' }
        ]
      },
      {
        title: 'SEO & Meta',
        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        color: 'indigo',
        expanded: false,
        settings: [
          { key: 'metaTitle', label: 'Default Meta Title', type: 'text', value: this.currentSettings.metaTitle, placeholder: 'Your Site Name - Tagline' },
          { key: 'metaDescription', label: 'Meta Description', type: 'textarea', value: this.currentSettings.metaDescription, placeholder: 'Brief description of your site...' },
          { key: 'metaKeywords', label: 'Meta Keywords', type: 'text', value: this.currentSettings.metaKeywords, placeholder: 'keyword1, keyword2, keyword3' },
          { key: 'ogImage', label: 'Open Graph Image', type: 'image', value: this.currentSettings.ogImage, storagePath: 'settings/og-images', helpText: 'Recommended: 1200x630px for social media sharing' },
          { key: 'twitterCard', label: 'Twitter Card Type', type: 'select', value: this.currentSettings.twitterCard, options: [
            { label: 'Summary', value: 'summary' },
            { label: 'Summary Large Image', value: 'summary_large_image' }
          ]}
        ]
      },
      {
        title: 'Social Media',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        color: 'pink',
        expanded: false,
        settings: [
          { key: 'facebookUrl', label: 'Facebook URL', type: 'text', value: this.currentSettings.facebookUrl, placeholder: 'https://facebook.com/yourpage' },
          { key: 'twitterUrl', label: 'Twitter/X URL', type: 'text', value: this.currentSettings.twitterUrl, placeholder: 'https://twitter.com/yourhandle' },
          { key: 'instagramUrl', label: 'Instagram URL', type: 'text', value: this.currentSettings.instagramUrl, placeholder: 'https://instagram.com/yourhandle' },
          { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'text', value: this.currentSettings.linkedinUrl, placeholder: 'https://linkedin.com/company/yourcompany' },
          { key: 'youtubeUrl', label: 'YouTube URL', type: 'text', value: this.currentSettings.youtubeUrl, placeholder: 'https://youtube.com/@yourchannel' },
          { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text', value: this.currentSettings.whatsappNumber, placeholder: '+1234567890' }
        ]
      },
      {
        title: 'Security',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
        color: 'red',
        expanded: false,
        settings: [
          { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', type: 'boolean', value: this.currentSettings.twoFactorEnabled, description: 'Require 2FA for admin accounts' },
          { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', value: this.currentSettings.sessionTimeout, placeholder: '30' },
          { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number', value: this.currentSettings.passwordMinLength, placeholder: '8' },
          { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', value: this.currentSettings.maxLoginAttempts, placeholder: '5' },
          { key: 'enableCaptcha', label: 'Enable CAPTCHA', type: 'boolean', value: this.currentSettings.enableCaptcha, description: 'Require CAPTCHA on login/registration' },
          { key: 'allowedDomains', label: 'Allowed Email Domains', type: 'text', value: this.currentSettings.allowedDomains, placeholder: 'example.com, company.com' }
        ]
      },
      {
        title: 'Notifications',
        icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        color: 'yellow',
        expanded: false,
        settings: [
          { key: 'orderEmailEnabled', label: 'Send Order Confirmation Emails', type: 'boolean', value: this.currentSettings.orderEmailEnabled },
          { key: 'lowStockAlerts', label: 'Low Stock Alerts', type: 'boolean', value: this.currentSettings.lowStockAlerts, description: 'Email admin when inventory is low' },
          { key: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number', value: this.currentSettings.lowStockThreshold, placeholder: '10' },
          { key: 'newUserNotifications', label: 'New User Registration Alerts', type: 'boolean', value: this.currentSettings.newUserNotifications },
          { key: 'dailyReportEnabled', label: 'Daily Sales Report', type: 'boolean', value: this.currentSettings.dailyReportEnabled, description: 'Send daily sales summary email' },
          { key: 'notificationEmail', label: 'Notification Email', type: 'text', value: this.currentSettings.notificationEmail, placeholder: 'admin@example.com' }
        ]
      },
      {
        title: 'Business Info',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'teal',
        expanded: false,
        settings: [
          { key: 'businessName', label: 'Legal Business Name', type: 'text', value: this.currentSettings.businessName, placeholder: 'Your Company LLC' },
          { key: 'taxId', label: 'Tax ID / VAT Number', type: 'text', value: this.currentSettings.taxId, placeholder: 'XX-XXXXXXX' },
          { key: 'businessRegistration', label: 'Business Registration Number', type: 'text', value: this.currentSettings.businessRegistration, placeholder: 'REG123456' },
          { key: 'supportHours', label: 'Support Hours', type: 'text', value: this.currentSettings.supportHours, placeholder: 'Mon-Fri 9AM-5PM EST' },
          { key: 'returnPolicy', label: 'Return Policy URL', type: 'text', value: this.currentSettings.returnPolicy, placeholder: '/return-policy' },
          { key: 'privacyPolicy', label: 'Privacy Policy URL', type: 'text', value: this.currentSettings.privacyPolicy, placeholder: '/privacy-policy' },
          { key: 'termsOfService', label: 'Terms of Service URL', type: 'text', value: this.currentSettings.termsOfService, placeholder: '/terms' }
        ]
      },
      {
        title: 'Advanced',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        color: 'gray',
        expanded: false,
        settings: [
          { key: 'enableCaching', label: 'Enable Caching', type: 'boolean', value: this.currentSettings.enableCaching, description: 'Cache static assets and API responses' },
          { key: 'apiRateLimit', label: 'API Rate Limit (requests/min)', type: 'number', value: this.currentSettings.apiRateLimit, placeholder: '60' },
          { key: 'debugMode', label: 'Debug Mode', type: 'boolean', value: this.currentSettings.debugMode, description: 'Enable detailed logging (production: OFF)' },
          { key: 'logLevel', label: 'Log Level', type: 'select', value: this.currentSettings.logLevel, options: [
            { label: 'Error', value: 'error' },
            { label: 'Warning', value: 'warn' },
            { label: 'Info', value: 'info' },
            { label: 'Debug', value: 'debug' }
          ]},
          { key: 'enableCompression', label: 'Enable Gzip Compression', type: 'boolean', value: this.currentSettings.enableCompression },
          { key: 'cdnUrl', label: 'CDN URL', type: 'text', value: this.currentSettings.cdnUrl, placeholder: 'https://cdn.example.com' }
        ]
      },
      {
        title: 'Inventory',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        color: 'emerald',
        expanded: false,
        settings: [
          { key: 'trackInventory', label: 'Track Inventory', type: 'boolean', value: this.currentSettings.trackInventory, description: 'Enable stock tracking' },
          { key: 'allowBackorders', label: 'Allow Backorders', type: 'boolean', value: this.currentSettings.allowBackorders, description: 'Accept orders when out of stock' },
          { key: 'autoRestockEnabled', label: 'Auto Restock Notifications', type: 'boolean', value: this.currentSettings.autoRestockEnabled },
          { key: 'hideOutOfStock', label: 'Hide Out of Stock Products', type: 'boolean', value: this.currentSettings.hideOutOfStock },
          { key: 'stockReserveTime', label: 'Cart Stock Reserve Time (min)', type: 'number', value: this.currentSettings.stockReserveTime, placeholder: '15' }
        ]
      }
    ];
  }

  async saveSettings() {
    this.isSaving = true;
    this.clearMessage();

    try {
      const updatedSettings: AppSettings = {
        // General
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        maintenanceMode: false,
        maintenanceMessage: '',
        // Stripe
        stripePublicKey: '',
        stripeSecretKey: '',
        stripeCurrency: 'usd',
        stripeTestMode: true,
        // Email
        emailProvider: 'brevo',
        emailApiKey: '',
        emailFrom: '',
        emailFromName: '',
        // Shipping
        shippingEnabled: true,
        freeShippingThreshold: 0,
        defaultShippingCost: 0,
        shippingEstimate: '',
        // Analytics
        googleAnalyticsId: '',
        facebookPixelId: '',
        analyticsEnabled: true,
        cookieConsentRequired: true,
        // SEO & Meta
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogImage: '',
        twitterCard: 'summary_large_image',
        // Social Media
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
        linkedinUrl: '',
        youtubeUrl: '',
        whatsappNumber: '',
        // Security
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordMinLength: 8,
        maxLoginAttempts: 5,
        enableCaptcha: false,
        allowedDomains: '',
        // Notifications
        orderEmailEnabled: true,
        lowStockAlerts: true,
        lowStockThreshold: 10,
        newUserNotifications: false,
        dailyReportEnabled: false,
        notificationEmail: '',
        // Business Info
        businessName: '',
        taxId: '',
        businessRegistration: '',
        supportHours: '',
        returnPolicy: '',
        privacyPolicy: '',
        termsOfService: '',
        // Advanced
        enableCaching: true,
        apiRateLimit: 60,
        debugMode: false,
        logLevel: 'info',
        enableCompression: true,
        cdnUrl: '',
        // Inventory
        trackInventory: true,
        allowBackorders: false,
        autoRestockEnabled: true,
        hideOutOfStock: false,
        stockReserveTime: 15
      };

      this.sections.forEach(section => {
        section.settings.forEach(setting => {
          (updatedSettings as any)[setting.key] = setting.value;
        });
      });

      await this.settingsService.saveSettings(updatedSettings);
      this.currentSettings = updatedSettings;
      this.buildSections();
      this.showMessage('admin.settings.feedback.success', 'success');
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      this.showMessage('admin.settings.feedback.error_details', 'error', { message });
    } finally {
      this.isSaving = false;
    }
  }


  getFieldId(sectionTitle: string, key: keyof AppSettings): string {
    const sanitized = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${sanitized}-${String(key)}`;
  }

  getSectionColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      'purple': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      'green': 'bg-green-500/10 border-green-500/30 text-green-400',
      'orange': 'bg-bitcoin-orange/10 border-bitcoin-orange/30 text-bitcoin-orange',
      'cyan': 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      'indigo': 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      'pink': 'bg-pink-500/10 border-pink-500/30 text-pink-400',
      'red': 'bg-red-500/10 border-red-500/30 text-red-400',
      'yellow': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      'teal': 'bg-teal-500/10 border-teal-500/30 text-teal-400',
      'gray': 'bg-gray-500/10 border-gray-500/30 text-gray-400',
      'emerald': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    };
    return colorMap[color] || colorMap['blue'];
  }

  private showMessage(key: string, type: MessageType, params: Record<string, unknown> = {}) {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    this.messageKey = key;
    this.messageType = type;
    this.messageParams = params;

    this.messageTimeout = setTimeout(() => this.clearMessage(), 3500);
  }

  private clearMessage() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    this.messageKey = null;
    this.messageParams = {};
  }

  toggleLock(setting: Setting, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setting.locked = !setting.locked;
  }

  toggleVisibility(setting: Setting, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setting.showValue = !setting.showValue;
  }

  toggleSection(section: SettingSection, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    section.expanded = !section.expanded;
  }

  isDisabled(setting: Setting): boolean {
    return setting.locked === true;
  }

  getInputType(setting: Setting): string {
    if (setting.type === 'text' && setting.sensitive && !setting.showValue) {
      return 'password';
    }
    if (setting.type === 'text' || setting.type === 'number') {
      return setting.type;
    }
    return 'text';
  }
}
