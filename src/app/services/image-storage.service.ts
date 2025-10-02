import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from '@angular/fire/storage';
import { 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit as limitQuery,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable, from, map, combineLatest, switchMap, of } from 'rxjs';

export interface GalleryImage {
  id?: string;
  fileName: string;
  originalFileName?: string; // Support both naming conventions
  originalName?: string;     // Support both naming conventions
  category: string;
  subcategory?: string;
  tags: string[];
  uploadedAt?: Date;
  uploadDate?: Date;    // Support both naming conventions
  updatedAt?: Date;
  storageUrl?: string;
  downloadURL?: string; // Support both naming conventions
  thumbnailUrl?: string;
  metadata: {
    size: number;
    type?: string;
    contentType?: string; // Support both naming conventions
    width?: number;
    height?: number;
  };
  description?: string;
  altText?: string;
  featured: boolean;
  sortOrder?: number;
  phase?: string;
}

export interface ImageUploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
  url?: string;
  error?: string;
}

export interface GalleryFilter {
  categories?: string[];
  subcategories?: string[];
  tags?: string[];
  featured?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  
  private readonly STORAGE_PATH = 'gallery';
  private readonly THUMBNAIL_PATH = 'gallery/thumbnails';
  private readonly COLLECTION_NAME = 'gallery_images';

  /**
   * Upload multiple images with progress tracking
   */
  uploadImages(
    files: File[], 
    category: string, 
    subcategory?: string,
    tags: string[] = []
  ): Observable<ImageUploadProgress[]> {
    const uploads = files.map(file => this.uploadSingleImage(file, category, subcategory, tags));
    return combineLatest(uploads);
  }

