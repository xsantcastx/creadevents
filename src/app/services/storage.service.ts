import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  FirebaseStorage,
  UploadTask
} from 'firebase/storage';
import { Observable, from, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

const firebaseConfig = environment.firebase;

export interface UploadProgress {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
  bytesTransferred: number;
  totalBytes: number;
}

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  timeCreated: string;
  fullPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: FirebaseStorage;
  private app = initializeApp(firebaseConfig);

  constructor() {
    this.storage = getStorage(this.app);
  }

  /**
   * Upload a single file with progress tracking
   */
  uploadFile(file: File, path: string): Observable<{ progress: UploadProgress; downloadURL?: string }> {
    const storageRef = ref(this.storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    const progressSubject = new Subject<{ progress: UploadProgress; downloadURL?: string }>();

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress: UploadProgress = {
          progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          state: snapshot.state as any,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        };
        progressSubject.next({ progress });
      },
      (error) => {
        console.error('Upload failed:', error);
        progressSubject.error(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          progressSubject.next({ 
            progress: {
              progress: 100,
              state: 'success',
              bytesTransferred: uploadTask.snapshot.totalBytes,
              totalBytes: uploadTask.snapshot.totalBytes
            },
            downloadURL 
          });
          progressSubject.complete();
        } catch (error) {
          progressSubject.error(error);
        }
      }
    );

    return progressSubject.asObservable();
  }

  /**
   * Upload multiple files with individual progress tracking
   */
  uploadMultipleFiles(files: FileList, basePath: string = 'uploads'): Observable<{ 
    fileIndex: number; 
    fileName: string; 
    progress: UploadProgress; 
    downloadURL?: string 
  }> {
    const progressSubject = new Subject<{ 
      fileIndex: number; 
      fileName: string; 
      progress: UploadProgress; 
      downloadURL?: string 
    }>();

    Array.from(files).forEach((file, index) => {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${basePath}/${fileName}`;

      this.uploadFile(file, filePath).subscribe({
        next: (uploadData) => {
          progressSubject.next({
            fileIndex: index,
            fileName: file.name,
            progress: uploadData.progress,
            downloadURL: uploadData.downloadURL
          });
        },
        error: (error) => {
          progressSubject.error({ fileIndex: index, fileName: file.name, error });
        }
      });
    });

    return progressSubject.asObservable();
  }

  /**
   * Upload image with automatic resizing and optimization
   */
  uploadImage(file: File, path: string, maxWidth: number = 1920, quality: number = 0.8): Observable<{ progress: UploadProgress; downloadURL?: string }> {
    return new Observable(observer => {
      // Create canvas for image optimization
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            this.uploadFile(optimizedFile, path).subscribe({
              next: (data) => observer.next(data),
              error: (error) => observer.error(error),
              complete: () => observer.complete()
            });
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete a file from storage
   */
  deleteFile(path: string): Observable<void> {
    const fileRef = ref(this.storage, path);
    return from(deleteObject(fileRef));
  }

  /**
   * Get download URL for a file
   */
  getDownloadURL(path: string): Observable<string> {
    const fileRef = ref(this.storage, path);
    return from(getDownloadURL(fileRef));
  }

  /**
   * List all files in a directory
   */
  async listFiles(path: string = 'uploads'): Promise<StorageFile[]> {
    try {
      const listRef = ref(this.storage, path);
      const result = await listAll(listRef);
      
      const files: StorageFile[] = [];
      
      for (const item of result.items) {
        const downloadURL = await getDownloadURL(item);
        const metadata = await getMetadata(item);
        
        files.push({
          name: item.name,
          url: downloadURL,
          size: metadata.size || 0,
          contentType: metadata.contentType || 'unknown',
          timeCreated: metadata.timeCreated || '',
          fullPath: item.fullPath
        });
      }

      return files.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Generate a unique file path
   */
  generateFilePath(originalName: string, category: string = 'uploads'): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    return `${category}/${timestamp}_${sanitizedName}.${extension}`;
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'], maxSizeBytes: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      return {
        valid: false,
        error: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Create optimized image categories
   */
  uploadImageToCategory(file: File, category: 'projects' | 'services' | 'blog' | 'testimonials' | 'general' = 'general'): Observable<{ progress: UploadProgress; downloadURL?: string }> {
    const path = this.generateFilePath(file.name, category);
    
    // Different optimization settings per category
    const settings = {
      projects: { maxWidth: 1920, quality: 0.9 },
      services: { maxWidth: 1200, quality: 0.85 },
      blog: { maxWidth: 1200, quality: 0.8 },
      testimonials: { maxWidth: 800, quality: 0.8 },
      general: { maxWidth: 1200, quality: 0.8 }
    };

    const { maxWidth, quality } = settings[category];
    return this.uploadImage(file, path, maxWidth, quality);
  }
}