import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Mock AuthContext provider for testing
 */
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/**
 * Custom render function that wraps components with providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockAuthProvider>{children}</MockAuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Mock recipe object for testing
 */
export const mockRecipe = {
  id: '1',
  title: 'Test Recipe',
  description: 'A test recipe description',
  ingredients: ['ingredient1', 'ingredient2'],
  instructions: ['step1', 'step2'],
  cookTime: 30,
  prepTime: 10,
  servings: 4,
  difficulty: 'medium' as const,
  imageUrl: 'https://example.com/test.jpg',
  tags: ['test', 'easy'],
  author: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
  favoritedBy: [],
  favorites: 0,
};

/**
 * Mock user object for testing
 */
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: false,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
};

/**
 * Create a mock Firebase auth user
 */
export const createMockAuthUser = (overrides = {}) => {
  return {
    ...mockUser,
    ...overrides,
  };
};

/**
 * Utility to wait for async operations in tests
 */
export const waitForAsync = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

export default {
  renderWithProviders,
  mockRecipe,
  mockUser,
  createMockAuthUser,
  waitForAsync,
  mockLocalStorage,
};
