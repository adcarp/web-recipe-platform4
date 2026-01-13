import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: () => ({}),
  getApps: () => [],
  getApp: () => ({}),
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: null,
  }),
  createUserWithEmailAndPassword: () => Promise.resolve(),
  signInWithEmailAndPassword: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: () => ({}),
  query: () => ({}),
  where: () => ({}),
  getDocs: () => Promise.resolve({ docs: [] }),
  doc: () => ({}),
  updateDoc: () => Promise.resolve(),
  arrayUnion: (val) => val,
  arrayRemove: (val) => val,
  increment: (val) => val,
}));

vi.mock('firebase/storage', () => ({
  getStorage: () => ({}),
  ref: () => ({}),
  uploadBytes: () => Promise.resolve(),
}));
