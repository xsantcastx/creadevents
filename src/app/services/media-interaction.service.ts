import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  QueryDocumentSnapshot,
  serverTimestamp,
  collectionData,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaLike, MediaComment, MediaLikeCreateInput, MediaCommentCreateInput } from '../models/media-interaction';

@Injectable({
  providedIn: 'root'
})
export class MediaInteractionService {
  private firestore = inject(Firestore);

  // ===== LIKES =====

  /**
   * Get all likes for a specific media item
   */
  getMediaLikes(mediaId: string): Observable<MediaLike[]> {
    const likesQuery = query(
      collection(this.firestore, 'mediaLikes'),
      where('mediaId', '==', mediaId),
      orderBy('likedAt', 'desc')
    );

    return collectionData(likesQuery, { idField: 'id' }).pipe(
      map((likes: any[]) => likes.map(like => ({
        ...like,
        likedAt: like.likedAt instanceof Timestamp ? like.likedAt.toDate() : like.likedAt
      })))
    );
  }

  /**
   * Get like count for a media item
   */
  async getMediaLikeCount(mediaId: string): Promise<number> {
    const likesQuery = query(
      collection(this.firestore, 'mediaLikes'),
      where('mediaId', '==', mediaId)
    );
    const snapshot = await getDocs(likesQuery);
    return snapshot.size;
  }

  /**
   * Check if user has liked a media item
   */
  async hasUserLiked(mediaId: string, userId: string): Promise<boolean> {
    const likesQuery = query(
      collection(this.firestore, 'mediaLikes'),
      where('mediaId', '==', mediaId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(likesQuery);
    return !snapshot.empty;
  }

  /**
   * Add a like to a media item
   */
  async addLike(input: MediaLikeCreateInput): Promise<string> {
    // Check if already liked
    const alreadyLiked = await this.hasUserLiked(input.mediaId, input.userId);
    if (alreadyLiked) {
      throw new Error('You have already liked this image');
    }

    const likeData = {
      ...input,
      likedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(this.firestore, 'mediaLikes'), likeData);
    return docRef.id;
  }

  /**
   * Remove a like from a media item
   */
  async removeLike(mediaId: string, userId: string): Promise<void> {
    const likesQuery = query(
      collection(this.firestore, 'mediaLikes'),
      where('mediaId', '==', mediaId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(likesQuery);
    
    if (!snapshot.empty) {
      const likeDoc = snapshot.docs[0];
      await deleteDoc(doc(this.firestore, 'mediaLikes', likeDoc.id));
    }
  }

  /**
   * Toggle like for a media item
   */
  async toggleLike(mediaId: string, userId: string, userName: string, userEmail: string): Promise<boolean> {
    const hasLiked = await this.hasUserLiked(mediaId, userId);
    
    if (hasLiked) {
      await this.removeLike(mediaId, userId);
      return false; // Unlike
    } else {
      await this.addLike({ mediaId, userId, userName, userEmail });
      return true; // Liked
    }
  }

  // ===== COMMENTS =====

  /**
   * Get all comments for a specific media item
   */
  getMediaComments(mediaId: string): Observable<MediaComment[]> {
    const commentsQuery = query(
      collection(this.firestore, 'mediaComments'),
      where('mediaId', '==', mediaId),
      orderBy('commentedAt', 'desc')
    );

    return collectionData(commentsQuery, { idField: 'id' }).pipe(
      map((comments: any[]) => comments.map(comment => ({
        ...comment,
        commentedAt: comment.commentedAt instanceof Timestamp ? comment.commentedAt.toDate() : comment.commentedAt,
        editedAt: comment.editedAt instanceof Timestamp ? comment.editedAt.toDate() : comment.editedAt
      })))
    );
  }

  /**
   * Get comment count for a media item
   */
  async getMediaCommentCount(mediaId: string): Promise<number> {
    const commentsQuery = query(
      collection(this.firestore, 'mediaComments'),
      where('mediaId', '==', mediaId)
    );
    const snapshot = await getDocs(commentsQuery);
    return snapshot.size;
  }

  /**
   * Add a comment to a media item
   */
  async addComment(input: MediaCommentCreateInput): Promise<string> {
    const commentData = {
      ...input,
      commentedAt: serverTimestamp(),
      isEdited: false
    };

    const docRef = await addDoc(collection(this.firestore, 'mediaComments'), commentData);
    return docRef.id;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, newComment: string): Promise<void> {
    const commentRef = doc(this.firestore, 'mediaComments', commentId);
    await updateDoc(commentRef, {
      comment: newComment,
      isEdited: true,
      editedAt: serverTimestamp()
    });
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'mediaComments', commentId));
  }
}
