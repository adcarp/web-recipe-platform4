"use client";

import { Review } from '@/types/review';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onEditReview?: (reviewId: string, updatedReview: Partial<Review>) => Promise<void>;
}

export default function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  onDeleteReview,
  onEditReview,
}: ReviewListProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEditStart = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleEditSave = async (reviewId: string) => {
    if (onEditReview) {
      try {
        await onEditReview(reviewId, {
          rating: editRating,
          comment: editComment.trim(),
        });
        setEditingId(null);
      } catch (error) {
        console.error('Error updating review:', error);
      }
    }
  };

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
              {editingId === review.id ? (
                // Edit Mode
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className={`text-3xl transition-all ${
                            star <= editRating
                              ? 'text-yellow-400 scale-110'
                              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Review
                    </label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(review.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStart(review)}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={deletingId === review.id}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-bold rounded transition-all disabled:opacity-50"
                        >
                          {deletingId === review.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
