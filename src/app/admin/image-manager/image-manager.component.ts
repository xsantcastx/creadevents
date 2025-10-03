import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, StorageFile } from '../../services/storage.service';
import { ImageManagerService } from '../../services/image-manager.service';
import { SectionUploaderComponent } from '../../shared/section-uploader/section-uploader.component';

interface SectionConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subfolders: string[];
  examples: string[];
  subsections: SubsectionConfig[];
}

interface SubsectionConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  examples: string[];
  maxImages?: number;
  recommended: string[];
  placeholders: PlaceholderConfig[];
}

interface PlaceholderConfig {
  id: string;
  name: string;
  description: string;
  currentImage?: string;
  stagedImage?: string;
  position: string;
  size: string;
  required: boolean;
}

@Component({
  selector: 'app-image-manager',
  imports: [CommonModule, FormsModule, SectionUploaderComponent],
  template: `
    <div class="image-manager">
      <!-- Header -->
      <div class="manager-header">
        <h1>📸 Image Manager</h1>
        <p>Organize and upload images to different sections of your website</p>
      </div>

      <!-- Section Cards Grid -->
      <div class="sections-grid">
        <div 
          *ngFor="let section of sections()" 
          class="section-card"
          [class.active]="selectedSection() === section.id"
          (click)="selectSection(section)"
          [style.border-left-color]="section.color">
          
          <!-- Section Header -->
          <div class="section-header">
            <div class="section-icon" [style.background]="section.color + '20'">
              {{ section.icon }}
            </div>
            <div class="section-info">
              <h3>{{ section.name }}</h3>
              <p>{{ section.description }}</p>
            </div>
            <div class="section-count">
              <span class="count">{{ getSectionImageCount(section.id) }}</span>
              <span class="label">images</span>
            </div>
          </div>

          <!-- Section Examples -->
          <div class="section-examples">
            <strong>Examples:</strong>
            <div class="example-tags">
              <span 
                *ngFor="let example of section.examples" 
                class="example-tag"
                [style.background]="section.color + '15'">
                {{ example }}
              </span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="section-actions">
            <button 
              type="button"
              (click)="openUploader(section); $event.stopPropagation()"
              class="action-btn upload-btn"
              [style.background]="section.color">
              📤 Upload
            </button>
            <button 
              type="button"
              (click)="viewSectionImages(section); $event.stopPropagation()"
              class="action-btn view-btn">
              👁️ View ({{ getSectionImageCount(section.id) }})
            </button>
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <div class="upload-modal" *ngIf="showUploader()" (click)="closeUploader()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedSectionConfig()?.icon }} Upload to {{ selectedSectionConfig()?.name }}</h2>
            <button type="button" (click)="closeUploader()" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="section-info-box" [style.background]="selectedSectionConfig()?.color + '10'">
              <p><strong>{{ selectedSectionConfig()?.description }}</strong></p>
              <p>Choose exactly where this image should go:</p>
            </div>

            <!-- Subsection Selection -->
            <div class="subsections-grid">
              <div 
                *ngFor="let subsection of selectedSectionConfig()?.subsections" 
                class="subsection-card"
                [class.selected]="selectedSubsection() === subsection.id"
                (click)="selectSubsection(subsection)"
                [style.border-color]="selectedSubsection() === subsection.id ? selectedSectionConfig()?.color : '#e9ecef'">
                
                <div class="subsection-header">
                  <span class="subsection-icon">{{ subsection.icon }}</span>
                  <div class="subsection-info">
                    <h4>{{ subsection.name }}</h4>
                    <p>{{ subsection.description }}</p>
                  </div>
                  <div class="subsection-stats">
                    <span class="image-count">{{ getSubsectionImageCount(subsection.path) }}</span>
                    <span class="max-images" *ngIf="subsection.maxImages">/ {{ subsection.maxImages }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Placeholder Selection (only show when subsection is selected) -->
            <div class="placeholders-section" *ngIf="selectedSubsection() && getSelectedSubsectionDetails()?.placeholders?.length">
              <h3>📍 Choose Exact Placement</h3>
              <p>Select which specific placeholder this image will replace:</p>
              
              <div class="placeholders-grid">
                <div 
                  *ngFor="let placeholder of getSelectedSubsectionDetails()?.placeholders" 
                  class="placeholder-card"
                  [class.selected]="selectedPlaceholder()?.id === placeholder.id"
                  [class.occupied]="placeholder.currentImage"
                  (click)="selectPlaceholder(placeholder)">
                  
                  <div class="placeholder-header">
                    <div class="placeholder-info">
                      <h4>{{ placeholder.name }}</h4>
                      <p>{{ placeholder.description }}</p>
                    </div>
                    <div class="placeholder-meta">
                      <span class="placeholder-size">{{ placeholder.size }}</span>
                      <span class="placeholder-required" *ngIf="placeholder.required">Required</span>
                    </div>
                  </div>
                  
                  <div class="placeholder-position">
                    <strong>Position:</strong> {{ placeholder.position }}
                  </div>
                  
                  <!-- Current Image Preview -->
                  <div class="current-image" *ngIf="placeholder.currentImage">
                    <img [src]="placeholder.currentImage" alt="Current image">
                    <div class="image-overlay">
                      <span>Current Image</span>
                    </div>
                  </div>
                  
                  <!-- Staged Image Preview -->
                  <div class="staged-image" *ngIf="placeholder.stagedImage">
                    <img [src]="placeholder.stagedImage" alt="Staged image">
                    <div class="image-overlay staged">
                      <span>Staged for Replacement</span>
                    </div>
                  </div>
                  
                  <!-- Empty Placeholder -->
                  <div class="empty-placeholder" *ngIf="!placeholder.currentImage && !placeholder.stagedImage">
                    <div class="empty-icon">📷</div>
                    <span>No image selected</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload Component (only show when subsection is selected) -->
            <div class="upload-area" *ngIf="selectedSubsection()">
              <div class="selected-path-info">
                <h3>📁 Uploading to: {{ getSelectedSubsectionPath() }}</h3>
                <p>{{ getSelectedSubsectionDetails()?.description }}</p>
                
                <!-- Staging Information -->
                <div class="staging-info" *ngIf="selectedPlaceholder()">
                  <div class="selected-placeholder">
                    <h4>🎯 Selected Placeholder: {{ selectedPlaceholder()?.name }}</h4>
                    <p>{{ selectedPlaceholder()?.description }}</p>
                    <small>Position: {{ selectedPlaceholder()?.position }} | Size: {{ selectedPlaceholder()?.size }}</small>
                  </div>
                </div>
              </div>

              <app-section-uploader
                [sectionName]="getSelectedSubsectionPath()"
                (uploadComplete)="onImageUploaded($event)"
                [disabled]="!selectedPlaceholder()">
              </app-section-uploader>
              
              <!-- Placeholder Selection Required Message -->
              <div class="placeholder-required" *ngIf="!selectedPlaceholder()">
                <div class="warning-icon">⚠️</div>
                <h4>Please Select a Placeholder First</h4>
                <p>Choose exactly where this image will be placed before uploading.</p>
              </div>
              
              <!-- Staging Controls -->
              <div class="staging-controls" *ngIf="hasStagedChanges()">
                <div class="staging-summary">
                  <h4>📋 Staged Changes ({{ getStagedChangesCount() }})</h4>
                  <p>{{ getStagedChangesCount() }} image{{ getStagedChangesCount() === 1 ? '' : 's' }} ready to be applied</p>
                </div>
                
                <div class="staging-actions">
                  <button 
                    type="button" 
                    class="btn-apply"
                    (click)="applyAllStagedChanges()">
                    ✅ Apply All Changes
                  </button>
                  
                  <button 
                    type="button" 
                    class="btn-cancel"
                    (click)="clearStagedChanges()">
                    ❌ Cancel Changes
                  </button>
                </div>
              </div>
            </div>

            <!-- Selection prompt -->
            <div class="selection-prompt" *ngIf="!selectedSubsection()">
              <div class="prompt-icon">👆</div>
              <h3>Select where to upload your images</h3>
              <p>Choose the specific area of your {{ selectedSectionConfig()?.name }} where this image belongs.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Viewer Modal -->
      <div class="image-viewer-modal" *ngIf="showImageViewer()" (click)="closeImageViewer()">
        <div class="viewer-content" (click)="$event.stopPropagation()">
          <div class="viewer-header">
            <h2>{{ viewingSectionConfig()?.icon }} {{ viewingSectionConfig()?.name }} Images</h2>
            <button type="button" (click)="closeImageViewer()" class="close-btn">✕</button>
          </div>
          
          <div class="viewer-body">
            <div class="images-grid" *ngIf="sectionImages().length > 0">
              <div *ngFor="let image of sectionImages()" class="image-item">
                <img [src]="image.url" [alt]="image.name" loading="lazy">
                <div class="image-info">
                  <h4>{{ image.name }}</h4>
                  <p>{{ formatFileSize(image.size) }}</p>
                  <p>{{ formatDate(image.timeCreated) }}</p>
                  <div class="image-actions">
                    <button type="button" (click)="copyImageUrl(image.url)" class="copy-btn">
                      📋 Copy URL
                    </button>
                    <button type="button" (click)="deleteImage(image)" class="delete-btn">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="empty-state" *ngIf="sectionImages().length === 0">
              <div class="empty-icon">📷</div>
              <h3>No images yet</h3>
              <p>Upload your first image to {{ viewingSectionConfig()?.name }}</p>
              <button 
                type="button" 
                (click)="openUploaderFromViewer()" 
                class="upload-btn"
                [style.background]="viewingSectionConfig()?.color">
                📤 Upload First Image
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="loading()">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading images...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-manager {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .manager-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .manager-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .manager-header p {
      font-size: 1.1rem;
      color: #7f8c8d;
    }

    .sections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .section-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .section-card.active {
      ring: 2px solid #3498db;
      transform: translateY(-2px);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .section-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .section-info h3 {
      margin: 0 0 5px 0;
      color: #2c3e50;
      font-size: 1.2rem;
    }

    .section-info p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .section-count {
      margin-left: auto;
      text-align: center;
    }

    .count {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .label {
      font-size: 0.8rem;
      color: #7f8c8d;
    }

    .section-examples {
      margin-bottom: 15px;
      font-size: 0.9rem;
    }

    .example-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }

    .example-tag {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      background: #f8f9fa;
    }

    .section-actions {
      display: flex;
      gap: 10px;
    }

    .action-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .upload-btn {
      color: white;
      font-weight: 500;
    }

    .view-btn {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .view-btn:hover {
      background: #d5dbdb;
    }

    /* Modal Styles */
    .upload-modal, .image-viewer-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content, .viewer-content {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .viewer-content {
      max-width: 1000px;
    }

    .modal-header, .viewer-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2, .viewer-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #7f8c8d;
    }

    .modal-body, .viewer-body {
      padding: 20px;
    }

    .section-info-box {
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    /* Subsection Selection Styles */
    .subsections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .subsection-card {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .subsection-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .subsection-card.selected {
      border-color: #3498db;
      background: #f8f9fa;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    .subsection-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }

    .subsection-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .subsection-info {
      flex: 1;
    }

    .subsection-info h4 {
      margin: 0 0 5px 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .subsection-info p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .subsection-stats {
      text-align: right;
      font-size: 0.9rem;
    }

    .image-count {
      font-weight: bold;
      color: #2c3e50;
    }

    .max-images {
      color: #7f8c8d;
    }

    .subsection-examples {
      margin-bottom: 10px;
      font-size: 0.85rem;
    }

    .subsection-examples strong {
      color: #2c3e50;
      display: block;
      margin-bottom: 5px;
    }

    .example-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .example-item {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.8rem;
    }

    .subsection-recommendations {
      font-size: 0.85rem;
    }

    .subsection-recommendations strong {
      color: #2c3e50;
      display: block;
      margin-bottom: 5px;
    }

    .recommendations-list {
      margin: 0;
      padding-left: 15px;
      color: #7f8c8d;
    }

    .recommendations-list li {
      margin-bottom: 3px;
      line-height: 1.3;
    }

    /* Upload Area Styles */
    .upload-area {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .selected-path-info {
      margin-bottom: 20px;
      text-align: center;
    }

    .selected-path-info h3 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 1.2rem;
    }

    .selected-path-info p {
      color: #7f8c8d;
      margin: 0;
    }

    /* Selection Prompt Styles */
    .selection-prompt {
      text-align: center;
      padding: 40px 20px;
      color: #7f8c8d;
    }

    .prompt-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .selection-prompt h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .selection-prompt p {
      margin: 0;
    }

    /* Image Viewer Styles */
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }

    .image-item {
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .image-info {
      padding: 10px;
    }

    .image-info h4 {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
      color: #2c3e50;
    }

    .image-info p {
      margin: 2px 0;
      font-size: 0.8rem;
      color: #7f8c8d;
    }

    .image-actions {
      display: flex;
      gap: 5px;
      margin-top: 8px;
    }

    .copy-btn, .delete-btn {
      flex: 1;
      padding: 5px;
      border: none;
      border-radius: 4px;
      font-size: 0.7rem;
      cursor: pointer;
    }

    .copy-btn {
      background: #3498db;
      color: white;
    }

    .delete-btn {
      background: #e74c3c;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .empty-state .upload-btn {
      margin-top: 20px;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      font-size: 1rem;
    }

    /* Loading Styles */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Staging Styles */
    .staging-info {
      background: #e8f4fd;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }

    .selected-placeholder h4 {
      color: #2c3e50;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .selected-placeholder p {
      margin: 0 0 5px 0;
      color: #555;
    }

    .selected-placeholder small {
      color: #777;
      font-size: 0.9em;
    }

    .staging-controls {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .staging-summary h4 {
      color: #856404;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .staging-summary p {
      color: #856404;
      margin: 0 0 15px 0;
    }

    .staging-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-apply, .btn-cancel {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .btn-apply {
      background: #27ae60;
      color: white;
    }

    .btn-apply:hover {
      background: #219a52;
      transform: translateY(-1px);
    }

    .btn-cancel {
      background: #e74c3c;
      color: white;
    }

    .btn-cancel:hover {
      background: #c0392b;
      transform: translateY(-1px);
    }

    .placeholder-grid .placeholder-item.selected {
      border: 2px solid #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .placeholder-item .image-overlay.staged {
      background: rgba(230, 126, 34, 0.9);
    }

    .placeholder-item .image-overlay.staged span {
      font-weight: 600;
      color: white;
    }

    .placeholder-required {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      text-align: center;
    }

    .placeholder-required .warning-icon {
      font-size: 2em;
      margin-bottom: 10px;
    }

    .placeholder-required h4 {
      color: #856404;
      margin: 0 0 8px 0;
    }

    .placeholder-required p {
      color: #856404;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sections-grid {
        grid-template-columns: 1fr;
      }
      
      .section-header {
        flex-direction: column;
        text-align: center;
        gap: 10px;
      }
      
      .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  `]
})
export class ImageManagerComponent implements OnInit {
  private storageService = inject(StorageService);
  private imageManagerService = inject(ImageManagerService);

