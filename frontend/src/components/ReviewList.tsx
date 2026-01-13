"use client";

import { Review } from '@/types/review';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onDeleteReview: (reviewId: string) => Promise<void>;
}

export default function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  onDeleteReview,
}: ReviewListProps) {
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      setDeletingId(reviewId);
      await onDeleteReview(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reviews & Ratings</h3>
        
        <div className="flex items-center gap-8">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.userPhoto ? (
                    <img
                      src={review.userPhoto}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {review.userName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                {user?.uid === review.userId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-bold rounded transition-all disabled:opacity-50"
                  >
                    {deletingId === review.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${
                      star <= review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
