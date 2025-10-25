import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { ReplaySubject } from 'rxjs';

export interface AppSettings {
  // General
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // Stripe
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeCurrency: string;
  stripeTestMode: boolean;
  
  // Email
  emailProvider: string;
  emailApiKey: string;
  emailFrom: string;
  emailFromName: string;
  
  // Shipping
  shippingEnabled: boolean;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  shippingEstimate: string;
  
  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;
  analyticsEnabled: boolean;
  cookieConsentRequired: boolean;

  // SEO & Meta
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  twitterCard: string;

  // Social Media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;

  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  maxLoginAttempts: number;
  enableCaptcha: boolean;
  allowedDomains: string;

  // Notifications
  orderEmailEnabled: boolean;
  lowStockAlerts: boolean;
  lowStockThreshold: number;
  newUserNotifications: boolean;
  dailyReportEnabled: boolean;
  notificationEmail: string;

  // Business Info
  businessName: string;
  taxId: string;
  businessRegistration: string;
  supportHours: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsOfService: string;

  // Advanced
  enableCaching: boolean;
  apiRateLimit: number;
  debugMode: boolean;
  logLevel: string;
  enableCompression: boolean;
  cdnUrl: string;

  // Inventory
  trackInventory: boolean;
  allowBackorders: boolean;
  autoRestockEnabled: boolean;
  hideOutOfStock: boolean;
  stockReserveTime: number;
}

// Sensitive fields that should never be sent to frontend
const SENSITIVE_FIELDS: (keyof AppSettings)[] = [
  'stripeSecretKey',
  'emailApiKey',
];

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private readonly SETTINGS_DOC_ID = 'app';
  private readonly PUBLIC_SETTINGS_DOC_ID = 'public';
  private settingsCache: AppSettings | null = null;
  private settingsPromise: Promise<AppSettings> | null = null;
  private settingsSubject = new ReplaySubject<AppSettings>(1);

  /** Observable stream of settings changes */
  settings$ = this.settingsSubject.asObservable();

  /**
   * Get application settings from Firestore
   */
  async getSettings(forceRefresh = false): Promise<AppSettings> {
    if (this.settingsCache && !forceRefresh) {
      return this.settingsCache;
    }

    if (this.settingsPromise && !forceRefresh) {
      return this.settingsPromise;
    }

    this.settingsPromise = this.fetchSettings()
      .then(settings => {
        this.settingsCache = settings;
        this.settingsSubject.next(settings);
        return settings;
      })
      .finally(() => {
        this.settingsPromise = null;
      });

    return this.settingsPromise;
  }

  private async fetchSettings(): Promise<AppSettings> {
    try {
      // Check if user is admin (has access to full settings)
      const isAdmin = await this.isUserAdmin();
      const docId = isAdmin ? this.SETTINGS_DOC_ID : this.PUBLIC_SETTINGS_DOC_ID;
      
      const docRef = doc(this.firestore, 'settings', docId);
      const docSnap = await getDoc(docRef);
      const defaults = this.getDefaultSettings();
      
      if (docSnap.exists()) {
        const settings = { ...defaults, ...docSnap.data() } as AppSettings;
        
        // For non-admins, ensure sensitive fields are empty
        if (!isAdmin) {
          SENSITIVE_FIELDS.forEach(field => {
            (settings[field] as any) = '';
          });
        }
        
        return settings;
      }
      
      // Return default settings if none exist
      return defaults;
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Check if current user is admin
   */
  private async isUserAdmin(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      return userDoc.exists() && userDoc.data()?.['role'] === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * Get public settings document (includes stats)
   */
  async getPublicSettings(): Promise<any> {
    try {
      const docRef = doc(this.firestore, 'settings', this.PUBLIC_SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting public settings:', error);
      return null;
    }
  }

  /**
   * Save application settings to Firestore
   * Admin-only: Saves full settings to 'app' doc and public copy to 'public' doc
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      // Save full settings (admin only)
      const adminDocRef = doc(this.firestore, 'settings', this.SETTINGS_DOC_ID);
      await setDoc(adminDocRef, settings, { merge: true });
      
      // Create public copy without sensitive fields
      const publicSettings = { ...settings };
      SENSITIVE_FIELDS.forEach(field => {
        delete (publicSettings as any)[field];
      });
      
      const publicDocRef = doc(this.firestore, 'settings', this.PUBLIC_SETTINGS_DOC_ID);
      await setDoc(publicDocRef, publicSettings, { merge: true });
      
      this.settingsCache = settings;
      this.settingsSubject.next(settings);
      
      console.log('✅ Settings saved: Full settings to admin doc, public settings to public doc');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): AppSettings {
    return {
      // General
      siteName: 'TheLuxMining',
      siteDescription: 'Premium Bitcoin mining equipment',
      contactEmail: 'Luxmining1@gmail.com',
      contactPhone: '+1 (800) 555 0199',
      contactAddress: '100 Greyrock Pl F119\nStamford, CT 06901',
      maintenanceMode: false,
      maintenanceMessage: 'We are performing scheduled maintenance. Please check back soon or reach out to our support team if you need help in the meantime.',
      
      // Stripe
      stripePublicKey: '',
      stripeSecretKey: '',
      stripeCurrency: 'usd',
      stripeTestMode: true,
      
      // Email
      emailProvider: 'brevo',
      emailApiKey: '',
      emailFrom: 'noreply@theluxmining.com',
      emailFromName: 'TheLuxMining',
      
      // Shipping
      shippingEnabled: true,
      freeShippingThreshold: 100,
      defaultShippingCost: 15,
      shippingEstimate: '3-5 business days',
      
      // Analytics
      googleAnalyticsId: '',
      facebookPixelId: '',
      analyticsEnabled: true,
      cookieConsentRequired: true,

      // SEO & Meta
      metaTitle: 'TheLuxMining - Premium Bitcoin Mining Equipment',
      metaDescription: 'High-performance Bitcoin mining hardware and solutions',
      metaKeywords: 'bitcoin, mining, cryptocurrency, ASIC',
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
      businessName: 'TheLuxMining LLC',
      taxId: '',
      businessRegistration: '',
      supportHours: 'Mon-Fri 9AM-5PM EST',
      returnPolicy: '/return-policy',
      privacyPolicy: '/privacy-policy',
      termsOfService: '/terms',

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
  }
}
