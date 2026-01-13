"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="hidden sm:inline text-xl font-bold text-orange-600 dark:text-orange-400">
              RecipeHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition-all"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link 
                  href="/account" 
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition-all"
                >
                  Account
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {(user.displayName || user.email)?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account?tab=recipes"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                      >
                        My Recipes
                      </Link>
                      <Link
                        href="/account?tab=favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                      >
                        Favorites
                      </Link>
                      <Link
                        href="/account?tab=dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border-t border-gray-200 dark:border-gray-600"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !loading ? (
              <Link 
                href="/login" 
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all"
              >
                Sign In
              </Link>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <Link 
                href="/account"
                className="text-orange-600 hover:text-orange-700 font-bold"
              >
                👤
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              🏠 Home
            </Link>

            {user ? (
              <>
                <Link 
                  href="/account" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  Account
                </Link>
                <Link 
                  href="/account?tab=recipes" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  My Recipes
                </Link>
                <Link 
                  href="/account?tab=favorites" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  Favorites
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : !loading ? (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-center"
              >
                Sign In
              </Link>
            ) : null}
          </div>
        )}
      </div>

      {/* Close mobile menu when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 md:hidden z-[-1]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}
