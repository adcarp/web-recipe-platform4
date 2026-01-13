"use client";

import { useState } from 'react';
import { Review } from '@/types/review';
import { useToast } from './Toast';

interface ReviewFormProps {
  recipeId: string;
  userId: string | undefined;
  userName: string | undefined;
  userPhoto?: string;
  onSubmit: (reviewData: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  isLoading?: boolean;
  hasExistingReview?: boolean;
}

export default function ReviewForm({
  recipeId,
  userId,
  userName,
  userPhoto,
  onSubmit,
  isLoading = false,
  hasExistingReview = false,
}: ReviewFormProps) {
  const { success: showSuccess, error: showError } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !userName) {
      showError('Please log in to leave a review');
      return;
    }

    if (comment.trim().length < 5) {
      showError('Review must be at least 5 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        recipeId,
        userId,
        userName,
        ...(userPhoto && { userPhoto }),
        rating,
        comment: comment.trim(),
        likes: 0,
        likedBy: [],
      });

      setRating(5);
      setComment('');
      showSuccess('Review posted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId || !userName) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <p className="text-blue-800 dark:text-blue-200">
          Please <a href="/login" className="font-bold hover:underline">log in</a> to leave a review
        </p>
      </div>
    );
  }

  if (hasExistingReview) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <p className="text-blue-800 dark:text-blue-200">
          You have already reviewed this recipe. Please scroll down to edit or delete your review.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Leave a Review</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-4xl transition-all ${
                star <= rating
                  ? 'text-yellow-400 scale-110'
                  : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Your Review (minimum 5 characters)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this recipe..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comment.length} characters
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || isLoading}
        className="w-full px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
