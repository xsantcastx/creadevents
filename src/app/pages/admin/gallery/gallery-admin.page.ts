import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { MediaService } from '../../../services/media.service';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../models/product';
import { Media, MediaTag, GALLERY_TAGS, MediaCreateInput } from '../../../models/media';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './gallery-admin.page.html',
  styleUrl: './gallery-admin.page.scss'
})
export class GalleryAdminComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private mediaService = inject(MediaService);
  private productsService = inject(ProductsService);

  mediaList: Media[] = [];
  products: Product[] = [];
  isLoading = true;
  showUploadModal = false;
  showEditModal = false;
  isSaving = false;
  uploadForm: FormGroup;
  editForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  warningMessage = '';  // Add warning for non-critical issues
  selectedTag: MediaTag | 'all' = 'all';
  searchTerm = '';
  showDeleteConfirm = false;
  mediaToDelete: Media | null = null;
  mediaToEdit: Media | null = null;
  previewUrl: string | null = null;
  uploadProgress = 0;
  isUploading = false;

  private previewFromFile = false;
  private selectedFile: File | null = null;
  private mediaSub: Subscription | null = null;
  private productsSub: Subscription | null = null;

  availableTags = GALLERY_TAGS;

  constructor() {
    this.uploadForm = this.fb.group({
      altText: [''],
      tags: [[]],
      relatedProductIds: [[]]
    });

    this.editForm = this.fb.group({
      altText: [''],
      tags: [[]],
      relatedProductIds: [[]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.checkAdminAccess();
    this.subscribeToMedia();
    this.subscribeToProducts();
  }

  ngOnDestroy(): void {
    this.mediaSub?.unsubscribe();
    this.productsSub?.unsubscribe();
    this.revokePreviewUrl();
  }

  private async checkAdminAccess(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/client/login']);
      return;
    }

    const isAdmin = await this.authService.isAdmin(user.uid);
    if (!isAdmin) {
      this.router.navigate(['/']);
    }
  }

  private subscribeToMedia(): void {
    this.isLoading = true;
    this.mediaSub?.unsubscribe();

    this.mediaSub = this.mediaService.getAllMedia().subscribe({
      next: (mediaList) => {
        this.mediaList = mediaList;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading media:', error);
        this.errorMessage = 'Error loading media files';
        this.isLoading = false;
      }
    });
  }

  private subscribeToProducts(): void {
    this.productsSub?.unsubscribe();
    this.productsSub = this.productsService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products.filter(product => (product.status || 'draft') !== 'archived');
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  get filteredMedia(): Media[] {
    // Start with only gallery media (not product media)
    let filtered = this.mediaList.filter(m => m.relatedEntityType === 'gallery');

    // Filter by tag
    if (this.selectedTag !== 'all') {
      filtered = filtered.filter(media => media.tags.includes(this.selectedTag as MediaTag));
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(media =>
        media.altText?.toLowerCase().includes(term) ||
        media.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  getTagCount(tag: MediaTag | 'all'): number {
    // Filter only gallery media (relatedEntityType='gallery')
    const galleryMedia = this.mediaList.filter(m => m.relatedEntityType === 'gallery');
    
    if (tag === 'all') {
      return galleryMedia.length;
    }
    return galleryMedia.filter(media => media.tags.includes(tag)).length;
  }

  getRelatedProducts(media: Media): Product[] {
    if (!media.relatedEntityIds || media.relatedEntityIds.length === 0) {
      return [];
    }
    return this.products.filter(p => 
      media.relatedEntityIds!.some(id => id.endsWith(p.id || ''))
    );
  }

  openUploadModal(): void {
    this.showUploadModal = true;
    this.uploadForm.reset({
      altText: '',
      tags: [],
      relatedProductIds: []
    });
    this.selectedFile = null;
    this.revokePreviewUrl();
    this.successMessage = '';
    this.errorMessage = '';
    this.warningMessage = '';  // Clear warning
    this.uploadProgress = 0;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadForm.reset();
    this.selectedFile = null;
    this.revokePreviewUrl();
    this.errorMessage = '';
    this.warningMessage = '';  // Clear warning
    this.uploadProgress = 0;
  }

  openEditModal(media: Media): void {
    this.mediaToEdit = media;
    this.showEditModal = true;
    this.editForm.patchValue({
      altText: media.altText || '',
      tags: media.tags || [],
      relatedProductIds: this.extractProductIds(media.relatedEntityIds || [])
    });
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.mediaToEdit = null;
    this.editForm.reset();
    this.errorMessage = '';
  }

  private extractProductIds(relatedEntityIds: string[]): string[] {
    return relatedEntityIds
      .filter(id => id.startsWith('products/'))
      .map(id => id.replace('products/', ''));
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file';
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.errorMessage = 'File size must be less than 10MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.warningMessage = '';  // Clear warning when selecting new file

    this.revokePreviewUrl();
    this.previewUrl = URL.createObjectURL(file);
    this.previewFromFile = true;
  }

  toggleTag(tag: MediaTag, checked: boolean, isEdit = false): void {
    const form = isEdit ? this.editForm : this.uploadForm;
    const current = new Set<MediaTag>(form.get('tags')?.value || []);
    
    if (checked) {
      current.add(tag);
    } else {
      current.delete(tag);
    }
    
    form.patchValue({ tags: Array.from(current) });
  }

  isTagSelected(tag: MediaTag, isEdit = false): boolean {
    const form = isEdit ? this.editForm : this.uploadForm;
    const selected: MediaTag[] = form.get('tags')?.value || [];
    return selected.includes(tag);
  }

  toggleRelatedProduct(productId: string | undefined, checked: boolean, isEdit = false): void {
    const form = isEdit ? this.editForm : this.uploadForm;
    const current = new Set<string>(form.get('relatedProductIds')?.value || []);
    
    if (!productId) return;
    
    if (checked) {
      current.add(productId);
    } else {
      current.delete(productId);
    }
    
    form.patchValue({ relatedProductIds: Array.from(current) });
  }

  isProductSelected(productId: string | undefined, isEdit = false): boolean {
    const form = isEdit ? this.editForm : this.uploadForm;
    const selected: string[] = form.get('relatedProductIds')?.value || [];
    if (!productId) return false;
    return selected.includes(productId);
  }

  private revokePreviewUrl(): void {
    if (this.previewFromFile && this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.previewFromFile = false;
  }

  async onSubmit(): Promise<void> {
    if (this.isSaving || this.isUploading || !this.selectedFile) {
      return;
    }

    if (this.uploadForm.invalid) {
      this.markFormGroupTouched(this.uploadForm);
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const formValue = this.uploadForm.value;
    const tags: MediaTag[] = formValue.tags || [];
    const relatedProductIds: string[] = formValue.relatedProductIds || [];

    this.isUploading = true;
    this.isSaving = true;
    this.errorMessage = '';
    this.warningMessage = '';
    this.uploadProgress = 0;

    try {
      // Validate image dimensions (recommended: 1600x1200 or larger)
      const validation = await this.mediaService.validateImageDimensions(this.selectedFile, 1600, 1200);
      
      // Show warning if image is smaller than recommended, but allow upload
      if (!validation.valid && validation.width && validation.height) {
        this.warningMessage = `⚠️ Image size (${validation.width}x${validation.height}px) is smaller than recommended (1600x1200px). The image may appear pixelated on larger screens. Consider using a higher resolution image for best quality.`;
        // Continue with upload despite warning
      } else if (!validation.valid) {
        // If we can't even read dimensions, that's a real error
        this.errorMessage = validation.error || 'Could not read image file';
        this.isUploading = false;
        this.isSaving = false;
        return;
      }

      // Upload to Firebase Storage and create Firestore document
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create media input (without URL - will be set after upload)
      const mediaInput: Omit<MediaCreateInput, 'url'> = {
        filename: this.selectedFile.name,
        storagePath: `gallery/${Date.now()}_${this.selectedFile.name}`,
        width: validation.width || 0,
        height: validation.height || 0,
        size: this.selectedFile.size,
        mimeType: this.selectedFile.type,
        uploadedBy: currentUser.uid,
        tags: tags as string[],
        altText: formValue.altText || '',
        relatedEntityIds: relatedProductIds.map(id => `products/${id}`),
        relatedEntityType: 'gallery'
      };

      // Upload file to Firebase Storage and create media document
      this.isUploading = true;
      const mediaId = await this.mediaService.uploadMediaFile(
        this.selectedFile,
        mediaInput,
        (progress) => {
          this.uploadProgress = progress;
        }
      );

      console.log('✅ Media uploaded successfully with ID:', mediaId);
      this.successMessage = 'Media uploaded successfully';
      this.uploadProgress = 100;
      this.closeUploadModal();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error uploading media:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Error uploading media';
    } finally {
      this.isUploading = false;
      this.isSaving = false;
      this.selectedFile = null;
      this.revokePreviewUrl();
    }
  }

  async onEditSubmit(): Promise<void> {
    if (!this.mediaToEdit?.id || this.isSaving) {
      return;
    }

    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const formValue = this.editForm.value;
    const tags: MediaTag[] = formValue.tags || [];
    const relatedProductIds: string[] = formValue.relatedProductIds || [];

    this.isSaving = true;
    this.errorMessage = '';

    try {
      await this.mediaService.updateMedia(this.mediaToEdit.id, {
        tags: tags as string[],
        altText: formValue.altText || '',
        relatedEntityIds: relatedProductIds.map(id => `products/${id}`)
      });

      this.successMessage = 'Media updated successfully';
      this.closeEditModal();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error updating media:', error);
      this.errorMessage = 'Error updating media';
    } finally {
      this.isSaving = false;
    }
  }

  openDeleteConfirm(media: Media): void {
    this.mediaToDelete = media;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.mediaToDelete = null;
  }

  async confirmDelete(): Promise<void> {
    if (!this.mediaToDelete?.id) return;

    this.isSaving = true;

    try {
      // For gallery images, check if linked to products via relatedProductIds
      if (this.mediaToDelete.relatedEntityType === 'gallery' && 
          this.mediaToDelete.relatedEntityIds && 
          this.mediaToDelete.relatedEntityIds.length > 0) {
        
        // Extract product IDs from paths like 'products/apollo-white-12mm'
        const productIds = this.mediaToDelete.relatedEntityIds
          .map(id => id.replace('products/', ''))
          .filter(id => id); // Remove empty strings
        
        if (productIds.length > 0) {
          const relatedProducts = this.products.filter(p => productIds.includes(p.id || ''));
          if (relatedProducts.length > 0) {
            const productNames = relatedProducts.map(p => p.name).join(', ');
            this.errorMessage = `Cannot delete: Used by products: ${productNames}. Please remove this image from the product's gallery first.`;
            this.isSaving = false;
            return;
          }
        }
      }

      // Delete media file from Storage and Firestore document
      await this.mediaService.deleteMediaWithFile(this.mediaToDelete.id);
      
      this.successMessage = 'Media deleted successfully';
      this.closeDeleteConfirm();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error deleting media:', error);
      this.errorMessage = 'Error deleting media';
    } finally {
      this.isSaving = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOutUser();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Form getters
  get altText() { return this.uploadForm.get('altText'); }
  get tags() { return this.uploadForm.get('tags'); }
  get relatedProductIds() { return this.uploadForm.get('relatedProductIds'); }

  get editAltText() { return this.editForm.get('altText'); }
  get editTags() { return this.editForm.get('tags'); }
  get editRelatedProductIds() { return this.editForm.get('relatedProductIds'); }
}
