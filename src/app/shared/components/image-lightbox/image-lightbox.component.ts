import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && imageUrl) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        (click)="close()"
      >
        <button
          type="button"
          (click)="close()"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Close lightbox"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="relative max-w-7xl max-h-[90vh] p-4" (click)="$event.stopPropagation()">
          <img
            [src]="imageUrl"
            [alt]="altText"
            class="max-w-full max-h-[90vh] object-contain"
            [style.transform]="'scale(' + zoomLevel + ')'"
            [style.transition]="'transform 0.3s ease'"
          />

          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2">
            <button
              type="button"
              (click)="zoomOut(); $event.stopPropagation()"
              class="px-3 py-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
              [disabled]="zoomLevel <= 1"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span class="px-3 py-1 text-white">{{ Math.round(zoomLevel * 100) }}%</span>
            <button
              type="button"
              (click)="zoomIn(); $event.stopPropagation()"
              class="px-3 py-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
              [disabled]="zoomLevel >= 3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ImageLightboxComponent {
  @Input() imageUrl: string = '';
  @Input() altText: string = '';
  @Input() isOpen: boolean = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  zoomLevel = 1;
  Math = Math;

  close(): void {
    this.isOpen = false;
    this.zoomLevel = 1;
    this.isOpenChange.emit(false);
  }

  zoomIn(): void {
    if (this.zoomLevel < 3) {
      this.zoomLevel += 0.25;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 1) {
      this.zoomLevel -= 0.25;
    }
  }
}
