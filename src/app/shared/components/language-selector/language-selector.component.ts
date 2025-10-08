import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span>{{ currentLanguage.flag }}</span>
        <span class="hidden sm:inline">{{ currentLanguage.name }}</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      @if (isOpen) {
        <div class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div class="py-1" role="menu">
            @for (lang of languageService.languages; track lang.code) {
              <button
                type="button"
                (click)="selectLanguage(lang.code)"
                class="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                [class.bg-gray-100]="lang.code === currentLanguage.code"
                [class.font-semibold]="lang.code === currentLanguage.code"
              >
                <span>{{ lang.flag }}</span>
                <span>{{ lang.name }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class LanguageSelectorComponent {
  languageService = inject(LanguageService);
  isOpen = false;
  currentLanguage = this.languageService.languages[0];

  constructor() {
    this.languageService.lang$.subscribe(lang => {
      const found = this.languageService.languages.find(l => l.code === lang);
      if (found) this.currentLanguage = found;
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(code: Language): void {
    this.languageService.setLanguage(code);
    this.isOpen = false;
  }
}