  // Signals
  selectedSection = signal<string>('');
  selectedSubsection = signal<string>('');
  selectedPlaceholder = signal<PlaceholderConfig | null>(null);
  showUploader = signal(false);
  showImageViewer = signal(false);
  viewingSection = signal<string>('');
  sectionImages = signal<StorageFile[]>([]);
  loading = signal(false);
  imageCounts = signal<Record<string, number>>({});
  subsectionCounts = signal<Record<string, number>>({});
  stagedImages = signal<Record<string, string>>({});
  stagedChanges = signal<Map<string, string>>(new Map());

  // Configuration for each section
  sections = signal<SectionConfig[]>([
    {
      id: 'home',
      name: 'Home Page',
      description: 'Hero images, features, and homepage content',
      icon: '🏠',
      color: '#3498db',
      subfolders: ['hero', 'features', 'about-preview', 'cta'],
      examples: ['Hero banner', 'Feature graphics', 'About preview', 'Call-to-action images'],
      subsections: [
        {
          id: 'hero',
          name: 'Hero Section',
          description: 'Main banner area at the top of your homepage',
          path: 'home/hero',
          icon: '🌟',
          examples: ['Main hero image', 'Background video thumbnail', 'Hero overlay image'],
          maxImages: 3,
          recommended: ['High resolution (1920x1080+)', 'Landscape orientation', 'Professional quality', 'Represents your brand'],
          placeholders: [
            {
              id: 'hero-main',
              name: 'Main Hero Image',
              description: 'Primary background image for hero section',
              position: 'Hero Background',
              size: '1920x1080px',
              required: true
            },
            {
              id: 'hero-mobile',
              name: 'Mobile Hero Image',
              description: 'Optimized hero image for mobile devices',
              position: 'Hero Background (Mobile)',
              size: '768x1024px',
              required: false
            },
            {
              id: 'hero-overlay',
              name: 'Hero Overlay Graphic',
              description: 'Optional graphic overlay for hero section',
              position: 'Hero Foreground',
              size: '800x600px',
              required: false
            }
          ]
        },
        {
          id: 'hero-logos',
          name: 'Client Logos (Hero)',
          description: 'Company logos displayed in the hero area',
          path: 'home/hero/logos',
          icon: '🏢',
          examples: ['Client company logos', 'Partner brand logos', 'Certification badges'],
          maxImages: 8,
          recommended: ['PNG with transparent background', 'Square or landscape', 'High contrast', 'Consistent sizing'],
          placeholders: [
            {
              id: 'logo-1',
              name: 'Client Logo 1',
              description: 'First featured client logo',
              position: 'Logo Row - Position 1',
              size: '200x100px',
              required: false
            },
            {
              id: 'logo-2',
              name: 'Client Logo 2',
              description: 'Second featured client logo',
              position: 'Logo Row - Position 2',
              size: '200x100px',
              required: false
            },
            {
              id: 'logo-3',
              name: 'Client Logo 3',
              description: 'Third featured client logo',
              position: 'Logo Row - Position 3',
              size: '200x100px',
              required: false
            },
            {
              id: 'logo-4',
              name: 'Client Logo 4',
              description: 'Fourth featured client logo',
              position: 'Logo Row - Position 4',
              size: '200x100px',
              required: false
            }
          ]
        },
        {
          id: 'services-preview',
          name: 'Services Preview',
          description: 'Quick overview of your services on homepage',
          path: 'home/services',
          icon: '⚡',
          examples: ['Service icon graphics', 'Process step images', 'Before/after previews'],
          maxImages: 6,
          recommended: ['Square format preferred', 'Consistent style', 'Clear and simple', 'Professional photography'],
          placeholders: [
            {
              id: 'service-1',
              name: 'Service 1 Icon',
              description: 'Icon for your first service',
              position: 'Services Grid - Position 1',
              size: '300x300px',
              required: true
            },
            {
              id: 'service-2',
              name: 'Service 2 Icon',
              description: 'Icon for your second service',
              position: 'Services Grid - Position 2',
              size: '300x300px',
              required: true
            },
            {
              id: 'service-3',
              name: 'Service 3 Icon',
              description: 'Icon for your third service',
              position: 'Services Grid - Position 3',
              size: '300x300px',
              required: true
            }
          ]
        },
        {
          id: 'about-teaser',
          name: 'About Us Teaser',
          description: 'Introduction to your team/company on homepage',
          path: 'home/about',
          icon: '👋',
          examples: ['Team photo', 'Founder photo', 'Office/workspace image', 'Behind-the-scenes'],
          maxImages: 2,
          recommended: ['Personal and approachable', 'High quality', 'Good lighting', 'Represents your personality'],
          placeholders: [
            {
              id: 'about-main',
              name: 'About Section Image',
              description: 'Main image for about section on homepage',
              position: 'About Section - Main',
              size: '600x400px',
              required: true
            },
            {
              id: 'about-secondary',
              name: 'About Secondary Image',
              description: 'Optional secondary image for about section',
              position: 'About Section - Secondary',
              size: '400x300px',
              required: false
            }
          ]
        },
        {
          id: 'portfolio-preview',
          name: 'Portfolio Preview',
          description: 'Featured projects showcased on homepage',
          path: 'home/portfolio',
          icon: '🎨',
          examples: ['Best project thumbnails', 'Before/after shots', 'Featured work samples'],
          maxImages: 6,
          recommended: ['Best quality work', 'Diverse examples', 'Clear thumbnails', 'Recent projects preferred'],
          placeholders: [
            {
              id: 'portfolio-1',
              name: 'Featured Project 1',
              description: 'First featured portfolio project',
              position: 'Portfolio Grid - Featured',
              size: '500x400px',
              required: true
            },
            {
              id: 'portfolio-2',
              name: 'Featured Project 2',
              description: 'Second featured portfolio project',
              position: 'Portfolio Grid - Position 2',
              size: '400x300px',
              required: false
            },
            {
              id: 'portfolio-3',
              name: 'Featured Project 3',
              description: 'Third featured portfolio project',
              position: 'Portfolio Grid - Position 3',
              size: '400x300px',
              required: false
            }
          ]
        },
        {
          id: 'testimonials-bg',
          name: 'Testimonials Background',
          description: 'Background images for testimonials section',
          path: 'home/testimonials',
          icon: '💭',
          examples: ['Happy clients', 'Event photos', 'Subtle pattern backgrounds'],
          maxImages: 3,
          recommended: ['Subtle and not distracting', 'Warm and positive feeling', 'Good for text overlay'],
          placeholders: [
            {
              id: 'testimonials-bg-main',
              name: 'Testimonials Background',
              description: 'Background image for testimonials section',
              position: 'Testimonials Section Background',
              size: '1200x600px',
              required: false
            }
          ]
        },
        {
          id: 'cta-section',
          name: 'Call-to-Action',
          description: 'Images for contact/booking section',
          path: 'home/cta',
          icon: '�',
          examples: ['Contact encouragement image', 'Consultation photo', 'Next steps visual'],
          maxImages: 2,
          recommended: ['Action-oriented', 'Encouraging tone', 'Professional appearance', 'Clear messaging support'],
          placeholders: [
            {
              id: 'cta-main',
              name: 'CTA Main Image',
              description: 'Primary call-to-action image',
              position: 'CTA Section - Main',
              size: '600x400px',
              required: true
            }
          ]
        },
        {
          id: 'features-icons',
          name: 'Features & Benefits',
          description: 'Visual representations of your key features',
          path: 'home/features',
          icon: '✨',
          examples: ['Feature icons', 'Benefit illustrations', 'Process diagrams', 'Advantage graphics'],
          maxImages: 8,
          recommended: ['Clear and simple icons', 'Consistent style', 'Easy to understand', 'Brand colors'],
          placeholders: [
            {
              id: 'feature-1',
              name: 'Feature 1 Icon',
              description: 'Icon for first key feature',
              position: 'Features Row - Position 1',
              size: '100x100px',
              required: true
            },
            {
              id: 'feature-2',
              name: 'Feature 2 Icon',
              description: 'Icon for second key feature',
              position: 'Features Row - Position 2',
              size: '100x100px',
              required: true
            },
            {
              id: 'feature-3',
              name: 'Feature 3 Icon',
              description: 'Icon for third key feature',
              position: 'Features Row - Position 3',
              size: '100x100px',
              required: true
            }
          ]
        }
      ]
    },
    {
      id: 'services',
      name: 'Services',
      description: 'Service-specific images and backgrounds',
      icon: '�🛠️',
      color: '#e74c3c',
      subfolders: ['web-design', 'photography', 'branding', 'backgrounds'],
      examples: ['Service icons', 'Before/after', 'Process diagrams', 'Team at work'],
      subsections: [
        {
          id: 'service-headers',
          name: 'Service Page Headers',
          description: 'Banner images for individual service pages',
          path: 'services/headers',
          icon: '🎯',
          examples: ['Service-specific banners', 'Related work examples', 'Process photos'],
          recommended: ['Service-relevant imagery', 'Professional quality', 'Good for text overlay'],
          placeholders: []
        },
        {
          id: 'service-process',
          name: 'Process Steps',
          description: 'Visual representation of your service process',
          path: 'services/process',
          icon: '📋',
          examples: ['Step-by-step photos', 'Workflow diagrams', 'Timeline images'],
          recommended: ['Clear sequence', 'Educational value', 'Easy to follow'],
          placeholders: []
        }
      ]
    },
    {
      id: 'projects',
      name: 'Portfolio',
      description: 'Project showcases with rich metadata',
      icon: '🎨',
      color: '#9b59b6',
      subfolders: ['websites', 'photography', 'branding', 'events'],
      examples: ['Project screenshots', 'Final deliverables', 'Process shots'],
      subsections: [
        {
          id: 'project-main',
          name: 'Main Project Images',
          description: 'Primary photos for portfolio projects',
          path: 'projects/main',
          icon: '🖼️',
          examples: ['Final project photos', 'Hero shots', 'Best angles'],
          recommended: ['Highest quality', 'Multiple angles', 'Well-lit', 'Sharp focus'],
          placeholders: []
        }
      ]
    },
    {
      id: 'blog',
      name: 'Blog Posts',
      description: 'Article images and featured photos',
      icon: '📝',
      color: '#f39c12',
      subfolders: ['featured', 'inline', 'tutorials', 'news'],
      examples: ['Featured images', 'Tutorial screenshots', 'Behind the scenes'],
      subsections: [
        {
          id: 'blog-featured',
          name: 'Featured Images',
          description: 'Main images for blog post headers',
          path: 'blog/featured',
          icon: '⭐',
          examples: ['Article header images', 'Topic illustrations', 'Eye-catching graphics'],
          recommended: ['Relevant to content', 'Eye-catching', 'Good for social sharing'],
          placeholders: []
        }
      ]
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Client photos and testimonial images',
      icon: '💬',
      color: '#2ecc71',
      subfolders: ['client-photos', 'logos', 'project-results'],
      examples: ['Client headshots', 'Company logos', 'Result screenshots'],
      subsections: [
        {
          id: 'client-photos',
          name: 'Client Photos',
          description: 'Professional headshots of your clients',
          path: 'testimonials/clients',
          icon: '👤',
          examples: ['Professional headshots', 'Couple photos', 'Team photos'],
          recommended: ['Professional quality', 'Good lighting', 'Friendly expression'],
          placeholders: []
        }
      ]
    },
    {
      id: 'about',
      name: 'About Us',
      description: 'Team photos and company images',
      icon: '👥',
      color: '#1abc9c',
      subfolders: ['team', 'office', 'history', 'culture'],
      examples: ['Team headshots', 'Office photos', 'Company events', 'Workspace'],
      subsections: [
        {
          id: 'team-photos',
          name: 'Team Photos',
          description: 'Professional photos of your team members',
          path: 'about/team',
          icon: '👨‍💼',
          examples: ['Individual headshots', 'Group photos', 'Candid work shots'],
          recommended: ['Professional appearance', 'Consistent lighting', 'Approachable feel'],
          placeholders: []
        }
      ]
    },
    {
      id: 'contact',
      name: 'Contact',
      description: 'Office photos and contact page images',
      icon: '📞',
      color: '#34495e',
      subfolders: ['office', 'location', 'maps'],
      examples: ['Office exterior', 'Reception area', 'Meeting rooms', 'Location shots'],
      subsections: [
        {
          id: 'office-photos',
          name: 'Office Photos',
          description: 'Images of your physical location',
          path: 'contact/office',
          icon: '🏢',
          examples: ['Office exterior', 'Reception area', 'Meeting rooms'],
          recommended: ['Welcoming atmosphere', 'Professional appearance', 'Good lighting'],
          placeholders: []
        }
      ]
    },
    {
      id: 'gallery',
      name: 'Public Gallery',
      description: 'Client galleries and public showcases',
      icon: '🖼️',
      color: '#e67e22',
      subfolders: ['events', 'seasonal', 'portfolio-samples', 'client-work'],
      examples: ['Event photos', 'Seasonal content', 'Client galleries', 'Public showcases'],
      subsections: [
        {
          id: 'public-showcase',
          name: 'Public Showcase',
          description: 'Images for public gallery display',
          path: 'gallery/public',
          icon: '🌟',
          examples: ['Best work samples', 'Public portfolio pieces', 'Award-winning projects'],
          recommended: ['Exceptional quality', 'Diverse selection', 'Permission granted for public use'],
          placeholders: []
        }
      ]
    }
  ]);

