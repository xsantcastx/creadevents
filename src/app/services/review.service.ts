import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  orderBy,
  query,
  limit,
  setDoc,
  serverTimestamp,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, map, of } from 'rxjs';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);
  private readonly collectionName = 'reviews';

  /**
   * Get latest published reviews for public display
   */
  getLatestReviews(max = 12): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, this.collectionName);
    const reviewsQuery = query(
      reviewsRef,
      orderBy('updatedAt', 'desc'),
      limit(max)
    );

    return collectionData(reviewsQuery, { idField: 'id' }).pipe(
      map(entries => entries
        .filter(entry => entry['published'] !== false)
        .map(entry => this.fromFirestore(entry)))
    );
  }

  /**
   * Listen for the current user's review
   */
  getReviewByUser(uid: string): Observable<Review | null> {
    if (!uid) {
      return of(null);
    }

    const reviewRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    return docData(reviewRef, { idField: 'id' }).pipe(
      map(data => data ? this.fromFirestore(data) : null)
    );
  }

  /**
   * Create or update a review for a user
   */
  async saveReview(input: {
    uid: string;
    displayName: string;
    rating: number;
    comment: string;
    photoURL?: string | null;
  }): Promise<void> {
    const reviewRef = doc(this.firestore, `${this.collectionName}/${input.uid}`);
    const existing = await getDoc(reviewRef);

    const normalizedRating = Math.min(5, Math.max(1, Math.round(input.rating)));
    const trimmedComment = input.comment.trim().slice(0, 600);

    const payload: Record<string, unknown> = {
      uid: input.uid,
      displayName: input.displayName || 'Anonymous Miner',
      rating: normalizedRating,
      comment: trimmedComment,
      photoURL: input.photoURL ?? null,
      published: true,
      updatedAt: serverTimestamp()
    };

    if (!existing.exists()) {
      payload['createdAt'] = serverTimestamp();
    }

    await setDoc(reviewRef, payload, { merge: true });
  }

  private fromFirestore(data: Record<string, any>): Review {
    return {
      id: data['id'] || data['uid'],
      uid: data['uid'],
      displayName: data['displayName'] || 'Anonymous Miner',
      rating: Number(data['rating']) || 0,
      comment: data['comment'] || '',
      photoURL: data['photoURL'] ?? null,
      createdAt: this.toDate(data['createdAt']),
      updatedAt: this.toDate(data['updatedAt'])
    };
  }

  private toDate(value: unknown): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (typeof value === 'object' && value && 'toDate' in value && typeof (value as any).toDate === 'function') {
      return (value as any).toDate();
    }

    return undefined;
  }

  async deleteReview(uid: string): Promise<void> {
    const reviewRef = doc(this.firestore, `${this.collectionName}/${uid}`);
    await deleteDoc(reviewRef);
  }
}