  /**
   * Upload a single image and create database record
   */
  private uploadSingleImage(
    file: File, 
    category: string, 
    subcategory?: string, 
    tags: string[] = []
  ): Observable<ImageUploadProgress> {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, `${this.STORAGE_PATH}/${category}/${fileName}`);
    
    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => getDownloadURL(storageRef)),
      switchMap(downloadURL => {
        const imageData: Omit<GalleryImage, 'id'> = {
          fileName,
          originalName: file.name,
          category,
          subcategory,
          tags,
          uploadedAt: new Date(),
          updatedAt: new Date(),
          storageUrl: downloadURL,
          metadata: {
            size: file.size,
            type: file.type
          },
          altText: `${category} ${subcategory || ''} image`,
          featured: false,
          sortOrder: Date.now()
        };

        return this.saveImageMetadata(imageData);
      }),
      map(docId => ({
        fileName: file.name,
        progress: 100,
        completed: true,
        url: `${this.STORAGE_PATH}/${category}/${fileName}`
      } as ImageUploadProgress))
    );
  }

  /**
   * Save image metadata to Firestore
   */
  private saveImageMetadata(imageData: Omit<GalleryImage, 'id'>): Observable<string> {
    const imagesRef = collection(this.firestore, this.COLLECTION_NAME);
    return from(addDoc(imagesRef, imageData)).pipe(map(docRef => docRef.id));
  }

  /**
   * Get images with advanced filtering and pagination
   */
  getImages(
    filters: GalleryFilter = {}, 
    pageSize: number = 20, 
    lastVisible?: any
  ): Observable<GalleryImage[]> {
    const imagesRef = collection(this.firestore, this.COLLECTION_NAME) as CollectionReference<any>;
    let q = query(imagesRef, orderBy('uploadDate', 'desc'));

    // Apply filters
    if (filters.categories?.length) {
      q = query(q, where('category', 'in', filters.categories));
    }

    if (filters.subcategories?.length) {
      q = query(q, where('subcategory', 'in', filters.subcategories));
    }

    if (filters.featured !== undefined) {
      q = query(q, where('featured', '==', filters.featured));
    }

    // Add pagination
    q = query(q, limitQuery(pageSize));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        let images = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id,
            fileName: data.fileName,
            originalName: data.originalFileName || data.fileName,
            category: data.category,
            subcategory: data.subcategory,
            tags: data.tags || [],
            uploadedAt: data.uploadDate?.toDate?.() || data.uploadDate || new Date(),
            storageUrl: data.downloadURL || '',
            downloadURL: data.downloadURL || '',
            metadata: {
              size: data.metadata?.size || 0,
              type: data.metadata?.contentType || 'image/jpeg',
              contentType: data.metadata?.contentType || 'image/jpeg'
            },
            altText: data.altText || data.fileName,
            featured: data.featured || false,
            sortOrder: data.sortOrder || 0,
            phase: data.phase || ''
          } as GalleryImage;
        });

        // Apply client-side filters for complex queries
        if (filters.tags?.length) {
          images = images.filter(img => 
            filters.tags!.some(tag => img.tags.includes(tag))
          );
        }

        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          images = images.filter(img => 
            (img.originalName || img.fileName).toLowerCase().includes(searchTerm) ||
            img.category.toLowerCase().includes(searchTerm) ||
            img.subcategory?.toLowerCase().includes(searchTerm) ||
            img.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }

        if (filters.dateRange) {
          images = images.filter(img => {
            const uploadDate = img.uploadedAt || new Date();
            return uploadDate >= filters.dateRange!.start &&
                   uploadDate <= filters.dateRange!.end;
          });
        }

        return images;
      })
    );
  }  /**
   * Get images by category with counts
   */
  getImagesByCategory(): Observable<{ [category: string]: GalleryImage[] }> {
    return this.getImages({}, 1000).pipe(
      map(images => {
        return images.reduce((acc, img) => {
          if (!acc[img.category]) {
            acc[img.category] = [];
          }
          acc[img.category].push(img);
          return acc;
        }, {} as { [category: string]: GalleryImage[] });
      })
    );
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Observable<{ category: string; count: number; lastUpdated: Date }[]> {
    return this.getImages({}, 10000).pipe(
      map(images => {
        const stats = new Map<string, { count: number; lastUpdated: Date }>();
        
        images.forEach(img => {
          const existing = stats.get(img.category);
          const imgDate = img.updatedAt || img.uploadedAt || new Date();
          if (!existing || imgDate > existing.lastUpdated) {
            stats.set(img.category, {
              count: (existing?.count || 0) + 1,
              lastUpdated: imgDate
            });
          } else {
            stats.set(img.category, {
              ...existing,
              count: existing.count + 1
            });
          }
        });

        return Array.from(stats.entries()).map(([category, data]) => ({
          category,
          ...data
        }));
      })
    );
  }

  /**
   * Update image metadata
   */
  updateImage(id: string, updates: Partial<GalleryImage>): Observable<void> {
    const imageRef = doc(this.firestore, this.COLLECTION_NAME, id);
    return from(updateDoc(imageRef, {
      ...updates,
      updatedAt: new Date()
    }));
  }

  /**
   * Delete image and its storage file
   */
  deleteImage(id: string, storageUrl: string): Observable<void> {
    const imageRef = doc(this.firestore, this.COLLECTION_NAME, id);
    const storageRef = ref(this.storage, storageUrl);
    
    return combineLatest([
      from(deleteDoc(imageRef)),
      from(deleteObject(storageRef))
    ]).pipe(
      map(() => void 0)
    );
  }

  /**
   * Bulk import existing images from assets folder
   * This is for migrating your current 1,828 images
   */
  bulkImportFromAssets(imageList: {
    path: string;
    category: string;
    subcategory?: string;
    tags?: string[];
  }[]): Observable<ImageUploadProgress[]> {
    // This would be used to migrate your existing categorized images
    // Implementation would depend on how you want to handle the migration
    return of([]);
  }

  /**
   * Generate thumbnail URLs for different sizes
   */
  getThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: '200x200',
      medium: '400x400', 
      large: '800x800'
    };
    
    // Firebase Storage automatic image transformation
    return `${originalUrl}_${sizes[size]}`;
  }

  /**
   * Search images with full-text search capabilities
   */
  searchImages(searchTerm: string, category?: string): Observable<GalleryImage[]> {
    const filters: GalleryFilter = {
      searchTerm,
      categories: category ? [category] : undefined
    };
    
    return this.getImages(filters, 50);
  }

  /**
   * Get featured images for homepage/highlights
   */
  getFeaturedImages(limit: number = 12): Observable<GalleryImage[]> {
    return this.getImages({ featured: true }, limit);
  }

  /**
   * Get recent uploads
   */
  getRecentImages(limit: number = 20): Observable<GalleryImage[]> {
    const imagesRef = collection(this.firestore, this.COLLECTION_NAME) as CollectionReference<GalleryImage>;
    const q = query(imagesRef, orderBy('uploadedAt', 'desc'), limitQuery(limit));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })))
    );
  }

  /**
   * Batch update multiple images
   */
  batchUpdateImages(updates: { id: string; data: Partial<GalleryImage> }[]): Observable<void[]> {
    const updatePromises = updates.map(update => 
      this.updateImage(update.id, update.data)
    );
    
    return combineLatest(updatePromises);
  }
}