  // Computed properties
  selectedSectionConfig = computed(() => 
    this.sections().find(s => s.id === this.selectedSection())
  );

  viewingSectionConfig = computed(() => 
    this.sections().find(s => s.id === this.viewingSection())
  );

  async ngOnInit() {
    await this.loadImageCounts();
  }

  async loadImageCounts() {
    this.loading.set(true);
    const counts: Record<string, number> = {};
    
    for (const section of this.sections()) {
      try {
        if (section.id === 'gallery') {
          const files = await this.storageService.getGalleryFiles('public/gallery');
          counts[section.id] = files.length;
        } else {
          const files = await this.storageService.listFiles(section.id);
          counts[section.id] = files.length;
        }
      } catch (error) {
        console.error(`Error loading count for ${section.id}:`, error);
        counts[section.id] = 0;
      }
    }
    
    this.imageCounts.set(counts);
    this.loading.set(false);
  }

  selectSection(section: SectionConfig) {
    this.selectedSection.set(section.id);
    this.selectedSubsection.set(''); // Reset subsection when changing sections
  }

  selectSubsection(subsection: SubsectionConfig) {
    this.selectedSubsection.set(subsection.id);
    this.selectedPlaceholder.set(null); // Reset placeholder when changing subsections
  }

  selectPlaceholder(placeholder: PlaceholderConfig) {
    this.selectedPlaceholder.set(placeholder);
    console.log('Selected placeholder:', placeholder);
  }

