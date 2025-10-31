import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { SettingsService } from './settings.service';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private platformId = inject(PLATFORM_ID);
  private settingsService = inject(SettingsService);
  private isBrowser = isPlatformBrowser(this.platformId);
  private scriptLoaded = false;
  private currentSiteKey: string | null = null;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Check if CAPTCHA is enabled in settings
   */
  async isCaptchaEnabled(): Promise<boolean> {
    const { enabled } = await this.getCaptchaConfig();
    return enabled;
  }

  /**
   * Resolve the effective reCAPTCHA configuration combining environment and remote settings.
   */
  private async getCaptchaConfig(): Promise<{ enabled: boolean; siteKey: string | null }> {
    const environmentConfig = environment.recaptcha || {};
    const environmentEnabled = environmentConfig.enabled !== false;
    const defaultSiteKey = (environmentConfig.siteKey || '').trim();
    const testSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    try {
      const settings = await this.settingsService.getSettings();
      const settingsEnabled = !!settings.enableCaptcha;
      const settingsSiteKey = (settings.recaptchaSiteKey || '').trim();

      let siteKey = settingsSiteKey || defaultSiteKey;

      if (!siteKey && !environment.production) {
        siteKey = testSiteKey;
      }

      return {
        enabled: environmentEnabled && settingsEnabled,
        siteKey: siteKey || null
      };
    } catch (error) {
      console.warn('[RecaptchaService] Failed to load settings, falling back to environment config', error);

      let siteKey = defaultSiteKey;

      if (!siteKey && !environment.production) {
        siteKey = testSiteKey;
      }

      return {
        enabled: environmentEnabled,
        siteKey: siteKey || null
      };
    }
  }

  /**
   * Load reCAPTCHA v3 script
   */
  private async loadRecaptchaScript(siteKey: string): Promise<void> {
    // Only load in browser
    if (!this.isBrowser) {
      return;
    }

    if (!siteKey) {
      console.warn('[RecaptchaService] Missing reCAPTCHA site key, skipping script load');
      return;
    }

    // Check if CAPTCHA is enabled before loading script
    const environmentConfig = environment.recaptcha || {};
    const enabled = environmentConfig.enabled !== false; // Default to true if not specified
    if (!enabled) {
      console.log('[RecaptchaService] reCAPTCHA is disabled in environment config');
      return;
    }

    // If the script is already loaded for the current site key, reuse it
    if (this.scriptLoaded && this.currentSiteKey === siteKey) {
      return;
    }

    // If we're loading a different site key, remove any existing script and reset grecaptcha
    if (this.currentSiteKey && this.currentSiteKey !== siteKey) {
      this.removeExistingScript();
      this.loadingPromise = null;
      this.scriptLoaded = false;
    }

    this.currentSiteKey = siteKey;

    // If already loaded or loading, return existing promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Check if script already exists for the current site key
      const existingScript = document.querySelector(`script[data-recaptcha-site-key="${siteKey}"]`);
      if (existingScript) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      // Remove any stale script to avoid conflicting site keys
      this.removeExistingScript();

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-recaptcha-site-key', siteKey);

      script.onload = () => {
        this.scriptLoaded = true;
        console.log('[RecaptchaService] reCAPTCHA script loaded successfully');
        this.loadingPromise = null;
        resolve();
      };

      script.onerror = (error) => {
        console.error('[RecaptchaService] Failed to load reCAPTCHA script:', error);
        this.loadingPromise = null;
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * Remove any existing reCAPTCHA script from the DOM
   */
  private removeExistingScript(): void {
    if (!this.isBrowser) {
      return;
    }

    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Reset global grecaptcha instance when possible
    if (typeof window !== 'undefined') {
      try {
        if (window.grecaptcha) {
          delete window.grecaptcha;
        }
      } catch (error) {
        console.warn('[RecaptchaService] Unable to reset existing grecaptcha instance', error);
      }
    }
  }

  /**
   * Execute reCAPTCHA v3 and get token
   * @param action - The action name (e.g., 'login', 'register', 'submit_form')
   */
  async execute(action: string): Promise<string | null> {
    // Resolve configuration before attempting to execute
    const { enabled, siteKey } = await this.getCaptchaConfig();
    if (!enabled) {
      console.log('[RecaptchaService] CAPTCHA is disabled in settings, skipping verification');
      return null;
    }

    // Only execute in browser
    if (!this.isBrowser) {
      console.log('[RecaptchaService] Not in browser, skipping CAPTCHA');
      return null;
    }

    if (!siteKey) {
      console.warn('[RecaptchaService] No reCAPTCHA site key configured, skipping execution');
      return null;
    }

    try {
      // Load script if not already loaded
      await this.loadRecaptchaScript(siteKey);

      // Wait for grecaptcha to be ready
      return new Promise((resolve, reject) => {
        const checkReady = () => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            window.grecaptcha.ready(async () => {
              try {
                const token = await window.grecaptcha.execute(
                  siteKey,
                  { action }
                );
                console.log('[RecaptchaService] Token generated for action:', action);
                resolve(token);
              } catch (error) {
                console.error('[RecaptchaService] Error executing reCAPTCHA:', error);
                reject(error);
              }
            });
          } else {
            // Check again after a short delay
            setTimeout(checkReady, 100);
          }
        };

        checkReady();

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('reCAPTCHA timeout'));
        }, 10000);
      });
    } catch (error) {
      console.error('[RecaptchaService] CAPTCHA execution failed:', error);
      throw error;
    }
  }

  /**
   * Verify token on the server (optional - usually done in Cloud Functions)
   * This is a placeholder - actual verification should happen server-side
   */
  async verifyToken(token: string): Promise<boolean> {
    // In production, send token to your backend for verification
    // Backend should verify with Google's API using the secret key
    console.log('[RecaptchaService] Token verification should be done server-side');
    
    // For now, just check if token exists
    return !!(token && token.length > 0);
  }

  /**
   * Reset reCAPTCHA (useful for forms that can be submitted multiple times)
   */
  reset(): void {
    if (this.isBrowser && window.grecaptcha) {
      try {
        window.grecaptcha.reset();
        console.log('[RecaptchaService] reCAPTCHA reset');
      } catch (error) {
        console.error('[RecaptchaService] Error resetting reCAPTCHA:', error);
      }
    }
  }
}
