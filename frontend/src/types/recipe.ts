export interface Recipe {
  id: string;
  title: string;
  description: string;    
  ingredients: string[];     
  steps: string[];           
  imageUrl: string;
  category: string;          
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number;          
  cookTime: number;          
  servings: number;
  tags: string[];            
  authorId: string;
  createdAt: any;
  updatedAt?: any;
  favoritesCount?: number;
  sharesCount?: number;
  favoritedBy?: string[];
}