  // Staging system methods
  stageImageForPlaceholder(placeholderId: string, imageUrl: string) {
    const staged = this.stagedChanges();
    staged.set(placeholderId, imageUrl);
    this.stagedChanges.set(new Map(staged));
    
    // Update the placeholder's staged image
    const subsection = this.getSubsectionContainingPlaceholder(placeholderId);
    if (subsection) {
      const placeholder = subsection.placeholders.find(p => p.id === placeholderId);
      if (placeholder) {
        placeholder.stagedImage = imageUrl;
      }
    }
  }

  applyAllStagedChanges() {
    const staged = this.stagedChanges();
    
    staged.forEach((imageUrl: string, placeholderId: string) => {
      const subsection = this.getSubsectionContainingPlaceholder(placeholderId);
      if (subsection) {
        const placeholder = subsection.placeholders.find((p: PlaceholderConfig) => p.id === placeholderId);
        if (placeholder) {
          placeholder.currentImage = imageUrl;
          placeholder.stagedImage = undefined;
          
          // Also update the image manager service so it appears on the actual page
          this.imageManagerService.updatePlaceholderImage(placeholderId, imageUrl);
        }
      }
    });

    // Clear staged changes
    this.stagedChanges.set(new Map());
    console.log('Applied all staged changes to both admin and live pages');
    alert(`Successfully applied ${staged.size} image${staged.size === 1 ? '' : 's'} to the website!`);
  }

