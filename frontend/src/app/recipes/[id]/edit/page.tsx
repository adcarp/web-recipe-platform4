"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/types/recipe';
import { Toast, useToast } from '@/components/Toast';

export default function EditRecipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toasts, removeToast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/');
      return;
    }

    if (!id) {
      setError('Recipe ID not found');
      setLoading(false);
      return;
    }

    fetchRecipe();
  }, [id, user, authLoading, router]);

  const fetchRecipe = async () => {
    try {
      const docRef = doc(db, 'recipe', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const recipeData = {
          id: docSnap.id,
          ...docSnap.data()
        } as Recipe;

        // Check if user is the author
        if (recipeData.authorId !== user?.uid) {
          setError('You do not have permission to edit this recipe');
          setLoading(false);
          return;
        }

        setRecipe(recipeData);
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

  const handleSubmit = async (formData: Partial<Recipe>) => {
    if (!id || !user?.uid) return;

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'recipe', id);
      
      // Don't update authorId, createdAt, or engagement metrics
      // Explicitly exclude authorId to prevent accidental overwrite
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: formData.category,
        difficulty: formData.difficulty,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        ingredients: formData.ingredients,
        steps: formData.steps,
        tags: formData.tags,
        updatedAt: serverTimestamp(),
      };

      // Ensure we never accidentally update authorId
      delete updateData.authorId;

      await updateDoc(docRef, updateData);
      router.push(`/recipes/${id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
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

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Recipe not found'}
          </h1>
          <Link 
            href="/account" 
            className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
          >
            Back to Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toast toasts={toasts} removeToast={removeToast} />
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link 
            href={`/recipes/${id}`}
            className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
          >
            ← Back to Recipe
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Recipe</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Update your recipe details below.
          </p>

          <RecipeForm 
            initialData={recipe}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitButtonText="Update Recipe"
          />
        </div>
      </div>
    </main>
  );
}
