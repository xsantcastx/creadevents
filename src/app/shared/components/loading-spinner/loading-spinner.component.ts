import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SpinnerPreset = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center gap-3" [ngClass]="containerClass">
      <div
        class="app-spinner"
        [ngClass]="resolvedSpinnerClass"
        [ngStyle]="spinnerStyles"
        role="status"
        aria-live="polite"
      >
        <img
          [src]="logoSrc"
          [alt]="logoAlt"
          decoding="async"
          [attr.width]="logoDimension"
          [attr.height]="logoDimension"
        />
        <span class="sr-only">{{ ariaLabel }}</span>
      </div>

      @if (message) {
        <p class="text-sm font-medium text-gray-400">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: SpinnerPreset | number = 'md';
  @Input() message: string = '';
  @Input() containerClass: string | string[] = 'p-8';
  @Input() spinnerClass: string | string[] = '';
  @Input() logoSrc = '/Logo Clear.png';
  @Input() logoAlt = 'TheLuxMining loader';
  @Input() ariaLabel = 'Cargando contenido, espere un momento';

  get resolvedSpinnerClass(): string[] {
    const classes: string[] = [];

    if (typeof this.size === 'string' && this.size !== 'md') {
      classes.push(`app-spinner--${this.size}`);
    }

    if (this.spinnerClass) {
      if (Array.isArray(this.spinnerClass)) {
        classes.push(...this.spinnerClass);
      } else {
        classes.push(...this.spinnerClass.split(' ').filter(Boolean));
      }
    }

    return classes;
  }

  get spinnerStyles(): Record<string, string> | null {
    if (typeof this.size === 'number') {
      return {
        '--spinner-size': `${this.size}px`
      };
    }

    return null;
  }

  get logoDimension(): number {
    if (typeof this.size === 'number') {
      return Math.round(this.size * 1.1);
    }

    switch (this.size) {
      case 'sm':
        return 32;
      case 'lg':
        return 112;
      default:
        return 72;
    }
  }
}
