import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

type RecipeCardProps = Pick<Recipe, 'id' | 'title' | 'imageUrl' | 'tags' | 'prepTime' | 'cookTime' | 'difficulty' | 'description' | 'category' | 'favoritesCount' | 'favoritedBy'>;

export default function RecipeCard({ 
  id, 
  title = "Untitled Recipe", 
  imageUrl, 
  tags = [], 
  prepTime = 0, 
  cookTime = 0, 
  difficulty = "Medium", 
  description = "No description provided.",
  category = "General",
  favoritesCount = 0,
  favoritedBy = []
}: RecipeCardProps) {
  const { user } = useAuth();
  const { isFavorited, favoritesCount: count, toggleFavorite, loading } = useFavorites(
    id,
    user?.uid,
    favoritedBy,
    favoritesCount
  );
  
  // Ensure we are working with numbers to avoid "1020" string concatenation
  const totalTime = Number(prepTime) + Number(cookTime);

  // CRITICAL FIX: Ensure tags is always an array before mapping
  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <div className="group flex flex-col h-full rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded text-xs font-bold text-orange-600">
          {category}
        </div>
        {/* Favorite Button */}
        {user && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite();
            }}
            disabled={loading}
            className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          >
            <span className="text-xl">{isFavorited ? '❤️' : '🤍'}</span>
          </button>
        )}
        <img 
          src={imageUrl || '/placeholder-recipe.jpg'} 
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap gap-1">
            {/* Using safeTags ensures .map() only runs on an actual array */}
            {safeTags.slice(0, 2).map((tag, index) => (
              <span key={`${tag}-${index}`} className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {tag}
              </span>
            ))}
            {safeTags.length === 0 && (
               <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-gray-50 text-gray-400 rounded">
                Recipe
               </span>
            )}
          </div>
          <span className={`text-xs font-bold ${
            difficulty === 'Easy' ? 'text-green-500' : 
            difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-500'
          }`}>
             {difficulty}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
          {description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1">
            ⏱️ <span className="font-semibold text-gray-700 dark:text-gray-200">{totalTime} mins</span>
          </span>
          <span className="text-xs italic flex items-center gap-1">
            ❤️ <span className="font-semibold">{count}</span>
          </span>
        </div>

        <Link 
          href={`/recipes/${id}`}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-center font-bold rounded-lg transition-all active:scale-95"
        >
          View full recipe
        </Link>
      </div>
    </div>
  );
}