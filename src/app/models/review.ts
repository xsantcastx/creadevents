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

