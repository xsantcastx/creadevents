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

    const debug = !!settings?.debugMode;
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

    // Derive readable button text colors for contrast
    const primaryText = this.getContrastText(themeVars['--ts-accent'] as string);
    const secondaryBg = (themeVars['--ts-accent-soft'] as string) || (themeVars['--ts-accent'] as string);
    const secondaryText = this.getContrastText(secondaryBg);
    root.style.setProperty('--ts-btn-primary-text', primaryText);
    root.style.setProperty('--ts-btn-secondary-text', secondaryText);

    // Apply background effect class to body
    this.applyBackgroundEffect(settings.themeBackgroundEffect || 'none');
    this.applyFeatureToggle('use-premium-cards', !!settings.themePremiumCards);
    this.applyFeatureToggle('use-high-contrast', !!settings.themeHighContrast);
    this.applyFeatureToggle('use-card-texture', !!settings.themeCardTexture);
    this.applyFeatureToggle('use-button-glow', !!settings.themeButtonGlow);

    if (debug) {
      console.log('Theme applied:', themeVars);
    }
  }

  /**
   * Apply background effect class to body element
   */
  private applyBackgroundEffect(effect: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    
    // Remove all existing background effect classes
    const effectClasses = [
      'bg-effect-floral-garden',
      'bg-effect-grass-borders',
      'bg-effect-elegant-vines',
      'bg-effect-botanical-pattern',
      'bg-effect-subtle-leaves',
      'bg-effect-falling-snow',
      'bg-effect-falling-petals',
      'bg-effect-falling-leaves',
      'bg-effect-floating-hearts',
      'bg-effect-watercolor-wash',
      'bg-effect-vine-frame'
    ];
    
    effectClasses.forEach(className => body.classList.remove(className));

    // Add new effect class if not 'none'
    if (effect && effect !== 'none') {
      body.classList.add(`bg-effect-${effect}`);
    }
  }

  private applyFeatureToggle(className: string, enabled: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }
    const body = document.body;
    if (enabled) {
      body.classList.add(className);
    } else {
      body.classList.remove(className);
    }
  }

  /** Compute high-contrast text (black/white) against a given hex color */
  private getContrastText(hexColor: string): string {
    const hex = hexColor?.replace('#', '');
    if (!hex || (hex.length !== 6 && hex.length !== 3)) {
      return '#ffffff';
    }
    const normalized = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex;
    const r = parseInt(normalized.substring(0, 2), 16) / 255;
    const g = parseInt(normalized.substring(2, 4), 16) / 255;
    const b = parseInt(normalized.substring(4, 6), 16) / 255;
    const srgb = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return luminance > 0.55 ? '#111827' : '#ffffff';
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
