/**
 * Media Interaction Models
 * Represents likes and comments on gallery media
 */

export interface MediaLike {
  /** Firestore document ID */
  id?: string;

  /** Media ID that was liked */
  mediaId: string;

  /** User ID who liked */
  userId: string;

  /** User display name */
  userName: string;

  /** User email */
  userEmail: string;

  /** Timestamp of like */
  likedAt: Date;
}

export interface MediaComment {
  /** Firestore document ID */
  id?: string;

  /** Media ID that was commented on */
  mediaId: string;

  /** User ID who commented */
  userId: string;

  /** User display name */
  userName: string;

  /** User email */
  userEmail: string;

  /** Comment text */
  comment: string;

  /** Timestamp of comment */
  commentedAt: Date;

  /** Is comment edited */
  isEdited?: boolean;

  /** Last edit timestamp */
  editedAt?: Date;
}

export interface MediaLikeCreateInput {
  mediaId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

export interface MediaCommentCreateInput {
  mediaId: string;
  userId: string;
  userName: string;
  userEmail: string;
  comment: string;
}
