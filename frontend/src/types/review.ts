export interface Review {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: any;
  updatedAt?: any;
  likes?: number;
  likedBy?: string[];
}

export interface AverageRating {
  average: number;
  totalReviews: number;
  distribution: {
    [key: number]: number; // e.g., { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
  };
}
