import { useState, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseFavoritesResult {
  isFavorited: boolean;
  favoritesCount: number;
  toggleFavorite: () => Promise<void>;
  loading: boolean;
}

export const useFavorites = (
  recipeId: string,
  userId: string | undefined,
  initialFavoritedBy: string[] = [],
  initialCount: number = 0
): UseFavoritesResult => {
  const [isFavorited, setIsFavorited] = useState(initialFavoritedBy.includes(userId || ''));
  const [favoritesCount, setFavoritesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = useCallback(async () => {
    if (!userId || !recipeId) return;

    setLoading(true);
    try {
      const recipeRef = doc(db, 'recipe', recipeId);
      const userRef = doc(db, 'users', userId);

      if (isFavorited) {
        // Remove from favorites
        await updateDoc(recipeRef, {
          favoritedBy: arrayRemove(userId),
          favoritesCount: increment(-1),
        });
        
        // Decrement user's totalFavorites
        await updateDoc(userRef, {
          totalFavorites: increment(-1),
        });
        
        setIsFavorited(false);
        setFavoritesCount(prev => Math.max(0, prev - 1));
      } else {
        // Add to favorites
        await updateDoc(recipeRef, {
          favoritedBy: arrayUnion(userId),
          favoritesCount: increment(1),
        });
        
        // Increment user's totalFavorites
        await updateDoc(userRef, {
          totalFavorites: increment(1),
        });
        
        setIsFavorited(true);
        setFavoritesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert state on error
      setIsFavorited(!isFavorited);
      setFavoritesCount(isFavorited ? favoritesCount + 1 : favoritesCount - 1);
    } finally {
      setLoading(false);
    }
  }, [recipeId, userId, isFavorited]);

  return { isFavorited, favoritesCount, toggleFavorite, loading };
};
