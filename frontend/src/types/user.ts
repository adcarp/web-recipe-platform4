export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: any;
  updatedAt?: any;
  totalRecipes?: number;
  totalFavorites?: number;
  isVerified?: boolean;
}
