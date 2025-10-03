import { Injectable } from '@angular/core';
import { Observable, from, of, combineLatest } from 'rxjs';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL,
  listAll, deleteObject
} from 'firebase/storage';
import {
  getFirestore, collection, query, where, orderBy, getDocs
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface StoredImage {
  path: string;
  url: string;
  name: string;
  section: string;
}

export interface GalleryImage {
  id: string;
  fileName: string;
  originalName: string;
  category: string;
  subcategory?: string;
  tags: string[];
  featured: boolean;
  altText: string;
  storageUrl?: string;
  downloadURL?: string;
  uploadedAt?: Date;
  metadata?: {
    size?: number;
    contentType?: string;
  };
}

export interface ImageUploadProgress {
  file: File;
  fileName?: string;
  progress: number;
  completed?: boolean;
  url?: string;
  error?: string;
}

export interface GalleryFilter {
  category?: string;
  tags?: string[];
  featured?: boolean;
  searchTerm?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageStorageService {
  // safe: initialize if needed, otherwise reuse (prevents double-init)
  private app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private storage = getStorage(this.app);
  private db = getFirestore(this.app);

  async list(section: string): Promise<StoredImage[]> {
    const folderRef = ref(this.storage, `public/${section}`);
    const res = await listAll(folderRef);
    const items = await Promise.all(
      res.items.map(async (item) => ({
        path: item.fullPath,
        url: await getDownloadURL(item),
        name: item.name,
        section
      }))
    );
    // newest first if filenames are stamped (we'll stamp them below)
    return items.sort((a, b) => b.name.localeCompare(a.name));
  }

  // New method for gallery component
  getImages(filter: any = {}, limit: number = 1000): Observable<GalleryImage[]> {
    return from(this.loadGalleryImages(limit));
  }

  private async loadGalleryImages(limit: number): Promise<GalleryImage[]> {
    try {
      // Try to load from Firestore first (new system)
      const imagesCol = collection(this.db, 'images');
      const q = query(imagesCol, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs.slice(0, limit).map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            fileName: data['name'] || 'unknown.jpg',
            originalName: data['name'] || 'unknown.jpg',
            category: data['section'] || 'gallery',
            subcategory: '',
            tags: [],
            featured: false,
            altText: data['alt'] || '',
            storageUrl: data['url'] || '',
            downloadURL: data['url'] || '',
            uploadedAt: data['createdAt']?.toDate() || new Date(),
            metadata: {
              size: 0,
              contentType: 'image/jpeg'
            }
          } as GalleryImage;
        });
      }

      // Fallback to storage-only loading
      const galleryImages: GalleryImage[] = [];
      const sections = ['gallery', 'hero', 'services', 'about'];
      
      for (const section of sections) {
        try {
          const folderRef = ref(this.storage, `public/${section}`);
          const res = await listAll(folderRef);
          
          const sectionImages = await Promise.all(
            res.items.slice(0, Math.floor(limit / sections.length)).map(async (item, index) => ({
              id: `${section}-${index}`,
              fileName: item.name,
              originalName: item.name,
              category: section,
              subcategory: '',
              tags: [],
              featured: false,
              altText: `${section} image`,
              storageUrl: await getDownloadURL(item),
              downloadURL: await getDownloadURL(item),
              uploadedAt: new Date(),
              metadata: {
                size: 0,
                contentType: 'image/jpeg'
              }
            } as GalleryImage))
          );
          
          galleryImages.push(...sectionImages);
        } catch (error) {
          console.warn(`Could not load images from section ${section}:`, error);
        }
      }

      return galleryImages.slice(0, limit);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      return [];
    }
  }

  // Thumbnail URL generation method
  getThumbnailUrl(url: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    if (!url) return '';
    
    // If it's already a Firebase Storage URL, return as-is
    if (url.includes('firebasestorage.googleapis.com')) {
      return url;
    }
    
    // For other URLs, return as-is (could add image processing here)
    return url;
  }

  // Upload multiple images with progress tracking
  uploadImages(files: File[], category: string = 'gallery'): Observable<ImageUploadProgress[]> {
    const uploads: Observable<ImageUploadProgress>[] = [];
    
    files.forEach(file => {
      const upload$ = new Observable<ImageUploadProgress>(observer => {
        const fileName = file.name;
        observer.next({ file, fileName, progress: 0, completed: false });
        
        this.upload(category, file, (progress) => {
          observer.next({ file, fileName, progress, completed: false });
        }).then(result => {
          observer.next({ file, fileName, progress: 100, completed: true, url: result.url });
          observer.complete();
        }).catch(error => {
          observer.next({ file, fileName, progress: 0, completed: false, error: error.message });
          observer.error(error);
        });
      });
      uploads.push(upload$);
    });

    return combineLatest(uploads);
  }

  // Update image metadata
  updateImage(id: string, updates: Partial<GalleryImage>): Observable<void> {
    // For now, just return success - would need Firestore integration for full functionality
    return of(undefined);
  }

  // Delete image
  deleteImage(id: string, url: string): Observable<void> {
    return from(this.deleteByUrl(url));
  }

  private async deleteByUrl(url: string): Promise<void> {
    try {
      // Extract path from URL if it's a Firebase Storage URL
      if (url.includes('firebasestorage.googleapis.com')) {
        const urlParts = url.split('/o/')[1]?.split('?')[0];
        if (urlParts) {
          const path = decodeURIComponent(urlParts);
          await this.remove(path);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  upload(section: string, file: File, onProgress?: (pct: number) => void): Promise<StoredImage> {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const clean = file.name.replace(/\s+/g, '-');
    const path = `public/${section}/${stamp}-${clean}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

    return new Promise((resolve, reject) => {
      task.on('state_changed', snap => {
        if (onProgress) {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress(pct);
        }
      }, reject, async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ path, url, name: file.name, section });
      });
    });
  }

  async remove(path: string): Promise<void> {
    await deleteObject(ref(this.storage, path));
  }

  // Method for slot manager to list all images across sections
  async listAll(): Promise<GalleryImage[]> {
    return this.loadGalleryImages(1000); // Return up to 1000 images across all sections
  }

  // Method to list images by specific section for slot manager
  async listBySection(section: string): Promise<GalleryImage[]> {
    try {
      // Try to load from Firestore first (new system)
      const imagesCol = collection(this.db, 'images');
      const q = query(imagesCol, where('section', '==', section), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            fileName: data['name'] || 'unknown.jpg',
            originalName: data['name'] || 'unknown.jpg',
            category: data['section'] || section,
            subcategory: '',
            tags: [],
            featured: false,
            altText: data['alt'] || '',
            storageUrl: data['url'] || '',
            downloadURL: data['url'] || '',
            uploadedAt: data['createdAt']?.toDate() || new Date(),
            metadata: {
              size: 0,
              contentType: 'image/jpeg'
            }
          } as GalleryImage;
        });
      }

      // Fallback to storage-only loading for specific section
      const folderRef = ref(this.storage, `public/${section}`);
      const res = await listAll(folderRef);
      
      return await Promise.all(
        res.items.map(async (item, index) => ({
          id: `${section}-${index}`,
          fileName: item.name,
          originalName: item.name,
          category: section,
          subcategory: '',
          tags: [],
          featured: false,
          altText: `${section} image`,
          storageUrl: await getDownloadURL(item),
          downloadURL: await getDownloadURL(item),
          uploadedAt: new Date(),
          metadata: {
            size: 0,
            contentType: 'image/jpeg'
          }
        } as GalleryImage))
      );
    } catch (error) {
      console.error(`Error loading images for section ${section}:`, error);
      return [];
    }
  }
}