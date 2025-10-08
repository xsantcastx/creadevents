import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';

interface GalleryImage {
  id: string;
  url: string;
  category: 'kitchens' | 'bathrooms' | 'facades' | 'industry' | 'others';
  title?: string;
  description?: string;
  uploadedAt: Date;
}

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  templateUrl: './gallery-admin.page.html',
  styleUrl: './gallery-admin.page.scss'
})
export class GalleryAdminComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  images: GalleryImage[] = [];
  isLoading = true;
  showUploadModal = false;
  isSaving = false;
  uploadForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  selectedCategory: string = 'all';
  showDeleteConfirm = false;
  imageToDelete: GalleryImage | null = null;
  previewUrl: string | null = null;

  categories = [
    { value: 'kitchens', label: 'gallery.categories.kitchens' },
    { value: 'bathrooms', label: 'gallery.categories.bathrooms' },
    { value: 'facades', label: 'gallery.categories.facades' },
    { value: 'industry', label: 'gallery.categories.industry' },
    { value: 'others', label: 'gallery.categories.others' }
  ];

  constructor() {
    this.uploadForm = this.fb.group({
      url: ['', [Validators.required]],
      category: ['kitchens', [Validators.required]],
      title: [''],
      description: ['']
    });
  }

  async ngOnInit() {
    await this.checkAdminAccess();
    await this.loadImages();
  }

  private async checkAdminAccess() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/client/login']);
      return;
    }

    const isAdmin = await this.authService.isAdmin(user.uid);
    if (!isAdmin) {
      this.router.navigate(['/']);
      return;
    }
  }

  private async loadImages() {
    this.isLoading = true;
    try {
      // TODO: Replace with actual Firestore query
      this.images = this.getMockImages();
    } catch (error) {
      console.error('Error loading images:', error);
      this.errorMessage = 'admin.error_occurred';
    } finally {
      this.isLoading = false;
    }
  }

  get filteredImages(): GalleryImage[] {
    if (this.selectedCategory === 'all') {
      return this.images;
    }
    return this.images.filter(img => img.category === this.selectedCategory);
  }

  getCategoryCount(category: string): number {
    if (category === 'all') return this.images.length;
    return this.images.filter(img => img.category === category).length;
  }

  openUploadModal() {
    this.showUploadModal = true;
    this.uploadForm.reset({ category: 'kitchens' });
    this.previewUrl = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.uploadForm.reset();
    this.previewUrl = null;
  }

  onUrlChange() {
    const url = this.uploadForm.get('url')?.value;
    if (url && this.isValidUrl(url)) {
      this.previewUrl = url;
    } else {
      this.previewUrl = null;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async onSubmit() {
    if (this.uploadForm.invalid) {
      this.markFormGroupTouched(this.uploadForm);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const formData = this.uploadForm.value;
      
      // TODO: Upload to Firebase Storage and save to Firestore
      console.log('Uploading image:', formData);

      this.successMessage = 'admin.image_uploaded';
      await this.loadImages();
      this.closeUploadModal();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      this.errorMessage = 'admin.error_occurred';
    } finally {
      this.isSaving = false;
    }
  }

  openDeleteConfirm(image: GalleryImage) {
    this.imageToDelete = image;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.imageToDelete = null;
  }

  async confirmDelete() {
    if (!this.imageToDelete) return;

    try {
      // TODO: Delete from Firebase Storage and Firestore
      console.log('Deleting image:', this.imageToDelete.id);

      this.images = this.images.filter(img => img.id !== this.imageToDelete!.id);
      this.successMessage = 'admin.deleted_successfully';
      this.closeDeleteConfirm();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error deleting image:', error);
      this.errorMessage = 'admin.error_occurred';
    }
  }

  async logout() {
    try {
      await this.authService.signOutUser();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Mock data
  private getMockImages(): GalleryImage[] {
    return [
      {
        id: '1',
        url: '/assets/galeria/cocinas/cocina1.jpg',
        category: 'kitchens',
        title: 'Cocina Moderna Blanca',
        description: 'Cocina con encimera de porcelánico blanco',
        uploadedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        url: '/assets/galeria/banos/bano1.jpg',
        category: 'bathrooms',
        title: 'Baño Minimalista',
        description: 'Baño con revestimiento de mármol',
        uploadedAt: new Date('2024-01-16')
      },
      {
        id: '3',
        url: '/assets/galeria/fachadas/fachada1.jpg',
        category: 'facades',
        title: 'Fachada Ventilada',
        description: 'Fachada moderna con sistema ventilado',
        uploadedAt: new Date('2024-01-17')
      },
      {
        id: '4',
        url: '/assets/galeria/cocinas/cocina2.jpg',
        category: 'kitchens',
        title: 'Cocina Industrial',
        description: 'Cocina con acabado en cemento',
        uploadedAt: new Date('2024-01-18')
      },
      {
        id: '5',
        url: '/assets/galeria/industria/industria1.jpg',
        category: 'industry',
        title: 'Instalación Industrial',
        description: 'Pavimento industrial resistente',
        uploadedAt: new Date('2024-01-19')
      },
      {
        id: '6',
        url: '/assets/galeria/banos/bano2.jpg',
        category: 'bathrooms',
        title: 'Baño de Lujo',
        description: 'Baño con acabados premium',
        uploadedAt: new Date('2024-01-20')
      }
    ];
  }

  // Form getters
  get url() { return this.uploadForm.get('url'); }
  get category() { return this.uploadForm.get('category'); }
  get title() { return this.uploadForm.get('title'); }
  get description() { return this.uploadForm.get('description'); }
}
