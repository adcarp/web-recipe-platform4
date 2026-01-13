/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/types/recipe'; // Import the interface

const ITEMS_PER_PAGE = 6; // 3 items per row, 2 rows

export default function HomePage() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]); // All recipes
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]); // Recently added (3 items)
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const q = query(collection(db, "recipe"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const fetchedRecipes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Recipe[];
        
        setAllRecipes(fetchedRecipes);
        // Set recently added to first 3 items
        setRecentRecipes(fetchedRecipes.slice(0, 3));
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecipes();
  }, []);

  // Search results filtering (for search section)
  const searchResults = allRecipes.filter(recipe => {
    const query = searchQuery.toLowerCase();
    const titleMatch = recipe.title?.toLowerCase().includes(query);
    const tagsMatch = Array.isArray(recipe.tags) && recipe.tags.some(tag => 
      tag.toLowerCase().includes(query)
    );
    return titleMatch || tagsMatch;
  });

  // All recipes filtering (for All Recipes section)
  const filteredAllRecipes = allRecipes.filter(recipe => {
    const query = searchQuery.toLowerCase();
    const titleMatch = recipe.title?.toLowerCase().includes(query);
    const tagsMatch = Array.isArray(recipe.tags) && recipe.tags.some(tag => 
      tag.toLowerCase().includes(query)
    );
    const categoryMatch = selectedCategory === 'All' || recipe.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;

    return (titleMatch || tagsMatch) && categoryMatch && difficultyMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAllRecipes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecipes = filteredAllRecipes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get unique categories and difficulties from all recipes
  const categories = ['All', ...Array.from(new Set(allRecipes.map(recipe => recipe.category).filter(Boolean)))];
  const difficulties = ['All', ...Array.from(new Set(allRecipes.map(recipe => recipe.difficulty).filter(Boolean)))];

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDifficulty]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-orange-500 py-20 px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Find & Share Amazing Recipes</h1>
        <p className="text-xl mb-8">Join our collaborative community of food lovers.</p>
        
        <div className="max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="Search by title or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 rounded-lg text-gray-900 bg-white border-2 border-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-900 transition-all"
          />
        </div>
      </section>

      {/* Search Results Section (Hidden when no search) */}
      {searchQuery && (
        <section className="max-w-7xl mx-auto py-12 px-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search Results</h2>
            <p className="text-gray-500 mb-8">Found {searchResults.length} recipe(s)</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map(recipe => (
                <RecipeCard key={recipe.id} {...recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-xl text-gray-500">No recipes match your search.</p>
            </div>
          )}
        </section>
      )}

      {/* Recently Added Section */}
      <section className="max-w-7xl mx-auto py-12 px-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recently Added</h2>
          <p className="text-gray-500 mb-8">Discover what's cooking in the community.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentRecipes.map(recipe => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        )}
      </section>

      {/* All Recipes Section with Filters */}
      <section className="max-w-7xl mx-auto py-12 px-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Recipes</h2>
          <p className="text-gray-500 mb-8">Browse our complete collection.</p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((category, idx) => (
                  <option key={`category-${idx}`} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {difficulties.map((difficulty, idx) => (
                  <option key={`difficulty-${idx}`} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Showing {paginatedRecipes.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredAllRecipes.length)} of {filteredAllRecipes.length} recipes
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : paginatedRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {paginatedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} {...recipe} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:border-orange-500'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-xl text-gray-500">No recipes match your filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}