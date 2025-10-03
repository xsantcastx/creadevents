import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';

import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';

import {
  getFirestore, collection, query, where, orderBy, getDocs,
  addDoc, updateDoc, serverTimestamp, doc, writeBatch, deleteDoc
} from 'firebase/firestore';

export type Section = 'hero' | 'gallery' | 'services' | 'about' | 'footer';

export interface ImageDoc {
  id: string;
  section: Section;
  path: string;      // storage path
  url: string;       // https download URL
  name: string;      // original filename
  order: number;     // UI sort
  alt?: string;
  caption?: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class ImageAssetService {
  private app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private storage = getStorage(this.app);
  private db = getFirestore(this.app);
  private col = collection(this.db, 'images');

  async list(section: Section): Promise<ImageDoc[]> {
    const q = query(this.col,
      where('section', '==', section),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as ImageDoc[];
  }

  upload(section: Section, file: File, onProgress?: (pct: number) => void): Promise<ImageDoc> {
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
        // default order = Date.now() so newest appears last unless you reorder
        const payload = {
          section, path, url, name: file.name,
          order: Date.now(), alt: '', caption: '',
          createdAt: serverTimestamp()
        };
        const refDoc = await addDoc(this.col, payload);
        resolve({ id: refDoc.id, ...(payload as any) });
      });
    });
  }

  async updateMeta(id: string, patch: Partial<Pick<ImageDoc, 'alt'|'caption'>>): Promise<void> {
    await updateDoc(doc(this.db, 'images', id), patch as any);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const batch = writeBatch(this.db);
    orderedIds.forEach((id, idx) => {
      batch.update(doc(this.db, 'images', id), { order: idx });
    });
    await batch.commit();
  }

  async remove(img: ImageDoc): Promise<void> {
    await deleteObject(ref(this.storage, img.path));
    await deleteDoc(doc(this.db, 'images', img.id));
  }

  async listAll(): Promise<ImageDoc[]> {
    const q = query(this.col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as ImageDoc[];
  }
}