  clearStagedChanges() {
    const staged = this.stagedChanges();
    
    // Remove staged images from placeholders
    staged.forEach((_: string, placeholderId: string) => {
      const subsection = this.getSubsectionContainingPlaceholder(placeholderId);
      if (subsection) {
        const placeholder = subsection.placeholders.find((p: PlaceholderConfig) => p.id === placeholderId);
        if (placeholder) {
          placeholder.stagedImage = undefined;
        }
      }
    });

    this.stagedChanges.set(new Map());
    console.log('Cleared all staged changes');
  }

  getSubsectionContainingPlaceholder(placeholderId: string): SubsectionConfig | undefined {
    for (const page of this.sections()) {
      for (const subsection of page.subsections) {
        if (subsection.placeholders.some((p: PlaceholderConfig) => p.id === placeholderId)) {
          return subsection;
        }
      }
    }
    return undefined;
  }

  hasStagedChanges(): boolean {
    return this.stagedChanges().size > 0;
  }

  getStagedChangesCount(): number {
    return this.stagedChanges().size;
  }

  getSelectedSubsectionPath(): string {
    const section = this.selectedSectionConfig();
    const subsectionId = this.selectedSubsection();
    if (!section || !subsectionId) return '';
    
    const subsection = section.subsections.find(s => s.id === subsectionId);
    return subsection?.path || '';
  }

