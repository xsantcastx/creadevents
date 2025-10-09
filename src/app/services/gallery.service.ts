import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

function extractStoragePath(urlOrPath: string): string | null {
  if (!urlOrPath) {
    return null;
  }

  if (!urlOrPath.startsWith('http')) {
    return urlOrPath;
  }

  try {
    const parsed = new URL(urlOrPath);
    const match = parsed.pathname.match(/\/o\/(.+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch (error) {
    console.warn('Failed to parse storage URL:', error);
  }

  return null;
}

export interface GalleryImage {
  id?: string;
  category: 'cocinas' | 'banos' | 'fachadas' | 'industria' | 'otros';
  imageUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  project?: string;
  location?: string;
  tags?: string[];
  relatedProductIds?: string[];
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private imagesCollection = collection(this.firestore, 'galleryImages');
  private categoriesCollection = collection(this.firestore, 'galleryCategories');

  // Get all categories
  getCategories(): Observable<GalleryCategory[]> {
    return collectionData(this.categoriesCollection, { idField: 'id' }) as Observable<GalleryCategory[]>;
  }

  // Get all images
  getAllImages(): Observable<GalleryImage[]> {
    const q = query(this.imagesCollection, orderBy('uploadedAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<GalleryImage[]>;
  }

  // Get images by category
  getImagesByCategory(category: string): Observable<GalleryImage[]> {
    const q = query(
      this.imagesCollection,
      where('category', '==', category),
      orderBy('uploadedAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<GalleryImage[]>;
  }

  // Upload image to Storage and create Firestore document
  async uploadImage(
    file: File,
    category: string,
    metadata?: Partial<GalleryImage>
  ): Promise<string> {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${category}/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, `gallery/${filename}`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const imageUrl = await getDownloadURL(storageRef);

    // Create Firestore document
    const docRef = await addDoc(this.imagesCollection, {
      category,
      imageUrl,
      ...metadata,
      uploadedAt: new Date()
    });

    return docRef.id;
  }

  // Create Firestore document from existing URL (no upload)
  async addImageFromUrl(
    imageUrl: string,
    category: string,
    metadata?: Partial<GalleryImage>
  ): Promise<string> {
    const docRef = await addDoc(this.imagesCollection, {
      category,
      imageUrl,
      ...metadata,
      uploadedAt: new Date()
    });

    return docRef.id;
  }

  // Update image metadata
  async updateImage(id: string, data: Partial<GalleryImage>): Promise<void> {
    const imageDoc = doc(this.firestore, `galleryImages/${id}`);
    await updateDoc(imageDoc, data);
  }

  // Delete image
  async deleteImage(id: string, imageUrl: string): Promise<void> {
    // Delete from Firestore
    const imageDoc = doc(this.firestore, `galleryImages/${id}`);
    await deleteDoc(imageDoc);

    // Delete from Storage
    try {
      const storagePath = extractStoragePath(imageUrl);
      if (storagePath) {
        const imageRef = ref(this.storage, storagePath);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
    }
  }

  // Get image count by category
  async getImageCount(category: string): Promise<number> {
    const q = query(this.imagesCollection, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
}
