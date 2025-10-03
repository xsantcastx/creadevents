import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, UploadProgress } from '../../services/storage.service';

export type UploadSection = 'home' | 'services' | 'projects' | 'blog' | 'testimonials' | 'about' | 'contact' | 'gallery';

@Component({
  selector: 'app-section-uploader',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-uploader">
      <h3>Upload to {{ sectionName() | titlecase }}</h3>
      
      <!-- Section Selector -->
      <div class="section-selector">
        <label for="section">Section:</label>
        <select [(ngModel)]="selectedSection" class="section-select">
          <option value="home">Home Page</option>
          <option value="services">Services</option>
          <option value="projects">Projects/Portfolio</option>
          <option value="blog">Blog</option>
          <option value="testimonials">Testimonials</option>
          <option value="about">About Us</option>
          <option value="contact">Contact</option>
          <option value="gallery">Public Gallery</option>
        </select>
      </div>

      <!-- Subsection Input -->
      <div class="subsection-input" *ngIf="selectedSection">
        <label for="subsection">Subfolder (optional):</label>
        <input 
          type="text" 
          [(ngModel)]="subsection" 
          placeholder="e.g., hero, team, backgrounds"
          class="subsection-field">
      </div>

      <!-- File Upload -->
      <div class="file-upload">
        <input 
          type="file" 
          (change)="onFileSelected($event)"
          accept="image/*"
          multiple
          #fileInput
          class="file-input"
          [disabled]="disabled()">
        
        <button 
          type="button"
          (click)="fileInput.click()"
          class="upload-btn"
          [disabled]="disabled()"
          [class.disabled]="disabled()">
          Choose Images
        </button>
      </div>

      <!-- Upload Progress -->
      <div class="upload-progress" *ngIf="uploads.length > 0">
        <div *ngFor="let upload of uploads" class="upload-item">
          <div class="upload-info">
            <span class="filename">{{ upload.fileName }}</span>
            <span class="progress">{{ upload.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              [style.width.%]="upload.progress">
            </div>
          </div>
          <div *ngIf="upload.completed && upload.url" class="upload-success">
            <span>✅ Uploaded to: {{ upload.path }}</span>
            <button 
              type="button"
              (click)="copyUrl(upload.url!)"
              class="copy-btn">
              Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-uploader {
      max-width: 500px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }

    .section-selector, .subsection-input {
      margin-bottom: 15px;
    }

    .section-select, .subsection-field {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .file-input {
      display: none;
    }

    .upload-btn {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .upload-btn:hover:not(.disabled) {
      background: #0056b3;
    }

    .upload-btn.disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .upload-progress {
      margin-top: 20px;
    }

    .upload-item {
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .upload-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .progress-bar {
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #28a745;
      transition: width 0.3s ease;
    }

    .upload-success {
      margin-top: 10px;
      padding: 8px;
      background: #d4edda;
      border-radius: 4px;
      font-size: 12px;
    }

    .copy-btn {
      margin-left: 10px;
      padding: 4px 8px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 3px;
      font-size: 11px;
      cursor: pointer;
    }
  `]
})
export class SectionUploaderComponent {
  // Inputs
  sectionName = input<string>('Image Upload');
  disabled = input<boolean>(false);
  
  // Outputs
  uploadComplete = output<{ url: string; path: string }>();

  private storageService = inject(StorageService);

  selectedSection: UploadSection = 'home';
  subsection = '';
  uploads: Array<{
    fileName: string;
    progress: number;
    completed: boolean;
    url?: string;
    path?: string;
  }> = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => this.uploadFile(file));
    }
  }

  uploadFile(file: File) {
    const upload = {
      fileName: file.name,
      progress: 0,
      completed: false,
      url: undefined as string | undefined,
      path: this.generatePath(file.name)
    };
    
    this.uploads.push(upload);

    // Choose upload method based on section
    let uploadObservable;
    
    if (this.selectedSection === 'gallery') {
      uploadObservable = this.storageService.uploadToGallery(file, this.subsection);
    } else if (['projects', 'services', 'blog', 'testimonials'].includes(this.selectedSection)) {
      uploadObservable = this.storageService.uploadImageToCategory(file, this.selectedSection as any);
    } else {
      // Custom path for home, about, contact
      const path = this.generatePath(file.name);
      uploadObservable = this.storageService.uploadFile(file, path);
    }

    uploadObservable.subscribe({
      next: (result) => {
        upload.progress = result.progress.progress;
        if (result.downloadURL) {
          upload.completed = true;
          upload.url = result.downloadURL;
          this.uploadComplete.emit({ url: result.downloadURL, path: upload.path! });
        }
      },
      error: (error) => {
        console.error('Upload failed:', error);
        upload.completed = true;
      }
    });
  }

  generatePath(fileName: string): string {
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const basePath = this.subsection 
      ? `${this.selectedSection}/${this.subsection}` 
      : this.selectedSection;
    
    return `${basePath}/${timestamp}_${cleanName}`;
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    });
  }
}