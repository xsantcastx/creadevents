import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { ProductsService } from '../../../services/products.service';
import { StorageService } from '../../../services/storage.service';
import { Product } from '../../../models/product';
import { HttpClient } from '@angular/common/http';

// Product template from catalog
interface ProductTemplate {
  nombre: string;
  descripcion: string;
  aplicaciones?: string[];
}

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './products-admin.page.html',
  styleUrl: './products-admin.page.scss'
})
export class ProductsAdminComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private storageService = inject(StorageService);
  private http = inject(HttpClient);

  products: Product[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;
  isSaving = false;
  selectedProduct: Product | null = null;
  productForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';
  selectedThickness: string = 'all';
  showDeleteConfirm = false;
  productToDelete: Product | null = null;
  
  // Image upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadProgress: number = 0;
  isUploading = false;

  // Product catalog templates
  productTemplates: ProductTemplate[] = [];
  uniqueProductNames: string[] = [];

  constructor() {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required]], // Select from catalog
      description: ['', [Validators.required]],
      price: ['', [Validators.min(0)]],
      stock: ['', [Validators.min(0)]],
      grosor: ['12mm', [Validators.required]],
      size: ['160×320cm', [Validators.required]],
      sku: [''],
      features: [''],
      active: [true]
    });
  }

  async ngOnInit() {
    await this.checkAdminAccess();
    await this.loadProductCatalog();
    await this.loadProducts();
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

  private async loadProducts() {
    this.isLoading = true;
    try {
      this.productsService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.errorMessage = 'admin.error_occurred';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading products:', error);
      this.errorMessage = 'admin.error_occurred';
      this.isLoading = false;
    }
  }

  private async loadProductCatalog() {
    try {
      const data = await this.http.get<{ items: any[] }>('/assets/data/productos.json').toPromise();
      if (data && data.items) {
        // Extract unique product names and their descriptions
        const nameMap = new Map<string, ProductTemplate>();
        
        data.items.forEach(item => {
          const baseName = item.nombre.replace(/ Premium$| Natural$/, '').trim();
          if (!nameMap.has(baseName)) {
            nameMap.set(baseName, {
              nombre: baseName,
              descripcion: item.descripcion,
              aplicaciones: item.aplicaciones || []
            });
          }
        });
        
        this.productTemplates = Array.from(nameMap.values());
        this.uniqueProductNames = this.productTemplates.map(t => t.nombre).sort();
      }
    } catch (error) {
      console.error('Error loading product catalog:', error);
    }
  }

  onProductNameChange() {
    const selectedName = this.productForm.get('productName')?.value;
    if (selectedName) {
      const template = this.productTemplates.find(t => t.nombre === selectedName);
      if (template) {
        // Auto-fill description and features
        this.productForm.patchValue({
          description: template.descripcion,
          features: template.aplicaciones ? template.aplicaciones.join(', ') : ''
        });
      }
    }
  }

  get filteredProducts(): Product[] {
    let filtered = this.products;

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Filter by thickness
    if (this.selectedThickness !== 'all') {
      filtered = filtered.filter(p => p.grosor === this.selectedThickness);
    }

    return filtered;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset({ 
      productName: '',
      description: '',
      grosor: '12mm',
      size: '160×320cm',
      active: true
    });
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  openEditModal(product: Product) {
    this.isEditMode = true;
    this.selectedProduct = product;
    
    // Convert features array to comma-separated string
    const featuresStr = product.features ? product.features.join(', ') : '';
    
    this.productForm.patchValue({
      productName: product.name,
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      grosor: product.grosor,
      size: product.size || '160×320cm',
      sku: product.sku || '',
      features: featuresStr,
      active: product.active !== false
    });
    
    this.selectedFile = null;
    this.imagePreview = product.imageUrl || null;
    this.showModal = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeModal() {
    this.showModal = false;
    this.productForm.reset();
    this.selectedProduct = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadProgress = 0;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file
      const validation = this.storageService.validateImageFile(file);
      if (!validation.valid) {
        this.errorMessage = validation.error || 'Invalid file';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    // Require image for new products
    if (!this.isEditMode && !this.selectedFile) {
      this.errorMessage = 'Please select an image';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.uploadProgress = 0;

    try {
      const formData = this.productForm.value;
      
      // Generate slug from productName
      const slug = this.storageService.generateSlug(formData.productName);
      
      // Check if slug already exists (for new products or when name changed)
      if (!this.isEditMode || (this.selectedProduct && slug !== this.selectedProduct.slug)) {
        const slugExists = await this.productsService.slugExists(
          slug, 
          formData.grosor,
          this.selectedProduct?.id
        );
        
        if (slugExists) {
          this.errorMessage = 'A product with this name already exists for this thickness';
          this.isSaving = false;
          return;
        }
      }

      // Convert features string to array
      const features = formData.features 
        ? formData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
        : [];

      let imageUrl = this.selectedProduct?.imageUrl || '';

      // Upload new image if selected
      if (this.selectedFile) {
        this.isUploading = true;
        
        // Delete old image if editing
        if (this.isEditMode && this.selectedProduct?.imageUrl) {
          try {
            await this.storageService.deleteFile(this.selectedProduct.imageUrl);
          } catch (error) {
            console.warn('Could not delete old image:', error);
          }
        }

        // Upload new image
        await new Promise<void>((resolve, reject) => {
          this.storageService.uploadProductImage(
            this.selectedFile!,
            slug,
            formData.grosor
          ).subscribe({
            next: (progress) => {
              this.uploadProgress = progress.progress;
              if (progress.downloadURL) {
                imageUrl = progress.downloadURL;
                this.isUploading = false;
                resolve();
              }
            },
            error: (error) => {
              this.isUploading = false;
              reject(error);
            }
          });
        });
      }

      const productData: Partial<Product> = {
        name: formData.productName, // Use productName from form
        slug,
        grosor: formData.grosor,
        size: formData.size,
        imageUrl,
        description: formData.description || '',
        price: formData.price ? parseFloat(formData.price) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        sku: formData.sku || undefined,
        features: features.length > 0 ? features : undefined,
        active: formData.active
      };

      if (this.isEditMode && this.selectedProduct?.id) {
        await this.productsService.updateProduct(this.selectedProduct.id, productData);
        this.successMessage = 'admin.saved_successfully';
      } else {
        await this.productsService.addProduct(productData as Omit<Product, 'id'>);
        this.successMessage = 'admin.saved_successfully';
      }

      await this.loadProducts();
      this.closeModal();
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      this.errorMessage = 'admin.error_occurred';
    } finally {
      this.isSaving = false;
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }

  openDeleteConfirm(product: Product) {
    this.productToDelete = product;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.productToDelete = null;
  }

  async confirmDelete() {
    if (!this.productToDelete || !this.productToDelete.id) return;

    try {
      // Delete image from storage
      if (this.productToDelete.imageUrl) {
        try {
          await this.storageService.deleteFile(this.productToDelete.imageUrl);
        } catch (error) {
          console.warn('Could not delete image:', error);
        }
      }

      // Delete product from Firestore
      await this.productsService.deleteProduct(this.productToDelete.id);
      
      this.successMessage = 'admin.deleted_successfully';
      this.closeDeleteConfirm();
      await this.loadProducts();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
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

  // Form getters
  get productName() { return this.productForm.get('productName'); }
  get description() { return this.productForm.get('description'); }
  get price() { return this.productForm.get('price'); }
  get stock() { return this.productForm.get('stock'); }
  get grosor() { return this.productForm.get('grosor'); }
  get size() { return this.productForm.get('size'); }
  get sku() { return this.productForm.get('sku'); }
  get features() { return this.productForm.get('features'); }
  get active() { return this.productForm.get('active'); }
}