  getSelectedSubsectionDetails(): SubsectionConfig | undefined {
    const section = this.selectedSectionConfig();
    const subsectionId = this.selectedSubsection();
    if (!section || !subsectionId) return undefined;
    
    return section.subsections.find(s => s.id === subsectionId);
  }

  getSubsectionImageCount(path: string): number {
    return this.subsectionCounts()[path] || 0;
  }

  openUploader(section: SectionConfig) {
    this.selectedSection.set(section.id);
    this.showUploader.set(true);
  }

  closeUploader() {
    this.showUploader.set(false);
    this.selectedSubsection.set(''); // Reset subsection selection
  }

  async viewSectionImages(section: SectionConfig) {
    this.viewingSection.set(section.id);
    this.loading.set(true);
    this.showImageViewer.set(true);
    
    try {
      let files: StorageFile[];
      if (section.id === 'gallery') {
        files = await this.storageService.getGalleryFiles('public/gallery');
      } else {
        files = await this.storageService.listFiles(section.id);
      }
      this.sectionImages.set(files);
    } catch (error) {
      console.error('Error loading section images:', error);
      this.sectionImages.set([]);
    }
    
    this.loading.set(false);
  }

  closeImageViewer() {
    this.showImageViewer.set(false);
    this.viewingSection.set('');
    this.sectionImages.set([]);
  }

