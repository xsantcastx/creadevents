import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTaskSnapshot } from '@angular/fire/storage';
import { Observable, from, map } from 'rxjs';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);

  /**
   * Upload a file to Firebase Storage with progress tracking
   * @param file - The file to upload
   * @param path - The storage path (e.g., 'products/12mm/image.jpg')
   * @returns Observable that emits upload progress and final download URL
   */
  uploadFile(file: File, path: string): Observable<UploadProgress> {
    return new Observable(observer => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next({ progress });
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          observer.next({ progress: 0, error: error.message });
          observer.error(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            observer.next({ progress: 100, downloadURL });
            observer.complete();
          } catch (error: any) {
            console.error('Error getting download URL:', error);
            observer.error(error);
          }
        }
      );
    });
  }

  /**
   * Upload product image
   * @param file - The image file
   * @param productSlug - The product slug for the path
   * @returns Observable with upload progress
   */
  uploadProductImage(file: File, productSlug: string): Observable<UploadProgress> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const path = `products/${productSlug}-${timestamp}.${extension}`;
    return this.uploadFile(file, path);
  }

  /**
   * Upload gallery image
   * @param file - The image file
   * @param category - The gallery category (kitchens, bathrooms, etc.)
   * @returns Observable with upload progress
   */
  uploadGalleryImage(file: File, category: string): Observable<UploadProgress> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const path = `gallery/${category}/${timestamp}.${extension}`;
    return this.uploadFile(file, path);
  }

  /**
   * Delete a file from Firebase Storage
   * @param downloadURL - The download URL of the file to delete
   * @returns Promise that resolves when the file is deleted
   */
  async deleteFile(downloadURL: string): Promise<void> {
    try {
      // Extract the path from the download URL
      const path = this.getPathFromURL(downloadURL);
      if (!path) {
        throw new Error('Invalid download URL');
      }

      const fileRef = ref(this.storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Extract storage path from download URL
   * @param url - The download URL
   * @returns The storage path or null
   */
  private getPathFromURL(url: string): string | null {
    try {
      // Firebase Storage URLs follow this pattern:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  }

  /**
   * Validate image file
   * @param file - The file to validate
   * @param maxSizeMB - Maximum file size in MB (default 5MB)
   * @returns Validation result
   */
  validateImageFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }

  /**
   * Generate a slug from a name
   * @param name - The name to slugify
   * @returns The slug
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
