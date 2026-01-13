"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Recipe } from '@/types/recipe';
import { Review } from '@/types/review';
import { useFavorites } from '@/hooks/useFavorites';
import { Toast, useToast } from '@/components/Toast';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { toasts, removeToast, success: showSuccess } = useToast();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseServings, setBaseServings] = useState(4);
  const [servings, setServings] = useState(4);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const [favoriteState, setFavoriteState] = useState({
    isFavorited: false,
    favoritesCount: 0,
  });

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, 'recipe', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Recipe;
          setRecipe({
            ...data,
            id: docSnap.id
          });
          // Initialize servings from recipe data
          const recipeServings = data.servings || 4;
          setBaseServings(recipeServings);
          setServings(recipeServings);
          setFavoriteState({
            isFavorited: data.favoritedBy?.includes(user?.uid || '') || false,
            favoritesCount: data.favoritesCount || 0,
          });
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
    fetchReviews();
  }, [id, user?.uid]);

  const fetchReviews = async () => {
    if (!id) return;
    
    setReviewsLoading(true);
    try {
      const reviewsQuery = query(
        collection(db, 'review'),
        where('recipeId', '==', id)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const fetchedReviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      // Check if current user has already reviewed
      const currentUserReview = fetchedReviews.find(r => r.userId === user?.uid);
      setUserReview(currentUserReview || null);
      
      // Filter out current user's review from the list to show it separately
      const otherReviews = fetchedReviews.filter(r => r.userId !== user?.uid);
      
      setReviews(otherReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      
      // Calculate average rating from all reviews
      if (fetchedReviews.length > 0) {
        const avgRating = fetchedReviews.reduce((sum, r) => sum + r.rating, 0) / fetchedReviews.length;
        setAverageRating(avgRating);
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      // Check if user already has a review for this recipe
      if (userReview) {
        throw new Error('You have already reviewed this recipe. Please edit your existing review instead.');
      }

      const newReview = {
        ...reviewData,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'review'), newReview);
      const addedReview: Review = {
        id: docRef.id,
        ...newReview,
        createdAt: new Date(),
      };
      
      setUserReview(addedReview);
      
      // Update average rating from all reviews (including new one)
      const allRatings = [...reviews.map(r => r.rating), addedReview.rating];
      const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
      setAverageRating(avgRating);
      
      showSuccess('Review posted successfully!');
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'review', reviewId));
      const updatedReviews = reviews.filter(r => r.id !== reviewId);
      
      // If deleting user's own review
      if (userReview?.id === reviewId) {
        setUserReview(null);
      } else {
        setReviews(updatedReviews);
      }
      
      // Update average rating
      const allReviewsForAvg = userReview?.id === reviewId ? updatedReviews : [userReview, ...updatedReviews].filter((r): r is Review => r !== null);
      if (allReviewsForAvg.length > 0) {
        const allRatings = allReviewsForAvg.map(r => r.rating);
        const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
        setAverageRating(avgRating);
      } else {
        setAverageRating(0);
      }
      
      showSuccess('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  const handleEditReview = async (reviewId: string, updatedData: Partial<Review>) => {
    try {
      await updateDoc(doc(db, 'review', reviewId), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
      
      // If editing user's own review
      if (userReview?.id === reviewId) {
        setUserReview({ ...userReview, ...updatedData });
      } else {
        const updatedReviews = reviews.map(r =>
          r.id === reviewId ? { ...r, ...updatedData } : r
        );
        setReviews(updatedReviews);
      }
      
      // Update average rating
      const allReviewsList = userReview?.id === reviewId
        ? [{ ...userReview, ...updatedData }, ...reviews]
        : [userReview, ...reviews.map(r => r.id === reviewId ? { ...r, ...updatedData } : r)].filter(Boolean);
      const allRatings = (allReviewsList as Review[]).map(r => r.rating);
      const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
      setAverageRating(avgRating);
      
      showSuccess('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  };

  const { isFavorited, favoritesCount, toggleFavorite, loading: favoriteLoading } = useFavorites(
    id,
    user?.uid,
    recipe?.favoritedBy || [],
    recipe?.favoritesCount || 0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Recipe not found'}
          </h1>
          <Link 
            href="/" 
            className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const scaledIngredients = (recipe.ingredients || []).map(ingredient => {
    const match = ingredient.match(/^(\d+\.?\d*)\s(.+)$/);
    if (match && servings !== baseServings) {
      const quantity = parseFloat(match[1]);
      const scaled = (quantity * servings) / baseServings;
      // Round to 2 decimal places
      const rounded = Math.round(scaled * 100) / 100;
      return `${rounded} ${match[2]}`;
    }
    return ingredient;
  });

  const recipeUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out this amazing recipe: ${recipe.title}`;

  const handleShare = async () => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description || shareText,
          url: recipeUrl,
        });
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
    
    // Fallback to showing share menu
    setShowShareMenu(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recipeUrl);
    showSuccess('Link copied to clipboard!');
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(recipeUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(`Check out this recipe: ${recipe.title}\n\n${recipe.description}\n\n${recipeUrl}`)}`;
    window.location.href = emailUrl;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toast toasts={toasts} removeToast={removeToast} />
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
          >
            ← Back to Recipes
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-sm font-bold rounded-full">
                  {recipe.category || 'General'}
                </span>
                <span className={`px-3 py-1 text-white text-sm font-bold rounded-full ${
                  recipe.difficulty === 'Easy' ? 'bg-green-500' :
                  recipe.difficulty === 'Medium' ? 'bg-yellow-600' :
                  'bg-red-500'
                }`}>
                  {recipe.difficulty || 'Medium'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                {recipe.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                {recipe.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map((tag, index) => (
                <span 
                  key={`${tag}-${index}`}
                  className="text-xs uppercase tracking-wider font-semibold px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {recipe.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prep Time</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {recipe.prepTime || 0} <span className="text-sm">mins</span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cook Time</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {recipe.cookTime || 0} <span className="text-sm">mins</span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totalTime} <span className="text-sm">mins</span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recipe Servings</p>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold"
              >
                −
              </button>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 w-12 text-center">
                {servings}
              </span>
              <button
                onClick={() => setServings(servings + 1)}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Adjust servings to scale ingredients</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h2>
              <ul className="space-y-3">
                {scaledIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span className="flex-1">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Instructions
              </h2>
              <ol className="space-y-6">
                {(recipe.steps || []).map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500 text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          {user ? (
            <button 
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`px-8 py-3 font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 ${
                isFavorited 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </button>
          ) : (
            <Link 
              href="/login"
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all active:scale-95"
            >
              🤍 Sign in to Save
            </Link>
          )}
          <button 
            onClick={handleShare}
            className="px-8 py-3 border-2 border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 font-bold rounded-lg transition-all active:scale-95"
          >
            📤 Share Recipe
          </button>
        </div>

        {/* Share Popup Modal */}
        {showShareMenu && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" onClick={() => setShowShareMenu(false)}>
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Share Recipe
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {recipe.title}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={shareOnTwitter}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-left font-semibold text-gray-800 dark:text-gray-200"
                >
                  <span className="text-2xl">𝕏</span>
                  <span>Share on Twitter</span>
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-left font-semibold text-gray-800 dark:text-gray-200"
                >
                  <span className="text-2xl">f</span>
                  <span>Share on Facebook</span>
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-left font-semibold text-gray-800 dark:text-gray-200"
                >
                  <span className="text-2xl">in</span>
                  <span>Share on LinkedIn</span>
                </button>
                <button
                  onClick={shareViaEmail}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-left font-semibold text-gray-800 dark:text-gray-200"
                >
                  <span className="text-2xl">✉️</span>
                  <span>Share via Email</span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-left font-semibold text-gray-800 dark:text-gray-200"
                >
                  <span className="text-2xl">🔗</span>
                  <span>{copyFeedback ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <button
                onClick={() => setShowShareMenu(false)}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <ReviewForm
            recipeId={id}
            userId={user?.uid}
            userName={user?.displayName || undefined}
            userPhoto={user?.photoURL || undefined}
            onSubmit={handleAddReview}
            hasExistingReview={!!userReview}
          />

          {/* User's Own Review */}
          {userReview && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Review</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-orange-300 dark:border-orange-600">
                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${
                        star <= userReview.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {userReview.comment}
                </p>

                {/* Edit/Delete Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const reviewElement = document.querySelector('[data-review-id="' + userReview.id + '"]');
                      if (reviewElement) {
                        reviewElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userReview.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <ReviewList
            reviews={reviews}
            averageRating={userReview ? ([userReview, ...reviews].reduce((sum, r) => sum + r.rating, 0) / ([userReview, ...reviews].length)) : averageRating}
            totalReviews={reviews.length + (userReview ? 1 : 0)}
            onDeleteReview={handleDeleteReview}
            onEditReview={handleEditReview}
          />
        </div>      </article>
    </main>
  );
}