  openUploaderFromViewer() {
    const section = this.viewingSectionConfig();
    if (section) {
      this.closeImageViewer();
      this.openUploader(section);
    }
  }

  onImageUploaded(event: { url: string; path: string }) {
    console.log('Image uploaded:', event);
    
    // If a placeholder is selected, stage the image for that placeholder
    const selectedPlaceholder = this.selectedPlaceholder();
    if (selectedPlaceholder) {
      this.stageImageForPlaceholder(selectedPlaceholder.id, event.url);
      alert(`Image staged for placeholder: ${selectedPlaceholder.name}`);
    } else {
      // Regular upload without placeholder targeting
      alert('Image uploaded successfully!');
    }
    
    // Refresh counts
    this.loadImageCounts();
    // Close uploader
    this.closeUploader();
  }

  getSectionImageCount(sectionId: string): number {
    return this.imageCounts()[sectionId] || 0;
  }

  copyImageUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      alert('Image URL copied to clipboard!');
    });
  }

  async deleteImage(image: StorageFile) {
    if (confirm(`Are you sure you want to delete "${image.name}"?`)) {
      try {
        await this.storageService.deleteFile(image.fullPath);
        // Refresh the current view
        const currentSection = this.viewingSectionConfig();
        if (currentSection) {
          await this.viewSectionImages(currentSection);
        }
        await this.loadImageCounts();
        alert('Image deleted successfully!');
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error deleting image. Please try again.');
      }
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}