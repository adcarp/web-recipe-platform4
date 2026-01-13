"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, arrayRemove, increment, serverTimestamp } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Recipe } from '@/types/recipe';
import { Toast, useToast } from '@/components/Toast';

type TabType = 'profile' | 'recipes' | 'favorites' | 'dashboard';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [pageLoading, setPageLoading] = useState(true);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/');
      return;
    }

    setDisplayName(user.displayName || '');
    setPhotoURL(user.photoURL || '');
    fetchUserData();
  }, [user, loading, router]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user's recipes
      const recipesQuery = query(
        collection(db, 'recipe'),
        where('authorId', '==', user.uid)
      );
      const recipesSnapshot = await getDocs(recipesQuery);
      const recipes = recipesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setUserRecipes(recipes);

      // Fetch favorite recipes
      const favQuery = query(
        collection(db, 'recipe'),
        where('favoritedBy', 'array-contains', user.uid)
      );
      const favSnapshot = await getDocs(favQuery);
      const favorites = favSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setFavoriteRecipes(favorites);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    
    try {
      let updatedPhotoURL = photoURL;

      // Upload image to Firebase Storage if a new file was selected
      if (profileImageFile) {
        setUploadingImage(true);
        try {
          const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}`);
          await uploadBytes(storageRef, profileImageFile);
          updatedPhotoURL = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image');
          setUploadingImage(false);
          setSavingProfile(false);
          return;
        }
        setUploadingImage(false);
      }

      // Update Firebase Auth
      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: updatedPhotoURL || user.photoURL,
      });

      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName || user.displayName,
        photoURL: updatedPhotoURL || user.photoURL,
        updatedAt: serverTimestamp(),
      });

      setPhotoURL(updatedPhotoURL);
      setProfileImageFile(null);
      setEditingProfile(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setProfileImageFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoURL(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      await deleteDoc(doc(db, 'recipe', recipeId));
      
      // Update user's totalRecipes count
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          totalRecipes: increment(-1),
        });
      }
      
      setUserRecipes(userRecipes.filter(r => r.id !== recipeId));
      setDeleteConfirm(null);
      showSuccess('Recipe deleted successfully!');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      showError('Failed to delete recipe');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || pageLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(user.displayName || user.email)?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.displayName || 'Welcome'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['profile', 'recipes', 'favorites', 'dashboard'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'profile' && '👤 Profile'}
              {tab === 'recipes' && '📖 My Recipes'}
              {tab === 'favorites' && '❤️ Favorites'}
              {tab === 'dashboard' && '📊 Dashboard'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
            
            {!editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.displayName || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Photo URL</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.photoURL || 'Not set'}</p>
                </div>
                <button
                  onClick={() => setEditingProfile(true)}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {photoURL && (
                      <div className="relative">
                        <img 
                          src={photoURL} 
                          alt="Profile preview"
                          className="h-40 w-40 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoURL(user.photoURL || '');
                            setProfileImageFile(null);
                          }}
                          className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded transition-all"
                        >
                          Remove Preview
                        </button>
                      </div>
                    )}

                    {/* File Input */}
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg cursor-pointer transition-all">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Max 5MB</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Photo URL (Optional)</label>
                  <input
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/photo.jpg"
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Or paste a URL directly</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || uploadingImage}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {uploadingImage ? 'Uploading...' : savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileImageFile(null);
                      setPhotoURL(user.photoURL || '');
                    }}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Recipes Tab */}
        {activeTab === 'recipes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Recipes ({userRecipes.length})</h2>
              <Link 
                href="/recipes/new"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
              >
                + Add Recipe
              </Link>
            </div>

            {userRecipes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any recipes yet.</p>
                <Link 
                  href="/recipes/new"
                  className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
                >
                  Create Your First Recipe
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userRecipes.map(recipe => (
                  <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{recipe.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{recipe.description}</p>
                      <div className="flex gap-3 flex-wrap text-sm">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {recipe.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          ❤️ {recipe.favoritesCount || 0} favorites
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          📤 {recipe.sharesCount || 0} shares
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 whitespace-nowrap">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
                      >
                        View
                      </Link>
                      <Link
                        href={`/recipes/${recipe.id}/edit`}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Favorite Recipes ({favoriteRecipes.length})</h2>

            {favoriteRecipes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't favorited any recipes yet.</p>
                <Link 
                  href="/"
                  className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
                >
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                  >
                    <Link href={`/recipes/${recipe.id}`}>
                      {recipe.imageUrl && (
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.title}
                          className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{recipe.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{recipe.description}</p>
                        <div className="flex gap-2 justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins</span>
                          <span className={`font-bold ${
                            recipe.difficulty === 'Easy' ? 'text-green-600' :
                            recipe.difficulty === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {recipe.difficulty}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button
                        onClick={async () => {
                          try {
                            const docRef = doc(db, 'recipe', recipe.id);
                            const userDocRef = doc(db, 'users', user!.uid);
                            
                            await updateDoc(docRef, {
                              favoritedBy: arrayRemove(user!.uid),
                              favoritesCount: increment(-1),
                            });
                            
                            // Decrement user's totalFavorites
                            await updateDoc(userDocRef, {
                              totalFavorites: increment(-1),
                            });
                            
                            setFavoriteRecipes(favoriteRecipes.filter(r => r.id !== recipe.id));
                            showSuccess('Removed from favorites');
                          } catch (error) {
                            console.error('Error removing favorite:', error);
                            showError('Failed to remove from favorites');
                          }
                        }}
                        className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                      >
                        ❤️ Remove from Favorites
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recipe Statistics</h2>

            {userRecipes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Create recipes to see statistics.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm font-semibold">Total Recipes</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userRecipes.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm font-semibold">Total Favorites</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {userRecipes.reduce((sum, r) => sum + (r.favoritesCount || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm font-semibold">Total Shares</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {userRecipes.reduce((sum, r) => sum + (r.sharesCount || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm font-semibold">Average Favorites</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {(userRecipes.reduce((sum, r) => sum + (r.favoritesCount || 0), 0) / userRecipes.length).toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Recipes Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recipe Performance</h3>
                  <div className="space-y-4">
                    {/* Most Popular */}
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🏆 Most Popular</h4>
                      {userRecipes.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0))[0] && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {userRecipes.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0))[0].title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ❤️ {userRecipes.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0))[0].favoritesCount || 0} favorites
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Least Popular */}
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📉 Least Popular</h4>
                      {userRecipes.sort((a, b) => (a.favoritesCount || 0) - (b.favoritesCount || 0))[0] && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {userRecipes.sort((a, b) => (a.favoritesCount || 0) - (b.favoritesCount || 0))[0].title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ❤️ {userRecipes.sort((a, b) => (a.favoritesCount || 0) - (b.favoritesCount || 0))[0].favoritesCount || 0} favorites
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Most Shared */}
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📤 Most Shared</h4>
                      {userRecipes.sort((a, b) => (b.sharesCount || 0) - (a.sharesCount || 0))[0] && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {userRecipes.sort((a, b) => (b.sharesCount || 0) - (a.sharesCount || 0))[0].title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📤 {userRecipes.sort((a, b) => (b.sharesCount || 0) - (a.sharesCount || 0))[0].sharesCount || 0} shares
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* All Recipes with Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Recipes Stats</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-bold text-gray-700 dark:text-gray-300">Recipe</th>
                          <th className="text-center py-3 px-4 font-bold text-gray-700 dark:text-gray-300">❤️ Favorites</th>
                          <th className="text-center py-3 px-4 font-bold text-gray-700 dark:text-gray-300">📤 Shares</th>
                          <th className="text-center py-3 px-4 font-bold text-gray-700 dark:text-gray-300">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userRecipes.map(recipe => (
                          <tr key={recipe.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                            <td className="py-3 px-4">
                              <Link href={`/recipes/${recipe.id}`} className="text-orange-600 hover:text-orange-700 font-semibold">
                                {recipe.title}
                              </Link>
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                              {recipe.favoritesCount || 0}
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                              {recipe.sharesCount || 0}
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                              {recipe.category}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
