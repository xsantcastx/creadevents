import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CategoriaGaleria, GaleriaItem } from '../../core/services/data.service';
import { Firestore, collection, query, where, orderBy, getDocs, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Media } from '../../models/media';
import { Tag } from '../../models/catalog';
import { TagService } from '../../services/tag.service';
import { PageHeaderComponent, Breadcrumb } from '../../shared/components/page-header/page-header.component';
import { LoadingComponentBase } from '../../core/classes/loading-component.base';
import { MetaService } from '../../services/meta.service';

// Gallery Project interface - groups multiple images by project name
interface GalleryProject {
  id: string; // Unique project identifier (slugified project name)
  name: string; // Project name (from altText)
  description: string; // Project description (from caption)
  location: string; // Location extracted from caption
  tags: string[]; // All tags from images in this project
  images: Media[]; // All images belonging to this project
  featuredImage: Media; // First/main image to display
  photoCount: number; // Total number of photos
  uploadedAt: Date; // Most recent upload date
}

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent],
  templateUrl: './galeria.page.html',
  styleUrl: './galeria.page.scss'
})
export class GaleriaPageComponent extends LoadingComponentBase implements OnInit {
  categorias: CategoriaGaleria[] = [];
  categoriaActiva = 'todos';
  itemsVisible: GaleriaItem[] = [];
  
  // Project-based properties
  allProjects: GalleryProject[] = [];
  filteredProjects: GalleryProject[] = [];
  selectedProject: GalleryProject | null = null;
  currentImageIndex = 0;
  
  modalItem: GaleriaItem | null = null;
  modalIndex = 0;
  availableTags: Tag[] = [];
  
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private tagService = inject(TagService);
  private metaService = inject(MetaService);

  // Breadcrumbs for navigation
  breadcrumbs: Breadcrumb[] = [
    { label: 'nav.home', url: '/', icon: 'home' },
    { label: 'nav.gallery', icon: 'gallery' }
  ];

  constructor(
    private firestore: Firestore
  ) {
    super(); // Call parent constructor
  }

  ngOnInit() {
    // Set page meta tags from settings
    this.metaService.setPageMeta({
      title: 'GALLERY.TITLE',
      description: 'GALLERY.DESCRIPTION'
    });

    // Load gallery from Firestore only
    if (this.isBrowser) {
      this.loadTagsAndGallery();
    } else {
      this.isLoading = false;
    }
  }

  private async loadTagsAndGallery() {
    try {
      // Load tags first
      this.tagService.getActiveTags().subscribe({
        next: (tags) => {
          this.availableTags = tags;
          console.log('🏷️ Tags loaded:', tags.length);
          // Then load gallery
          this.loadGaleriaFromFirebase();
        },
        error: (error) => {
          console.error('Error loading tags:', error);
          // Continue loading gallery even if tags fail
          this.loadGaleriaFromFirebase();
        }
      });
    } catch (error) {
      console.error('Error in loadTagsAndGallery:', error);
      this.loadGaleriaFromFirebase();
    }
  }

  private async loadGaleriaFromFirebase() {
    await this.withLoading(async () => {
      // Load all gallery media from Media collection (relatedEntityType='gallery')
      const mediaQuery = query(
        collection(this.firestore, 'media'),
        where('relatedEntityType', '==', 'gallery')
        // Note: orderBy removed to avoid index requirement - sorting in memory instead
      );
      
      const snapshot = await getDocs(mediaQuery);
      const mediaItems: Media[] = snapshot.docs
        .map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data() as Omit<Media, 'id'>
        }))
        .sort((a, b) => {
          // Sort by uploadedAt descending (newest first) in memory
          const dateA = a.uploadedAt instanceof Date ? a.uploadedAt : (a.uploadedAt as any).toDate();
          const dateB = b.uploadedAt instanceof Date ? b.uploadedAt : (b.uploadedAt as any).toDate();
          return dateB.getTime() - dateA.getTime();
        });
      
      console.log('📸 Gallery loaded from Firestore:', mediaItems.length, 'images');
      
