import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private settingsService = inject(SettingsService);
  private initialized = false;

  /**
   * Initialize theme from settings
   * This should be called once during app initialization
   */
  async initializeTheme(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const settings = await this.settingsService.getSettings();
      this.applyTheme(settings);
      this.initialized = true;
      
      // Subscribe to settings changes to update theme dynamically
      this.settingsService.settings$.subscribe(updatedSettings => {
        this.applyTheme(updatedSettings);
      });
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      this.applyDefaultTheme();
    }
  }

  /**
   * Apply theme variables from settings to the DOM
   */
  private applyTheme(settings: any): void {
    if (typeof document === 'undefined') {
      return; // SSR safety
    }

    const root = document.documentElement;
    const themeVars = {
      '--ts-accent': settings.themeAccentColor || '#a8c5a4',
      '--ts-accent-soft': settings.themeAccentSoft || '#c1d5be',
      '--ts-accent-dark': settings.themeAccentDark || '#8aab85',
      '--ts-ink': settings.themeInkColor || '#1d2a39',
      '--ts-ink-soft': settings.themeInkSoft || '#3f5f47',
      '--ts-bg': settings.themeBgColor || '#f8f9fa',
      '--ts-paper': settings.themePaperColor || '#ffffff',
      '--ts-line': settings.themeLineColor || '#e5e7eb'
    };

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    console.log('🎨 Theme applied:', themeVars);
  }

  /**
   * Apply default theme values
   */
  private applyDefaultTheme(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const defaultTheme = {
      '--ts-accent': '#a8c5a4',
      '--ts-accent-soft': '#c1d5be',
      '--ts-accent-dark': '#8aab85',
      '--ts-ink': '#1d2a39',
      '--ts-ink-soft': '#3f5f47',
      '--ts-bg': '#f8f9fa',
      '--ts-paper': '#ffffff',
      '--ts-line': '#e5e7eb'
    };

    Object.entries(defaultTheme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    console.log('🎨 Default theme applied');
  }
}
