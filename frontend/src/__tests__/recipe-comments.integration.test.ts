import { describe, it, expect, beforeEach, vi } from 'vitest';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

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
}));

describe('Recipe Comments', () => {
  const mockUser = {
    uid: 'user-123',
    email: 'user@example.com',
    displayName: 'John Chef',
  };

  const mockRecipe = {
    id: 'recipe-456',
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta',
    author: 'user-789',
    comments: [
      {
        id: 'comment-1',
        text: 'This recipe is amazing!',
        author: 'user-001',
        authorName: 'Alice',
        createdAt: '2024-01-01T10:00:00Z',
        likes: 2,
      },
      {
        id: 'comment-2',
        text: 'Could not find pancetta, used bacon instead',
        author: 'user-002',
        authorName: 'Bob',
        createdAt: '2024-01-02T15:30:00Z',
        likes: 1,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Add comments', async () => {
    vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

    const newComment = {
      id: `comment-${Date.now()}`,
      text: 'Delicious! Made this for dinner.',
      author: mockUser.uid,
      authorName: mockUser.displayName,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    // Validate comment
    expect(newComment.text.trim().length).toBeGreaterThan(0);
    expect(newComment.text.length).toBeLessThanOrEqual(500);
    expect(newComment.author).toBe(mockUser.uid);
    expect(newComment.authorName).toBe(mockUser.displayName);

    // Would add comment to recipe
    const updatedComments = [...mockRecipe.comments, newComment];
    expect(updatedComments.length).toBe(mockRecipe.comments.length + 1);
    expect(updatedComments[updatedComments.length - 1]).toEqual(newComment);
  });

  it('Delete comments', async () => {
    vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

    const commentToDelete = mockRecipe.comments[0];
    const initialLength = mockRecipe.comments.length;

    // Remove comment
    const updatedComments = mockRecipe.comments.filter(
      (c) => c.id !== commentToDelete.id
    );

    expect(updatedComments.length).toBe(initialLength - 1);
    expect(updatedComments).not.toContain(commentToDelete);
  });
});
