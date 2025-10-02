import { Injectable, signal, computed, inject } from '@angular/core';
import { Season, SeasonTheme, Settings } from '../models/data.models';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonalThemeService {
  private firestoreService = inject(FirestoreService);

  // Current season signal
  private currentSeason = signal<Season>(this.getCurrentSeason());

  // Theme settings signal
  private themeSettings = signal<Settings['themeBySeason'] | null>(null);

  // Computed current theme
  currentTheme = computed(() => {
    const themes = this.themeSettings();
    const season = this.currentSeason();

    if (!themes) return null;
    return themes[season];
  });

  constructor() {
    // Load theme settings from Firestore
    this.loadThemeSettings();

    // Set up automatic season checking (check every hour)
    setInterval(() => {
      this.updateCurrentSeason();
    }, 60 * 60 * 1000);
  }

  /**
   * Get the current season based on month
   */
  private getCurrentSeason(): Season {
    const month = new Date().getMonth(); // 0-11

    if (month >= 2 && month <= 4) return 'spring';   // Mar-May
    if (month >= 5 && month <= 7) return 'summer';   // Jun-Aug
    if (month >= 8 && month <= 10) return 'autumn';  // Sep-Nov
    return 'winter';                                  // Dec-Feb
  }

  /**
   * Update current season
   */
  private updateCurrentSeason(): void {
    const newSeason = this.getCurrentSeason();
    if (this.currentSeason() !== newSeason) {
      this.currentSeason.set(newSeason);
    }
  }

  /**
   * Load theme settings from Firestore
   */
  private loadThemeSettings(): void {
    this.firestoreService.getSettings().subscribe(settings => {
      if (settings?.themeBySeason) {
        this.themeSettings.set(settings.themeBySeason);

        // Check for manual season override
        if (settings.forceSeasonOverride) {
          this.currentSeason.set(settings.forceSeasonOverride);
        }
      } else {
        // Set default themes if none exist
        this.themeSettings.set(this.getDefaultThemes());
      }
    });
  }

  /**
   * Get current season
   */
  getSeason(): Season {
    return this.currentSeason();
  }

  /**
   * Get theme for specific season
   */
  getThemeForSeason(season: Season): SeasonTheme | null {
    const themes = this.themeSettings();
    return themes ? themes[season] : null;
  }

  /**
   * Override current season (for admin/testing)
   */
  overrideSeason(season: Season): void {
    this.currentSeason.set(season);
  }

  /**
   * Set current season (admin dashboard compatibility)
   */
  setCurrentSeason(season: Season): void {
    this.currentSeason.set(season);
  }

  /**
   * Get seasonal themes (admin dashboard compatibility)
   */
  getSeasonalThemes(): Settings['themeBySeason'] {
    return this.themeSettings() || this.getDefaultThemes();
  }

  /**
   * Reset to automatic season detection
   */
  resetToAutoSeason(): void {
    this.currentSeason.set(this.getCurrentSeason());
  }

  /**
   * Get seasonal copy for current season
   */
  getSeasonalCopy(): { hero: string; tagline: string; cta: string } | null {
    const theme = this.currentTheme();
    return theme ? theme.copySnippets : null;
  }

  /**
   * Get seasonal palette for current season
   */
  getSeasonalPalette(): SeasonTheme['palette'] | null {
    const theme = this.currentTheme();
    return theme ? theme.palette : null;
  }

  /**
   * Get default theme configurations
   */
  private getDefaultThemes(): Settings['themeBySeason'] {
    return {
      spring: {
        palette: {
          primary: '#5E8A75',     // Herbaceous green
          secondary: '#F0F5F2',   // Soft sage wash
          accent: '#F5D0C5',      // Blush rose
          background: '#FCFAF8',  // Warm linen
          text: '#22302D'         // Deep eucalyptus
        },
        heroImage: '/assets/seasonal/spring-hero.jpg',
        accentIllustrations: ['/assets/seasonal/spring-accent-1.svg'],
        copySnippets: {
          hero: 'Soft garden palettes for fresh beginnings.',
          tagline: 'Breathable florals and greenery tailored to spring celebrations.',
          cta: 'Plan a Spring Gathering'
        }
      },
      summer: {
        palette: {
          primary: '#D67078',     // Blooming dahlia
          secondary: '#FFF3ED',   // Light coral veil
          accent: '#F7C59F',      // Nectarine glow
          background: '#FFFBF7',  // Sunlit ivory
          text: '#382523'         // Rich berry bark
        },
        heroImage: '/assets/seasonal/summer-hero.jpg',
        accentIllustrations: ['/assets/seasonal/summer-accent-1.svg'],
        copySnippets: {
          hero: 'Bold color, joyful abundance for bright affairs.',
          tagline: 'Playful blooms and sculptural installs for summer energy.',
          cta: 'Design a Summer Statement'
        }
      },
      autumn: {
        palette: {
          primary: '#B5724F',     // Copper maple
          secondary: '#F4E5D8',   // Toasted cream
          accent: '#D9A066',      // Honeyed amber
          background: '#FAF2EA',  // Soft terracotta veil
          text: '#2F2119'         // Warm espresso
        },
        heroImage: '/assets/seasonal/autumn-hero.jpg',
        accentIllustrations: ['/assets/seasonal/autumn-accent-1.svg'],
        copySnippets: {
          hero: 'Textured warmth with copper and amber undertones.',
          tagline: 'Layered botanicals that celebrate harvest season gatherings.',
          cta: 'Curate an Autumn Soiree'
        }
      },
      winter: {
        palette: {
          primary: '#4E6A81',     // Frosted steel blue
          secondary: '#E7EEF5',   // Silky frost
          accent: '#C7D8E5',      // Glacial shimmer
          background: '#F8FAFD',  // Snowlit white
          text: '#25323D'         // Midnight spruce
        },
        heroImage: '/assets/seasonal/winter-hero.jpg',
        accentIllustrations: ['/assets/seasonal/winter-accent-1.svg'],
        copySnippets: {
          hero: 'Elegant whites, evergreens, and icy sheen.',
          tagline: 'Sculpted florals with candlelight and winter luxe accents.',
          cta: 'Plan a Winter Celebration'
        }
      }
    };
  }

  /**
   * Generate CSS custom properties for current theme
   */
  generateCSSVariables(): Record<string, string> {
    const theme = this.currentTheme();
    if (!theme) return {};

    return {
      '--theme-primary': theme.palette.primary,
      '--theme-secondary': theme.palette.secondary,
      '--theme-accent': theme.palette.accent,
      '--theme-background': theme.palette.background,
      '--theme-text': theme.palette.text,
      '--theme-surface': theme.palette.secondary,
      '--theme-hero-image': `url('${theme.heroImage}')`
    };
  }

  /**
   * Apply theme CSS variables to document
   */
  applyThemeToDocument(): void {
    // Check if running in browser before accessing document
    if (typeof document !== 'undefined') {
      const variables = this.generateCSSVariables();
      const root = document.documentElement;

      Object.entries(variables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }
}
