"use client";

import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { useToast } from './Toast';

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit: (data: Partial<Recipe>) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

// Validation constraints
const VALIDATION = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  INGREDIENT_MIN_LENGTH: 3,
};

export default function RecipeForm({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  submitButtonText = 'Create Recipe'
}: RecipeFormProps) {
  const { success: showSuccess, error: showError } = useToast();
  const [formData, setFormData] = useState<Partial<Recipe>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    category: initialData?.category || 'General',
    difficulty: initialData?.difficulty || 'Medium',
    prepTime: initialData?.prepTime || 0,
    cookTime: initialData?.cookTime || 0,
    servings: initialData?.servings || 4,
    ingredients: initialData?.ingredients || [''],
    steps: initialData?.steps || [''],
    tags: initialData?.tags || [''],
  });

  const [error, setError] = useState('');
  const [imageValidationError, setImageValidationError] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts editing
    if (error) setError('');
    if (imageValidationError && field === 'imageUrl') setImageValidationError('');
  };

  const validateImageFile = (file: File): string | null => {
    // Check file size
    if (file.size > VALIDATION.IMAGE_MAX_SIZE) {
      return `Image size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    
    // Check file type
    if (!VALIDATION.IMAGE_ALLOWED_TYPES.includes(file.type)) {
      return `Invalid image format. Allowed formats: JPEG, PNG, WebP, GIF. You selected: ${file.type}`;
    }
    
    return null;
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setImageValidationError(validationError);
      showError(validationError);
      return;
    }
    
    // Convert to base64 and set as imageUrl
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleInputChange('imageUrl', base64String);
      setImageValidationError('');
      showSuccess('Image uploaded successfully');
    };
    reader.onerror = () => {
      const errorMsg = 'Failed to read image file';
      setImageValidationError(errorMsg);
      showError(errorMsg);
    };
    reader.readAsDataURL(file);
  };

  const handleArrayFieldChange = (field: 'ingredients' | 'steps' | 'tags', index: number, value: string) => {
    const currentArray = (formData[field] || []) as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleInputChange(field, newArray);
  };

  const addArrayItem = (field: 'ingredients' | 'steps' | 'tags') => {
    const currentArray = (formData[field] || []) as string[];
    handleInputChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: 'ingredients' | 'steps' | 'tags', index: number) => {
    const currentArray = (formData[field] || []) as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleInputChange(field, newArray.length === 0 ? [''] : newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setImageValidationError('');

    // Title validation
    if (!formData.title?.trim()) {
      const msg = 'Recipe title is required';
      setError(msg);
      showError(msg);
      return;
    }

    if (formData.title.trim().length < VALIDATION.TITLE_MIN_LENGTH) {
      const msg = `Recipe title must be at least ${VALIDATION.TITLE_MIN_LENGTH} characters long`;
      setError(msg);
      showError(msg);
      return;
    }

    if (formData.title.trim().length > VALIDATION.TITLE_MAX_LENGTH) {
      const msg = `Recipe title must not exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`;
      setError(msg);
      showError(msg);
      return;
    }

    // Description validation
    if (!formData.description?.trim()) {
      const msg = 'Recipe description is required';
      setError(msg);
      showError(msg);
      return;
    }

    if (formData.description.trim().length < VALIDATION.DESCRIPTION_MIN_LENGTH) {
      const msg = `Recipe description must be at least ${VALIDATION.DESCRIPTION_MIN_LENGTH} characters long`;
      setError(msg);
      showError(msg);
      return;
    }

    if (formData.description.trim().length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
      const msg = `Recipe description must not exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`;
      setError(msg);
      showError(msg);
      return;
    }

    // Image URL validation
    if (!formData.imageUrl?.trim()) {
      const msg = 'Recipe image is required';
      setImageValidationError(msg);
      showError(msg);
      return;
    }

    // Ingredients validation
    const ingredients = (formData.ingredients || []).filter(i => i.trim());
    if (ingredients.length === 0) {
      const msg = 'At least one ingredient is required';
      setError(msg);
      showError(msg);
      return;
    }

    // Validate each ingredient
    const invalidIngredient = ingredients.find(i => i.trim().length < VALIDATION.INGREDIENT_MIN_LENGTH);
    if (invalidIngredient) {
      const msg = `Each ingredient must be at least ${VALIDATION.INGREDIENT_MIN_LENGTH} characters long`;
      setError(msg);
      showError(msg);
      return;
    }

    // Steps validation
    const steps = (formData.steps || []).filter(s => s.trim());
    if (steps.length === 0) {
      const msg = 'At least one instruction step is required';
      setError(msg);
      showError(msg);
      return;
    }

    const invalidStep = steps.find(s => s.trim().length < 5);
    if (invalidStep) {
      const msg = 'Each instruction step must be at least 5 characters long';
      setError(msg);
      showError(msg);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        ingredients: ingredients,
        steps: steps,
        tags: (formData.tags || []).filter(t => t.trim()),
        prepTime: Number(formData.prepTime) || 0,
        cookTime: Number(formData.cookTime) || 0,
      });
      showSuccess(submitButtonText === 'Update Recipe' ? 'Recipe updated successfully!' : 'Recipe created successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save recipe';
      showError(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Recipe Title *
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter recipe title"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter recipe description"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Recipe Image * (JPEG, PNG, WebP, GIF - Max 5MB)
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <label className="block px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg cursor-pointer text-center transition-all">
              Upload Image from Device
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
          </div>
          {imageValidationError && (
            <div className="p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
              {imageValidationError}
            </div>
          )}
        </div>
        {formData.imageUrl && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-recipe.jpg';
              }}
            />
          </div>
        )}
      </div>

      {/* Category & Difficulty */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select a category</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
            <option value="Snack">Snack</option>
            <option value="Beverage">Beverage</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="General">General</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty || ''}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Prep & Cook Time & Servings */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Prep Time (minutes)
          </label>
          <input
            type="number"
            value={formData.prepTime || 0}
            onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Cook Time (minutes)
          </label>
          <input
            type="number"
            value={formData.cookTime || 0}
            onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Servings
          </label>
          <input
            type="number"
            value={formData.servings || 4}
            onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Ingredients * (e.g., "2 cups flour")
        </label>
        <div className="space-y-2">
          {(formData.ingredients || []).map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleArrayFieldChange('ingredients', index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {(formData.ingredients?.length || 0) > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('ingredients', index)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('ingredients')}
          className="mt-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Instructions *
        </label>
        <div className="space-y-2">
          {(formData.steps || []).map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 pt-2">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold text-sm">
                  {index + 1}
                </span>
              </div>
              <textarea
                value={step}
                onChange={(e) => handleArrayFieldChange('steps', index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                rows={2}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {(formData.steps?.length || 0) > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('steps', index)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all h-fit"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('steps')}
          className="mt-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
        >
          + Add Step
        </button>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Tags (e.g., "gluten-free", "dairy-free")
        </label>
        <div className="space-y-2">
          {(formData.tags || []).map((tag, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleArrayFieldChange('tags', index, e.target.value)}
                placeholder={`Tag ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {(formData.tags?.length || 0) > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('tags', index)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('tags')}
          className="mt-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
        >
          + Add Tag
        </button>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
