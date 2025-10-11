import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="language-trigger"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen"
      >
        <span class="flag">{{ currentLanguage.flag }}</span>
        <span class="code">{{ currentLanguage.label }}</span>
        <span class="name hidden lg:inline">{{ currentLanguage.name }}</span>
        <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class.rotate-180]="isOpen">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      @if (isOpen) {
        <div class="language-menu menu-surface">
          <ul role="listbox">
            @for (lang of languageService.languages; track lang.code) {
              <li>
                <button
                  type="button"
                  (click)="selectLanguage(lang.code)"
                  class="language-option"
                  [class.active]="lang.code === currentLanguage.code"
                >
                  <span class="flag">{{ lang.flag }}</span>
                  <span class="option-text">
                    <span class="code">{{ lang.label }}</span>
                    <span class="name">{{ lang.name }}</span>
                  </span>
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .language-selector {
      position: relative;
      background: transparent;
    }

    .language-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.45rem 0.9rem;
      border-radius: 0.9rem;
      border: 1px solid rgba(17, 24, 39, 0.12);
      font-weight: 600;
      letter-spacing: 0.03em;
      background: #ffffff;
      color: #111827;
      transition: all 0.2s ease;
      cursor: pointer;
      box-shadow: 0 16px 34px -24px rgba(15, 23, 42, 0.4);
    }

    .language-trigger .flag {
      font-size: 1.05rem;
    }

    .language-trigger .code {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #4b5563;
    }

    .language-trigger .name {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .language-trigger .chevron {
      width: 1rem;
      height: 1rem;
      transition: transform 0.2s ease;
    }

    .language-trigger:hover {
      background: #f3f4f6;
    }

    :host-context(.text-white) .language-trigger {
      background: #1f2937;
      border-color: rgba(148, 163, 184, 0.18);
      color: #f8fafc;
      box-shadow: 0 16px 34px -24px rgba(15, 23, 42, 0.6);
    }

    :host-context(.text-white) .language-trigger .code {
      color: rgba(248, 250, 252, 0.76);
    }

    :host-context(.text-white) .language-trigger:hover {
      background: #111827;
    }

    .language-menu {
      position: absolute;
      right: 0;
      margin-top: 0.5rem;
      min-width: 12rem;
      border-radius: 1rem;
      padding: 0.5rem 0;
      background: #ffffff;
      color: #111827;
      border: 1px solid rgba(17, 24, 39, 0.08);
      box-shadow: 0 24px 55px -22px rgba(15, 23, 42, 0.4);
      z-index: 40;
    }

    :host-context(.text-white) .language-menu {
      background: #1f2937;
      border-color: rgba(148, 163, 184, 0.25);
      color: #f8fafc;
    }

    .language-menu ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .language-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1rem;
      background: #ffffff;
      border: none;
      cursor: pointer;
      color: #111827;
      transition: background-color 0.18s ease, color 0.18s ease;
      text-align: left;
    }

    .language-option:hover {
      background: #f3f4f6;
    }

    .language-option .flag {
      font-size: 1.05rem;
    }

    .language-option .option-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      line-height: 1.1;
    }

    .language-option .option-text .code {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #6b7280;
    }

    .language-option .option-text .name {
      font-size: 0.85rem;
      font-weight: 500;
      color: inherit;
    }

    .language-option.active {
      background: #f6efe6;
      color: #b08968;
    }

    :host-context(.text-white) .language-option {
      background: #1f2937;
      color: #f8fafc;
    }

    :host-context(.text-white) .language-option:hover {
      background: #111827;
    }

    :host-context(.text-white) .language-option .option-text .code {
      color: rgba(248, 250, 252, 0.6);
    }

    :host-context(.text-white) .language-option.active {
      background: rgba(176, 137, 104, 0.22);
      color: #f5e8d8;
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
