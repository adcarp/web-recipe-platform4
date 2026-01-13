"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/types/recipe';
import { Toast, useToast } from '@/components/Toast';

export default function NewRecipePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast } = useToast();

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to create a recipe
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

  const handleSubmit = async (formData: Partial<Recipe>) => {
    setIsLoading(true);
    try {
      // Ensure authorId is always the UID, not displayName
      if (!user?.uid) {
        throw new Error('User ID is not available');
      }

      console.log('Creating recipe with authorId:', user.uid, 'User:', user);

      // Sanitize formData to ensure it doesn't have incorrect authorId
      const cleanFormData = { ...formData };
      delete (cleanFormData as any).authorId;

      const recipeData = {
        ...cleanFormData,
        authorId: user.uid, // Explicitly set to UID only
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        favoritesCount: 0,
        sharesCount: 0,
        favoritedBy: [],
      };

      console.log('Final recipe data authorId:', recipeData.authorId);

      const docRef = await addDoc(collection(db, 'recipe'), recipeData);
      
      // Update user's totalRecipes count
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        totalRecipes: increment(1),
      });

      alert('Recipe created successfully!');
      router.push(`/recipes/${docRef.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toast toasts={toasts} removeToast={removeToast} />
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link 
            href="/account" 
            className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
          >
            ← Back to Account
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create a New Recipe</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Share your delicious recipe with our community!
          </p>

          <RecipeForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButtonText="Create Recipe"
          />
        </div>
      </div>
    </main>
  );
}