      if (mediaItems.length > 0) {
        // Group media by project name (altText)
        this.allProjects = this.groupMediaByProjects(mediaItems);
        this.filtrarPorCategoria(this.categoriaActiva);
      } else {
        console.log('ℹ️ No gallery images found in Firestore');
        this.allProjects = [];
        this.filteredProjects = [];
      }
    });
  }

  // Group media by project name - Create project objects from media items
  private groupMediaByProjects(mediaItems: Media[]): GalleryProject[] {
    const projectsMap = new Map<string, GalleryProject>();

    mediaItems.forEach(media => {
      // Extract base project name (remove numbering like "(1/5)")
      const baseProjectName = this.extractBaseProjectName(media.altText || 'Untitled Project');
      const projectId = this.slugify(baseProjectName);

      // Extract location from caption (text before first dash or full caption)
      const location = this.extractLocation(media.caption || '');

      if (!projectsMap.has(projectId)) {
        // Create new project
        const uploadDate = media.uploadedAt instanceof Date 
          ? media.uploadedAt 
          : (media.uploadedAt as any).toDate();

        projectsMap.set(projectId, {
          id: projectId,
          name: baseProjectName,
          description: media.caption || '',
          location: location,
          tags: [...media.tags],
          images: [media],
          featuredImage: media,
          photoCount: 1,
          uploadedAt: uploadDate
        });
      } else {
        // Add to existing project
        const project = projectsMap.get(projectId)!;
        project.images.push(media);
        project.photoCount++;
        
        // Merge tags (unique only)
        media.tags.forEach(tag => {
          if (!project.tags.includes(tag)) {
            project.tags.push(tag);
          }
        });

        // Update uploadedAt to most recent
        const mediaDate = media.uploadedAt instanceof Date 
          ? media.uploadedAt 
          : (media.uploadedAt as any).toDate();
        
        if (mediaDate > project.uploadedAt) {
          project.uploadedAt = mediaDate;
        }
      }
    });

    // Convert map to array and sort by upload date (newest first)
    const projects = Array.from(projectsMap.values()).sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );

    console.log('📁 Created', projects.length, 'projects from', mediaItems.length, 'images');
    return projects;
  }

  // Extract base project name by removing numbering patterns like "(1/5)" or " - 1"
  private extractBaseProjectName(altText: string): string {
    // Remove patterns like "(1/5)", "(1 of 5)", "- 1", etc.
    return altText
      .replace(/\s*\(\d+\/\d+\)\s*$/i, '')
      .replace(/\s*\(\d+\s+of\s+\d+\)\s*$/i, '')
      .replace(/\s*-\s*\d+\s*$/i, '')
      .replace(/\s*#\d+\s*$/i, '')
      .trim();
  }

  // Extract location from caption (text before dash or full text)
  private extractLocation(caption: string): string {
    const dashIndex = caption.indexOf('-');
    if (dashIndex > 0) {
      return caption.substring(0, dashIndex).trim();
    }
    // Try comma separation (e.g., "Texas, USA")
    const commaIndex = caption.indexOf(',');
    if (commaIndex > 0) {
      return caption.substring(0, commaIndex + 4).trim(); // Include country code
    }
    return caption.trim();
  }

  // Create URL-friendly slug from project name
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Get tag by slug for accessing color/icon
  getTag(slug: string): Tag | undefined {
    return this.availableTags.find(t => t.slug === slug);
  }

  // Get unique tags from all projects for filter buttons
  getAvailableProjectTags(): Tag[] {
    const tagSlugs = new Set<string>();
    this.allProjects.forEach(project => {
      project.tags.forEach(tag => tagSlugs.add(tag));
    });

    return this.availableTags.filter(tag => tagSlugs.has(tag.slug));
  }

  // Filter projects by tag
  filtrarPorCategoria(tagSlug: string) {
    this.categoriaActiva = tagSlug;
    
    if (tagSlug === 'todos') {
      this.filteredProjects = [...this.allProjects];
    } else {
      this.filteredProjects = this.allProjects.filter(project => 
        project.tags.includes(tagSlug)
      );
    }
    
    // Close modal if open
    if (this.selectedProject) {
      this.cerrarModal();
    }
  }

  // Get count of projects for a specific tag
  getProjectCountByTag(tagSlug: string): number {
    if (tagSlug === 'todos') {
      return this.allProjects.length;
    }
    return this.allProjects.filter(project => project.tags.includes(tagSlug)).length;
  }

  // Open project modal to view all images
  abrirProyecto(project: GalleryProject) {
    this.selectedProject = project;
    this.currentImageIndex = 0;
    
    // Prevent body scroll when modal is open
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrarModal() {
    this.selectedProject = null;
    this.currentImageIndex = 0;
    
    // Restore body scroll
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  anteriorImagen() {
    if (this.selectedProject && this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  siguienteImagen() {
    if (this.selectedProject && this.currentImageIndex < this.selectedProject.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  // Get current image from selected project
  getCurrentImage(): Media | null {
    if (!this.selectedProject) return null;
    return this.selectedProject.images[this.currentImageIndex] || null;
  }

  anterior() {
    if (this.modalIndex > 0) {
      this.modalIndex--;
      this.modalItem = this.itemsVisible[this.modalIndex];
    }
  }

  siguiente() {
    if (this.modalIndex < this.itemsVisible.length - 1) {
      this.modalIndex++;
      this.modalItem = this.itemsVisible[this.modalIndex];
    }
  }

  // Keyboard navigation
  onKeydown(event: KeyboardEvent) {
    if (!this.selectedProject) return;
    
    switch (event.key) {
      case 'Escape':
        this.cerrarModal();
        break;
      case 'ArrowLeft':
        this.anteriorImagen();
        break;
      case 'ArrowRight':
        this.siguienteImagen();
        break;
    }
  }

  // Get total projects count
  getTotalProjects(): number {
    return this.filteredProjects.length;
  }

  // Get total items count (legacy - for backward compatibility)
  getTotalItems(): number {
    return this.itemsVisible.length;
  }

  // Get category item count (legacy)
  getCategoryCount(slug: string): number {
    return this.getProjectCountByTag(slug);
  }

  // Get category title (legacy)
  getCategoryTitle(slug: string): string {
    const tag = this.getTag(slug);
    return tag ? tag.name : slug;
  }
}
