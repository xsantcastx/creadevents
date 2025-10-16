import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { CategoryService } from '../../../services/category.service';
import { ModelService } from '../../../services/model.service';
import { SizeGroupService } from '../../../services/size-group.service';
import { TagService } from '../../../services/tag.service';
import { TemplateService } from '../../../services/template.service';
import { Category, Model, Tag, SizeGroup } from '../../../models/catalog';
import { AdminQuickActionsComponent } from '../../../shared/components/admin-quick-actions/admin-quick-actions.component';
import { LoadingComponentBase } from '../../../core/classes/loading-component.base';

type TabType = 'categories' | 'models' | 'tags' | 'sizes';

@Component({
  selector: 'app-catalog-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, AdminQuickActionsComponent],
  templateUrl: './catalog-admin.page.html',
  styleUrl: './catalog-admin.page.scss'
})
export class CatalogAdminComponent extends LoadingComponentBase implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private modelService = inject(ModelService);
  private sizeGroupService = inject(SizeGroupService);
  private tagService = inject(TagService);
  private templateService = inject(TemplateService);

  // Data
  categories: Category[] = [];
  models: Model[] = [];
  tags: Tag[] = [];
  sizes: SizeGroup[] = [];

  // UI State
  activeTab: TabType = 'categories';
  isSaving = false;
  selectedCategoryFilter: string = ''; // For filtering models by category
  
  // Modals
  showCategoryModal = false;
  showModelModal = false;
  showTagModal = false;
  showSizeModal = false;
  showDeleteConfirm = false;
  
  // Forms
  categoryForm: FormGroup;
  modelForm: FormGroup;
  tagForm: FormGroup;
  sizeForm: FormGroup;
  
  // Messages
  successMessage = '';
  
  // Edit mode
  editingCategory: Category | null = null;
  editingModel: Model | null = null;
  editingTag: Tag | null = null;
  editingSize: SizeGroup | null = null;
  itemToDelete: { type: TabType; id: string; name: string } | null = null;

  constructor() {
    super();
    // Initialize forms
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      order: [0],
      icon: [''],
      descriptionTemplate: [''],
      seoTitleTemplate: [''],
      seoMetaTemplate: [''],
      active: [true]
    });

    this.modelForm = this.fb.group({
      categoryId: [''],  // Category parent - optional for backward compatibility
      name: ['', Validators.required],
      slug: ['', Validators.required],
      textureHints: [''],
      defaultTags: [[]],  // Changed to array for multi-select
      descriptionTemplate: [''],
      seoTitleTemplate: [''],
      seoMetaTemplate: [''],
      active: [true]
    });

    this.tagForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      color: ['#F7931A'],
      icon: [''],
      order: [0],
      active: [true]
    });

    this.sizeForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      display: ['', Validators.required],
      thicknessDefaultMm: [null],
      active: [true]
    });
  }

  async ngOnInit() {
    await this.checkAdminAccess();
    await this.loadAllData();
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
    }
  }

  private async loadAllData() {
    this.setLoading(true);
    try {
      // Subscribe to observables
      this.categoryService.getAllCategories().subscribe(categories => {
        this.categories = categories;
        console.log('✅ Categories loaded:', this.categories.length, this.categories);
        this.setLoading(false);
      });
      
      this.modelService.getAllModels().subscribe(models => {
        this.models = models;
        console.log('✅ Models loaded:', this.models.length, this.models);
      });
      
      this.sizeGroupService.getAllSizeGroups().subscribe(sizes => {
        this.sizes = sizes;
      });
      
      this.tagService.getTags().subscribe(tags => {
        this.tags = tags;
        console.log('✅ Tags loaded:', this.tags.length, this.tags);
      });
    } catch (error) {
      console.error('Error loading catalog data:', error);
      this.setError('Error loading catalog data');
    }
  }

  // Tab switching
  switchTab(tab: TabType) {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Category CRUD
  async openCategoryModal(category?: Category) {
    this.editingCategory = category || null;
    
    if (category?.id) {
      // Load existing templates for this category
      const currentLang = 'es';
      const [descTemplates, seoTitleTemplates, seoMetaTemplates] = await Promise.all([
        this.templateService.getTemplatesByScope('description', 'category', category.id, currentLang),
        this.templateService.getTemplatesByScope('seoTitle', 'category', category.id, currentLang),
        this.templateService.getTemplatesByScope('seoMeta', 'category', category.id, currentLang)
      ]);
      
      this.categoryForm.patchValue({
        name: category.name,
        slug: category.slug,
        order: category.order || 0,
        icon: category.icon || '',
        descriptionTemplate: descTemplates[0]?.content || '',
        seoTitleTemplate: seoTitleTemplates[0]?.content || '',
        seoMetaTemplate: seoMetaTemplates[0]?.content || '',
        active: category.active !== false
      });
    } else {
      this.categoryForm.reset({ active: true, order: 0 });
    }
    
    this.showCategoryModal = true;
    this.clearMessages();
  }

  async saveCategory() {
    if (this.categoryForm.invalid) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const formValue = this.categoryForm.value;
      const categoryData: Category = {
        name: formValue.name,
        slug: formValue.slug,
        order: formValue.order || 0,
        active: formValue.active !== false
      };

      // Only add icon if it has a value
      if (formValue.icon) {
        categoryData.icon = formValue.icon;
      }

      let categoryId: string;
      
      if (this.editingCategory?.id) {
        await this.categoryService.updateCategory(this.editingCategory.id, categoryData);
        categoryId = this.editingCategory.id;
        this.successMessage = 'Category updated successfully';
      } else {
        categoryId = await this.categoryService.addCategory(categoryData);
        this.successMessage = 'Category created successfully';
      }

      // Save templates if provided
      const currentLang = 'es'; // TODO: Get from i18n service
      
      // Get existing templates for this category to update instead of create duplicates
      const existingTemplates = await Promise.all([
        this.templateService.getTemplatesByScope('description', 'category', categoryId, currentLang),
        this.templateService.getTemplatesByScope('seoTitle', 'category', categoryId, currentLang),
        this.templateService.getTemplatesByScope('seoMeta', 'category', categoryId, currentLang)
      ]);
      
      // Save or update description template
      if (formValue.descriptionTemplate?.trim()) {
        const existingDescTemplate = existingTemplates[0][0];
        if (existingDescTemplate?.id) {
          await this.templateService.updateTemplate(existingDescTemplate.id, {
            content: formValue.descriptionTemplate.trim()
          });
        } else {
          await this.templateService.addTemplate({
            type: 'description',
            scope: 'category',
            refId: categoryId,
            language: currentLang,
            content: formValue.descriptionTemplate.trim(),
            active: true
          });
        }
      }
      
      // Save or update SEO title template
      if (formValue.seoTitleTemplate?.trim()) {
        const existingSeoTitleTemplate = existingTemplates[1][0];
        if (existingSeoTitleTemplate?.id) {
          await this.templateService.updateTemplate(existingSeoTitleTemplate.id, {
            content: formValue.seoTitleTemplate.trim()
          });
        } else {
          await this.templateService.addTemplate({
            type: 'seoTitle',
            scope: 'category',
            refId: categoryId,
            language: currentLang,
            content: formValue.seoTitleTemplate.trim(),
            active: true
          });
        }
      }
      
      // Save or update SEO meta template
      if (formValue.seoMetaTemplate?.trim()) {
        const existingSeoMetaTemplate = existingTemplates[2][0];
        if (existingSeoMetaTemplate?.id) {
          await this.templateService.updateTemplate(existingSeoMetaTemplate.id, {
            content: formValue.seoMetaTemplate.trim()
          });
        } else {
          await this.templateService.addTemplate({
            type: 'seoMeta',
            scope: 'category',
            refId: categoryId,
            language: currentLang,
            content: formValue.seoMetaTemplate.trim(),
            active: true
          });
        }
      }

      await this.loadAllData();
      this.closeCategoryModal();
      
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error saving category:', error);
      this.errorMessage = 'Error saving category';
    } finally {
      this.isSaving = false;
    }
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  // Model CRUD
  async openModelModal(model?: Model) {
    this.editingModel = model || null;
    
    if (model?.id) {
      // Load existing templates for this model
      const currentLang = 'es';
      const [descTemplates, seoTitleTemplates, seoMetaTemplates] = await Promise.all([
        this.templateService.getTemplatesByScope('description', 'model', model.id, currentLang),
        this.templateService.getTemplatesByScope('seoTitle', 'model', model.id, currentLang),
        this.templateService.getTemplatesByScope('seoMeta', 'model', model.id, currentLang)
      ]);
      
      this.modelForm.patchValue({
        categoryId: model.categoryId,
        name: model.name,
        slug: model.slug,
        textureHints: model.textureHints?.join(', ') || '',
        defaultTags: model.defaultTags || [],  // Load as array
        descriptionTemplate: descTemplates[0]?.content || '',
        seoTitleTemplate: seoTitleTemplates[0]?.content || '',
        seoMetaTemplate: seoMetaTemplates[0]?.content || '',
        active: model.active !== false
      });
    } else {
      this.modelForm.reset({ active: true, defaultTags: [] });  // Reset with empty array
    }
    
    this.showModelModal = true;
    this.clearMessages();
  }

  async saveModel() {
    if (this.modelForm.invalid) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const formValue = this.modelForm.value;
      const modelData: Model = {
        categoryId: formValue.categoryId,
        name: formValue.name,
        slug: formValue.slug,
        textureHints: formValue.textureHints 
          ? formValue.textureHints.split(',').map((s: string) => s.trim()).filter((s: string) => s)
          : undefined,
        defaultTags: formValue.defaultTags && formValue.defaultTags.length > 0
          ? formValue.defaultTags
          : undefined,
        active: formValue.active !== false
      };

      let modelId: string;
      
      if (this.editingModel?.id) {
        await this.modelService.updateModel(this.editingModel.id, modelData);
        modelId = this.editingModel.id;
        this.successMessage = 'Model updated successfully';
      } else {
        modelId = await this.modelService.addModel(modelData);
        this.successMessage = 'Model created successfully';
      }

      // Save templates if provided
      const currentLang = 'es'; // TODO: Get from i18n service
      
      // Get existing templates for this model to update instead of create duplicates
      const existingTemplates = await Promise.all([
        this.templateService.getTemplatesByScope('description', 'model', modelId, currentLang),
        this.templateService.getTemplatesByScope('seoTitle', 'model', modelId, currentLang),
        this.templateService.getTemplatesByScope('seoMeta', 'model', modelId, currentLang)
      ]);
      
      // Save or update description template
      if (formValue.descriptionTemplate?.trim()) {
        const existingDescTemplate = existingTemplates[0][0];
        if (existingDescTemplate?.id) {
          await this.templateService.updateTemplate(existingDescTemplate.id, {
            content: formValue.descriptionTemplate.trim()
          });
        } else {
          await this.templateService.addTemplate({
            type: 'description',
            scope: 'model',
            refId: modelId,
            language: currentLang,
            content: formValue.descriptionTemplate.trim(),
            active: true
          });
        }
      }
      
      // Save or update SEO title template
      if (formValue.seoTitleTemplate?.trim()) {
        const existingSeoTitleTemplate = existingTemplates[1][0];
        if (existingSeoTitleTemplate?.id) {
          await this.templateService.updateTemplate(existingSeoTitleTemplate.id, {
            content: formValue.seoTitleTemplate.trim()
          });
        } else {
          await this.templateService.addTemplate({
            type: 'seoTitle',
            scope: 'model',
            refId: modelId,
            language: currentLang,
            content: formValue.seoTitleTemplate.trim(),
            active: true
          });
        }
      }
      
      // Save or update SEO meta template
      if (formValue.seoMetaTemplate?.trim()) {
        const existingSeoMetaTemplate = existingTemplates[2][0];
        if (existingSeoMetaTemplate?.id) {
          await this.templateService.updateTemplate(existingSeoMetaTemplate.id, {
            content: formValue.seoMetaTemplate.trim()
          });
        } else {
          await this.templateService.addTemplate({
            type: 'seoMeta',
            scope: 'model',
            refId: modelId,
            language: currentLang,
            content: formValue.seoMetaTemplate.trim(),
            active: true
          });
        }
      }

      await this.loadAllData();
      this.closeModelModal();
      
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error saving model:', error);
      this.errorMessage = 'Error saving model';
    } finally {
      this.isSaving = false;
    }
  }

  closeModelModal() {
    this.showModelModal = false;
    this.editingModel = null;
    this.modelForm.reset();
  }

  // Tag CRUD
  openTagModal(tag?: Tag) {
    this.editingTag = tag || null;
    
    if (tag) {
      this.tagForm.patchValue({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
        color: tag.color || '#F7931A',
        icon: tag.icon || '',
        order: tag.order || 0,
        active: tag.active !== false
      });
    } else {
      this.tagForm.reset({ active: true, order: 0, color: '#F7931A' });
    }
    
    this.showTagModal = true;
    this.clearMessages();
  }

  async saveTag() {
    if (this.tagForm.invalid) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const formValue = this.tagForm.value;
      const tagData: any = {
        name: formValue.name,
        slug: formValue.slug,
        color: formValue.color || '#F7931A',
        order: formValue.order || 0,
        active: formValue.active !== false
      };

      // Only add optional fields if they have values
      if (formValue.description && formValue.description.trim()) {
        tagData.description = formValue.description.trim();
      }
      if (formValue.icon && formValue.icon.trim()) {
        tagData.icon = formValue.icon.trim();
      }

      if (this.editingTag?.id) {
        await this.tagService.updateTag(this.editingTag.id, tagData);
        this.successMessage = 'Tag updated successfully';
      } else {
        await this.tagService.addTag(tagData);
        this.successMessage = 'Tag created successfully';
      }

      await this.loadAllData();
      this.closeTagModal();
      
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error saving tag:', error);
      this.errorMessage = 'Error saving tag';
    } finally {
      this.isSaving = false;
    }
  }

  closeTagModal() {
    this.showTagModal = false;
    this.editingTag = null;
    this.tagForm.reset();
  }

  // Size CRUD
  openSizeModal(size?: SizeGroup) {
    this.editingSize = size || null;
    
    if (size) {
      this.sizeForm.patchValue({
        name: size.name,
        slug: size.slug,
        display: size.display,
        thicknessDefaultMm: size.thicknessDefaultMm || null,
        active: size.active !== false
      });
    } else {
      this.sizeForm.reset({ active: true });
    }
    
    this.showSizeModal = true;
    this.clearMessages();
  }

  async saveSize() {
    if (this.sizeForm.invalid) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const formValue = this.sizeForm.value;
      const sizeData: SizeGroup = {
        name: formValue.name,
        slug: formValue.slug,
        display: formValue.display,
        thicknessDefaultMm: formValue.thicknessDefaultMm || undefined,
        active: formValue.active !== false
      };

      if (this.editingSize?.id) {
        await this.sizeGroupService.updateSizeGroup(this.editingSize.id, sizeData);
        this.successMessage = 'Size group updated successfully';
      } else {
        await this.sizeGroupService.addSizeGroup(sizeData);
        this.successMessage = 'Size group created successfully';
      }

      await this.loadAllData();
      this.closeSizeModal();
      
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error saving size group:', error);
      this.errorMessage = 'Error saving size group';
    } finally {
      this.isSaving = false;
    }
  }

  closeSizeModal() {
    this.showSizeModal = false;
    this.editingSize = null;
    this.sizeForm.reset();
  }

  // Delete confirmation
  confirmDelete(type: TabType, id: string, name: string) {
    this.itemToDelete = { type, id, name };
    this.showDeleteConfirm = true;
  }

  async executeDelete() {
    if (!this.itemToDelete) return;

    this.isSaving = true;
    this.clearMessages();

    try {
      const { type, id } = this.itemToDelete;

      switch (type) {
        case 'categories':
          await this.categoryService.deleteCategory(id);
          this.successMessage = 'Category deleted successfully';
          break;
        case 'models':
          await this.modelService.deleteModel(id);
          this.successMessage = 'Model deleted successfully';
          break;
        case 'tags':
          await this.tagService.deleteTag(id);
          this.successMessage = 'Tag deleted successfully';
          break;
        case 'sizes':
          await this.sizeGroupService.deleteSizeGroup(id);
          this.successMessage = 'Size group deleted successfully';
          break;
      }

      await this.loadAllData();
      this.closeDeleteConfirm();
      
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
      this.errorMessage = 'Error deleting item. It may be in use by products.';
    } finally {
      this.isSaving = false;
    }
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.itemToDelete = null;
  }

  // Tag selection helpers for Model form
  isTagSelected(tagSlug: string): boolean {
    const selectedTags = this.modelForm.get('defaultTags')?.value || [];
    return selectedTags.includes(tagSlug);
  }

  toggleTag(tagSlug: string) {
    const currentTags = this.modelForm.get('defaultTags')?.value || [];
    const index = currentTags.indexOf(tagSlug);
    
    if (index > -1) {
      // Remove tag
      currentTags.splice(index, 1);
    } else {
      // Add tag
      currentTags.push(tagSlug);
    }
    
    this.modelForm.patchValue({ defaultTags: [...currentTags] });
  }

  // Get category name by ID
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  // Filter models by selected category
  get filteredModels(): Model[] {
    console.log('🔍 Filtering models:', {
      totalModels: this.models.length,
      selectedFilter: this.selectedCategoryFilter,
      models: this.models
    });
    
    if (!this.selectedCategoryFilter) {
      return this.models;
    }
    
    const filtered = this.models.filter(m => m.categoryId === this.selectedCategoryFilter);
    console.log('📊 Filtered result:', filtered.length, filtered);
    return filtered;
  }

  // Navigate to models tab and filter by category
  viewCategoryModels(categoryId: string) {
    this.selectedCategoryFilter = categoryId;
    this.activeTab = 'models';
  }

  // Clear category filter
  clearCategoryFilter() {
    this.selectedCategoryFilter = '';
  }

  // Auto-generate slug from name
  generateSlug(formGroup: FormGroup) {
    const name = formGroup.get('name')?.value;
    if (name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      formGroup.patchValue({ slug });
    }
  }

  // Helpers
  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  async logout() {
    try {
      await this.authService.signOutUser();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
