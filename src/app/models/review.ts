// Legacy review interface (for general site reviews)
export interface Review {
  id: string;
  uid: string;
  displayName: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
  photoURL?: string | null;
}

// Product review interface with purchase verification
export interface ProductReview {
  id?: string;
  productId: string;
  userId: string;
  orderId: string; // Link to order for purchase verification
  userName: string;
  userEmail: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  verified: boolean; // Verified purchase
  helpful: number; // Number of users who found this helpful
  helpfulBy: string[]; // Array of user IDs who marked as helpful
  status: 'pending' | 'approved' | 'rejected'; // For moderation
  images?: string[]; // Optional review images
  createdAt: Date;
  updatedAt?: Date;
  adminResponse?: {
    message: string;
    respondedBy: string;
    respondedAt: Date;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchaseCount: number;
}
