import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'es' | 'en' | 'fr' | 'it';

const LS_LANG_KEY = 'ts_lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private currentLang$ = new BehaviorSubject<Language>('es');
  
  readonly lang$ = this.currentLang$.asObservable();
  
  readonly languages: { code: Language; name: string; flag: string }[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    // Set available languages
    this.translate.addLangs(['es', 'en', 'fr', 'it']);
    
    let defaultLang: Language = 'es';
    
    // Only access localStorage in browser
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(LS_LANG_KEY) as Language;
      const browserLang = this.translate.getBrowserLang() as Language;
      defaultLang = stored || 
        (this.isValidLanguage(browserLang) ? browserLang : 'es');
    }
    
    this.translate.setDefaultLang('es');
    this.setLanguage(defaultLang);
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['es', 'en', 'fr', 'it'].includes(lang);
  }

  setLanguage(lang: Language): void {
    this.translate.use(lang);
    this.currentLang$.next(lang);
    
    // Only store in localStorage if in browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LS_LANG_KEY, lang);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLang$.value;
  }

  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}
