import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService, UploadProgress } from '../../services/storage.service';

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      
      <!-- Drag and Drop Area -->
      <div 
        class="drop-zone"
        [class.dragover]="isDragOver()"
        [class.disabled]="disabled"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <div class="drop-zone-content">
          <div class="upload-icon">📁</div>
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
          <p class="file-types">{{ allowedTypesText }}</p>
          <button type="button" class="btn btn-primary" [disabled]="disabled">
            Choose Files
          </button>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        #fileInput
        type="file"
        [multiple]="multiple"
        [accept]="acceptedTypes"
        (change)="onFileSelected($event)"
        style="display: none;">

      <!-- Upload Progress -->
      @if (uploadingFiles().length > 0) {
        <div class="upload-progress">
          <h4>Uploading Files</h4>
          @for (file of uploadingFiles(); track file.name) {
            <div class="progress-item">
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="file.progress"
                  [class.error]="file.status === 'error'"
                  [class.complete]="file.status === 'completed'">
                </div>
              </div>
              
              <div class="progress-status">
                @if (file.status === 'uploading') {
                  <span class="uploading">{{ file.progress.toFixed(0) }}%</span>
                } @else if (file.status === 'completed') {
                  <span class="completed">✓ Complete</span>
                } @else if (file.status === 'error') {
                  <span class="error">✗ Error</span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Uploaded Files List -->
      @if (completedFiles().length > 0) {
        <div class="uploaded-files">
          <h4>Uploaded Files</h4>
          <div class="files-grid">
            @for (file of completedFiles(); track file.url) {
              <div class="file-card">
                @if (isImage(file.name)) {
                  <div class="file-preview">
                    <img [src]="file.url" [alt]="file.name" loading="lazy">
                  </div>
                } @else {
                  <div class="file-icon">📄</div>
                }
                
                <div class="file-details">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                
                <div class="file-actions">
                  <button 
                    type="button" 
                    class="btn-small btn-outline"
                    (click)="copyUrl(file.url)">
                    Copy URL
                  </button>
                  <button 
                    type="button" 
                    class="btn-small btn-danger"
                    (click)="removeFile(file)">
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error Messages -->
      @if (errorMessage()) {
        <div class="error-message">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
    }

    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
      margin-bottom: 1rem;
    }

    .drop-zone:hover:not(.disabled) {
      border-color: var(--theme-primary, #7FB069);
      background: #f0f8f0;
    }

    .drop-zone.dragover {
      border-color: var(--theme-primary, #7FB069);
      background: #e8f5e8;
      transform: scale(1.02);
    }

    .drop-zone.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .drop-zone-content h3 {
      margin: 0.5rem 0;
      color: var(--theme-text, #2D3436);
    }

    .drop-zone-content p {
      margin: 0.5rem 0;
      color: var(--theme-text-secondary, #636E72);
    }

    .file-types {
      font-size: 0.9rem;
      font-style: italic;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .upload-progress {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .upload-progress h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .progress-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .file-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .file-name {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .file-size {
      font-size: 0.9rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .progress-bar {
      width: 200px;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--theme-primary, #7FB069);
      transition: width 0.3s ease;
    }

    .progress-fill.complete {
      background: #28a745;
    }

    .progress-fill.error {
      background: #dc3545;
    }

    .progress-status {
      font-size: 0.9rem;
      font-weight: 500;
      min-width: 80px;
      text-align: right;
    }

    .uploading {
      color: var(--theme-primary, #7FB069);
    }

    .completed {
      color: #28a745;
    }

    .error {
      color: #dc3545;
    }

    .uploaded-files {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .uploaded-files h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .file-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s ease;
    }

    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .file-preview {
      width: 100%;
      height: 150px;
      overflow: hidden;
    }

    .file-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .file-icon {
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: #f8f9fa;
    }

    .file-details {
      padding: 1rem;
    }

    .file-details .file-name {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .file-actions {
      padding: 0 1rem 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      flex: 1;
    }

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border: 1px solid var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
      border: 1px solid #f1b0b7;
    }

    @media (max-width: 768px) {
      .progress-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .progress-bar {
        width: 100%;
      }

      .progress-status {
        text-align: left;
      }

      .files-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FileUploadComponent {
  @Input() title = 'Upload Files';
  @Input() description = 'Drag and drop files here or click to browse';
  @Input() multiple = true;
  @Input() category: 'projects' | 'services' | 'blog' | 'testimonials' | 'general' = 'general';
  @Input() acceptedTypes = 'image/jpeg,image/png,image/webp';
  @Input() maxFileSize = 10 * 1024 * 1024; // 10MB
  @Input() disabled = false;

  @Output() filesUploaded = new EventEmitter<UploadedFile[]>();
  @Output() fileDeleted = new EventEmitter<UploadedFile>();
  @Output() uploadError = new EventEmitter<string>();

  private storageService = inject(StorageService);

  isDragOver = signal(false);
  uploadingFiles = signal<UploadedFile[]>([]);
  completedFiles = signal<UploadedFile[]>([]);
  errorMessage = signal<string | null>(null);

  get allowedTypesText(): string {
    const types = this.acceptedTypes.split(',').map(type => {
      const extension = type.split('/')[1];
      return `.${extension}`;
    });
    return `Accepted formats: ${types.join(', ')}`;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    }
    // Reset input value to allow selecting the same file again
    input.value = '';
  }

  private handleFiles(files: FileList): void {
    this.errorMessage.set(null);
    
    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = this.storageService.validateFile(
        file, 
        this.acceptedTypes.split(','), 
        this.maxFileSize
      );
      
      if (validation.valid) {
        validFiles.push(file);
      } else {
        this.errorMessage.set(validation.error || 'Invalid file');
        this.uploadError.emit(validation.error || 'Invalid file');
        return;
      }
    }

    if (validFiles.length === 0) return;

    // Start uploads
    validFiles.forEach(file => {
      const uploadFile: UploadedFile = {
        name: file.name,
        url: '',
        size: file.size,
        progress: 0,
        status: 'uploading'
      };

      this.uploadingFiles.update(files => [...files, uploadFile]);

      this.storageService.uploadImageToCategory(file, this.category).subscribe({
        next: (data) => {
          const index = this.uploadingFiles().findIndex(f => f.name === file.name);
          if (index >= 0) {
            this.uploadingFiles.update(files => {
              const updated = [...files];
              updated[index] = {
                ...updated[index],
                progress: data.progress.progress
              };
              return updated;
            });

            if (data.downloadURL) {
              // Move to completed
              this.uploadingFiles.update(files => files.filter(f => f.name !== file.name));
              const completedFile: UploadedFile = {
                ...uploadFile,
                url: data.downloadURL,
                progress: 100,
                status: 'completed'
              };
              this.completedFiles.update(files => [...files, completedFile]);
              this.filesUploaded.emit([completedFile]);
            }
          }
        },
        error: (error) => {
          const index = this.uploadingFiles().findIndex(f => f.name === file.name);
          if (index >= 0) {
            this.uploadingFiles.update(files => {
              const updated = [...files];
              updated[index] = {
                ...updated[index],
                status: 'error',
                error: error.message || 'Upload failed'
              };
              return updated;
            });
          }
          this.uploadError.emit(error.message || 'Upload failed');
        }
      });
    });
  }

  removeFile(file: UploadedFile): void {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      // Extract path from URL for deletion
      const path = this.extractPathFromUrl(file.url);
      if (path) {
        this.storageService.deleteFile(path).subscribe({
          next: () => {
            this.completedFiles.update(files => files.filter(f => f.url !== file.url));
            this.fileDeleted.emit(file);
          },
          error: (error) => {
            this.errorMessage.set('Failed to delete file');
          }
        });
      } else {
        // Just remove from UI if can't extract path
        this.completedFiles.update(files => files.filter(f => f.url !== file.url));
        this.fileDeleted.emit(file);
      }
    }
  }

  copyUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      // Could show a toast notification here
      console.log('URL copied to clipboard');
    });
  }

  isImage(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      // Firebase Storage URLs contain the path after '/o/' and before '?'
      const match = url.match(/\/o\/(.+?)\?/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  }

  // Public methods for external control
  clearCompleted(): void {
    this.completedFiles.set([]);
  }

  getUploadedUrls(): string[] {
    return this.completedFiles().map(file => file.url);
  }
}