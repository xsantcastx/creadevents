import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit as limitQuery,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Service, Project, Testimonial, BlogPost, Settings, Inquiry } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  // Services
  getServices(): Observable<Service[]> {
    const servicesRef = collection(this.firestore, 'services') as CollectionReference<Service>;
    return from(getDocs(query(servicesRef, orderBy('title')))).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  getService(slug: string): Observable<Service | undefined> {
    const servicesRef = collection(this.firestore, 'services') as CollectionReference<Service>;
    return from(getDocs(query(servicesRef, where('slug', '==', slug)))).pipe(
      map(snapshot => {
        const doc = snapshot.docs[0];
        return doc ? { id: doc.id, ...doc.data() } : undefined;
      })
    );
  }

  addService(service: Omit<Service, 'id'>): Observable<string> {
    const servicesRef = collection(this.firestore, 'services');
    return from(addDoc(servicesRef, {
      ...service,
      createdAt: new Date(),
      updatedAt: new Date()
    })).pipe(map(docRef => docRef.id));
  }

  updateService(id: string, service: Partial<Service>): Observable<void> {
    const serviceRef = doc(this.firestore, 'services', id);
    return from(updateDoc(serviceRef, {
      ...service,
      updatedAt: new Date()
    }));
  }

  deleteService(id: string): Observable<void> {
    const serviceRef = doc(this.firestore, 'services', id);
    return from(deleteDoc(serviceRef));
  }

  // Projects
  getProjects(filters?: { eventType?: string; season?: string; limit?: number }): Observable<Project[]> {
    const projectsRef = collection(this.firestore, 'projects') as CollectionReference<Project>;
    let q = query(projectsRef, orderBy('date', 'desc'));
    
    if (filters?.eventType) {
      q = query(q, where('eventType', '==', filters.eventType));
    }
    
    if (filters?.season) {
      q = query(q, where('season', 'array-contains', filters.season));
    }
    
    if (filters?.limit) {
      q = query(q, limitQuery(filters.limit));
    }

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  getProject(slug: string): Observable<Project | undefined> {
    const projectsRef = collection(this.firestore, 'projects') as CollectionReference<Project>;
    return from(getDocs(query(projectsRef, where('slug', '==', slug)))).pipe(
      map(snapshot => {
        const doc = snapshot.docs[0];
        return doc ? { id: doc.id, ...doc.data() } : undefined;
      })
    );
  }

  getFeaturedProjects(limitCount: number = 6): Observable<Project[]> {
    const projectsRef = collection(this.firestore, 'projects') as CollectionReference<Project>;
    return from(getDocs(query(projectsRef, where('featured', '==', true), orderBy('date', 'desc'), limitQuery(limitCount)))).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  addProject(project: Omit<Project, 'id'>): Observable<string> {
    const projectsRef = collection(this.firestore, 'projects');
    return from(addDoc(projectsRef, {
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    })).pipe(map(docRef => docRef.id));
  }

  updateProject(id: string, project: Partial<Project>): Observable<void> {
    const projectRef = doc(this.firestore, 'projects', id);
    return from(updateDoc(projectRef, {
      ...project,
      updatedAt: new Date()
    }));
  }

  deleteProject(id: string): Observable<void> {
    const projectRef = doc(this.firestore, 'projects', id);
    return from(deleteDoc(projectRef));
  }

  // Testimonials
  getTestimonials(featured?: boolean): Observable<Testimonial[]> {
    const testimonialsRef = collection(this.firestore, 'testimonials') as CollectionReference<Testimonial>;
    let q = query(testimonialsRef, orderBy('createdAt', 'desc'));
    
    if (featured !== undefined) {
      q = query(q, where('featured', '==', featured));
    }

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  getTestimonial(id: string): Observable<Testimonial | undefined> {
    const testimonialRef = doc(this.firestore, 'testimonials', id);
    return from(getDoc(testimonialRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() as Testimonial } : undefined)
    );
  }

  addTestimonial(testimonial: Omit<Testimonial, 'id'>): Observable<string> {
    const testimonialsRef = collection(this.firestore, 'testimonials');
    return from(addDoc(testimonialsRef, {
      ...testimonial,
      createdAt: new Date()
    })).pipe(map(docRef => docRef.id));
  }

  updateTestimonial(id: string, testimonial: Partial<Testimonial>): Observable<void> {
    const testimonialRef = doc(this.firestore, 'testimonials', id);
    return from(updateDoc(testimonialRef, testimonial));
  }

  deleteTestimonial(id: string): Observable<void> {
    const testimonialRef = doc(this.firestore, 'testimonials', id);
    return from(deleteDoc(testimonialRef));
  }

  // Blog Posts
  getBlogPosts(published: boolean = true): Observable<BlogPost[]> {
    const postsRef = collection(this.firestore, 'posts') as CollectionReference<BlogPost>;
    const q = query(postsRef, where('published', '==', published), orderBy('publishedAt', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  getBlogPost(slug: string): Observable<BlogPost | undefined> {
    const postsRef = collection(this.firestore, 'posts') as CollectionReference<BlogPost>;
    return from(getDocs(query(postsRef, where('slug', '==', slug), where('published', '==', true)))).pipe(
      map(snapshot => {
        const doc = snapshot.docs[0];
        return doc ? { id: doc.id, ...doc.data() } : undefined;
      })
    );
  }

  addBlogPost(post: Omit<BlogPost, 'id'>): Observable<string> {
    const postsRef = collection(this.firestore, 'posts');
    return from(addDoc(postsRef, {
      ...post,
      createdAt: new Date(),
      updatedAt: new Date()
    })).pipe(map(docRef => docRef.id));
  }

  updateBlogPost(id: string, post: Partial<BlogPost>): Observable<void> {
    const postRef = doc(this.firestore, 'posts', id);
    return from(updateDoc(postRef, {
      ...post,
      updatedAt: new Date()
    }));
  }

  deleteBlogPost(id: string): Observable<void> {
    const postRef = doc(this.firestore, 'posts', id);
    return from(deleteDoc(postRef));
  }

  // Settings
  getSettings(): Observable<Settings | undefined> {
    const settingsRef = doc(this.firestore, 'settings', 'main');
    return from(getDoc(settingsRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() as Settings } : undefined)
    );
  }

  updateSettings(settings: Partial<Settings>): Observable<void> {
    const settingsRef = doc(this.firestore, 'settings', 'main');
    return from(updateDoc(settingsRef, {
      ...settings,
      updatedAt: new Date()
    }));
  }

  // Inquiries
  addInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Observable<string> {
    const inquiriesRef = collection(this.firestore, 'inquiries');
    return from(addDoc(inquiriesRef, {
      ...inquiry,
      status: 'new' as const,
      createdAt: new Date()
    })).pipe(map(docRef => docRef.id));
  }

  getInquiries(): Observable<Inquiry[]> {
    const inquiriesRef = collection(this.firestore, 'inquiries') as CollectionReference<Inquiry>;
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  updateInquiryStatus(id: string, status: Inquiry['status']): Observable<void> {
    const inquiryRef = doc(this.firestore, 'inquiries', id);
    return from(updateDoc(inquiryRef, {
      status,
      updatedAt: new Date()
    }));
  }
}