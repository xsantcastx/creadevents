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
  private loadingPromise: Promise<void> | null = null;

  /**
   * Check if CAPTCHA is enabled in settings
   */
  async isCaptchaEnabled(): Promise<boolean> {
    const settings = await this.settingsService.getSettings();
    return settings.enableCaptcha;
  }

  /**
   * Load reCAPTCHA v3 script
   */
  private async loadRecaptchaScript(): Promise<void> {
    // Only load in browser
    if (!this.isBrowser) {
      return;
    }

    // Check if CAPTCHA is enabled before loading script
    const enabled = environment.recaptcha.enabled !== false; // Default to true if not specified
    if (!enabled) {
      console.log('[RecaptchaService] reCAPTCHA is disabled in environment config');
      return;
    }

    // If already loaded or loading, return existing promise
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="recaptcha"]')) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptcha.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.scriptLoaded = true;
        console.log('[RecaptchaService] reCAPTCHA script loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        console.error('[RecaptchaService] Failed to load reCAPTCHA script:', error);
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  /**
   * Execute reCAPTCHA v3 and get token
   * @param action - The action name (e.g., 'login', 'register', 'submit_form')
   */
  async execute(action: string): Promise<string | null> {
    // Check if CAPTCHA is enabled
    const enabled = await this.isCaptchaEnabled();
    if (!enabled) {
      console.log('[RecaptchaService] CAPTCHA is disabled in settings, skipping verification');
      return null;
    }

    // Only execute in browser
    if (!this.isBrowser) {
      console.log('[RecaptchaService] Not in browser, skipping CAPTCHA');
      return null;
    }

    try {
      // Load script if not already loaded
      await this.loadRecaptchaScript();

      // Wait for grecaptcha to be ready
      return new Promise((resolve, reject) => {
        const checkReady = () => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            window.grecaptcha.ready(async () => {
              try {
                const token = await window.grecaptcha.execute(
                  environment.recaptcha.siteKey,
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
