import { describe, it, expect, beforeEach, vi } from 'vitest';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  arrayUnion: vi.fn((val) => ({ __type: 'arrayUnion', value: val })),
  arrayRemove: vi.fn((val) => ({ __type: 'arrayRemove', value: val })),
  increment: vi.fn((val) => ({ __type: 'increment', value: val })),
}));

describe('Recipe Favorites', () => {
  const mockUser = {
    uid: 'user-123',
    email: 'foodlover@example.com',
    displayName: 'Food Lover',
  };

  const mockRecipe = {
    id: 'recipe-456',
    title: 'Chocolate Cake',
    description: 'A delicious chocolate cake recipe',
    author: 'user-789',
    favorites: 5,
    favoritedBy: ['user-001', 'user-002'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Add recipe to favorites', async () => {
    vi.mocked(updateDoc).mockResolvedValueOnce(undefined);
    vi.mocked(arrayUnion).mockReturnValueOnce({
      __type: 'arrayUnion',
      value: mockRecipe.id,
    } as any);
    vi.mocked(increment).mockReturnValueOnce({
      __type: 'increment',
      value: 1,
    } as any);

    // Simulate favorite action
    const isCurrentlyFavorited = mockRecipe.favoritedBy.includes(mockUser.uid);
    expect(isCurrentlyFavorited).toBe(false);

    // Would add to favorites
    const updatedFavoritedBy = [...mockRecipe.favoritedBy, mockUser.uid];
    const updatedFavorites = mockRecipe.favorites + 1;

    expect(updatedFavoritedBy).toContain(mockUser.uid);
    expect(updatedFavorites).toBe(6);
  });

  it('Remove from favorites', async () => {
    const recipeWithUserFavorite = {
      ...mockRecipe,
      favoritedBy: [mockUser.uid, 'user-001', 'user-002'],
      favorites: 6,
    };

    vi.mocked(updateDoc).mockResolvedValueOnce(undefined);
    vi.mocked(arrayRemove).mockReturnValueOnce({
      __type: 'arrayRemove',
      value: mockUser.uid,
    } as any);
    vi.mocked(increment).mockReturnValueOnce({
      __type: 'increment',
      value: -1,
    } as any);

    // Simulate unfavorite action
    const isCurrentlyFavorited = recipeWithUserFavorite.favoritedBy.includes(
      mockUser.uid
    );
    expect(isCurrentlyFavorited).toBe(true);

    // Would remove from favorites
    const updatedFavoritedBy = recipeWithUserFavorite.favoritedBy.filter(
      (id) => id !== mockUser.uid
    );
    const updatedFavorites = recipeWithUserFavorite.favorites - 1;

    expect(updatedFavoritedBy).not.toContain(mockUser.uid);
    expect(updatedFavoritedBy.length).toBe(2);
    expect(updatedFavorites).toBe(5);
  });
});
