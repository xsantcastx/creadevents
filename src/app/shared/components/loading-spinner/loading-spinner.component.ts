import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div 
        class="animate-spin rounded-full border-b-2"
        [class]="spinnerClass"
        [style.width.px]="size"
        [style.height.px]="size"
      ></div>
      @if (message) {
        <p class="ml-3 text-gray-600">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 40;
  @Input() message: string = '';
  @Input() containerClass: string = 'p-8';
  @Input() spinnerClass: string = 'border-indigo-600';
}
