# 🔧 Backend - Recipe Platform

## Overview
This folder contains all **backend configuration** for the Recipe Platform - Firebase cloud services.

## 📁 Structure

```
backend/
├── README.md                    # This file
├── .firebaserc                  # Firebase project config
├── firestore.rules              # Firestore security rules
├── storage.rules                # Cloud Storage security rules
├── firestore.indexes.json       # Composite indexes
└── docs/                        # Backend documentation
    ├── FIRESTORE_SETUP.md       # Database setup guide
    ├── SECURITY_RULES.md        # Security rules explanation
    └── DEPLOYMENT.md            # Deployment guide
```

## 🚀 Getting Started

### Prerequisites
- Firebase project created at [firebase.google.com](https://firebase.google.com)
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project ID set in `.firebaserc`

### Initialize Firebase CLI
```bash
cd backend
firebase login
firebase init
```

### Deploy to Firebase
```bash
firebase deploy
```

This deploys:
- Firestore Security Rules
- Cloud Storage Security Rules
- Firestore Indexes

## 📦 Firebase Services

### 1. Authentication
**Purpose**: User signup, login, password management

**Features**:
- Email/Password authentication
- Password reset
- User profile management
- Session management

**Configuration**: Done in [Firebase Console](https://console.firebase.google.com) UI

---

### 2. Firestore Database
**Purpose**: Store user and recipe data

**Collections**:
```
/users/{uid}
├── uid: string
├── displayName: string
├── email: string
├── photoURL: string (optional)
├── bio: string (optional)
├── createdAt: timestamp
├── updatedAt: timestamp (optional)
├── totalRecipes: number (optional)
├── totalFavorites: number (optional)
└── isVerified: boolean (optional)

/recipes/{recipeId}
├── id: string
├── title: string
├── description: string
├── ingredients: array
├── steps: array
├── imageUrl: string
├── category: string
├── difficulty: string (Easy/Medium/Hard)
├── prepTime: number
├── cookTime: number
├── tags: array
├── authorId: string (link to /users/{uid})
├── createdAt: timestamp
├── updatedAt: timestamp (optional)
├── favoritesCount: number
├── sharesCount: number
└── favoritedBy: array (user UIDs)
```

**See**: [DATABASE_STRUCTURE.md](../DATABASE_STRUCTURE.md) for full schema

---

### 3. Cloud Storage
**Purpose**: Store user and recipe images

**Structure**:
```
bucket/
├── users/{uid}/
│   └── profile.jpg
└── recipes/{recipeId}/
    └── image.jpg
```

**Limits**:
- Max file size: 5 MB
- Allowed formats: JPEG, PNG, WebP, GIF
- Accessed via signed URLs

---

## 🔐 Security Configuration

### Firestore Rules (`firestore.rules`)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - Public read, authenticated write own
    match /users/{uid} {
      allow read: if true;
      allow create, update: if request.auth.uid == uid;
      allow delete: if request.auth.uid == uid;
    }
    
    // Recipes - Public read, authenticated write
    match /recipes/{recipeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.authorId;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

**Rules Explanation**:
- `allow read: if true;` - Anyone can read (public recipes)
- `allow create: if request.auth != null;` - Only logged-in users can create
- `allow update: if request.auth.uid == resource.data.authorId;` - Only author can edit
- `allow delete: if request.auth.uid == resource.data.authorId;` - Only author can delete

### Storage Rules (`storage.rules`)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User profile pictures - Public read, authenticated write own
    match /users/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == uid 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    
    // Recipe images - Public read, authenticated write
    match /recipes/{recipeId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🗂️ Indexes

Firebase will create recommended indexes automatically, but key composite indexes:

**Recipes by Author**:
- Collection: `recipes`
- Fields: `authorId` (Ascending) + `createdAt` (Descending)

**Recipes by Favorites**:
- Collection: `recipes`
- Fields: `favoritedBy` (Contains) + `createdAt` (Descending)

**Recipes by Category**:
- Collection: `recipes`
- Fields: `category` (Ascending) + `createdAt` (Descending)

See `firestore.indexes.json` for full configuration.

---

## 📋 Setup Checklist

### Firebase Console Setup
- [ ] Create Firebase project
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database (Start in test mode, then apply rules)
- [ ] Create Cloud Storage bucket
- [ ] Copy Firebase config to frontend `.env.local`

### Local Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Initialize Firebase: `firebase init`
- [ ] Set project ID in `.firebaserc`

### Deploy Backend
- [ ] Review Firestore rules in `firestore.rules`
- [ ] Review Storage rules in `storage.rules`
- [ ] Review indexes in `firestore.indexes.json`
- [ ] Run: `firebase deploy`

### Verify Deployment
- [ ] Check Firebase Console - Rules deployed
- [ ] Test user signup/login
- [ ] Test recipe creation
- [ ] Test image upload

---

## 📊 Data Operations

### Create Operations
```javascript
// Create user (via Frontend)
await setDoc(doc(db, 'users', uid), {
  uid, displayName, email, createdAt
});

// Create recipe (via Frontend)
await addDoc(collection(db, 'recipes'), {
  title, description, ingredients, steps,
  imageUrl, authorId, createdAt
});
```

### Read Operations
```javascript
// Get all recipes
const recipes = await getDocs(collection(db, 'recipes'));

// Get user recipes
const userRecipes = await getDocs(
  query(collection(db, 'recipes'), where('authorId', '==', uid))
);
```

### Update Operations
```javascript
// Add to favorites
await updateDoc(doc(db, 'recipes', recipeId), {
  favoritedBy: arrayUnion(uid),
  favoritesCount: increment(1)
});
```

### Delete Operations
```javascript
// Delete recipe
await deleteDoc(doc(db, 'recipes', recipeId));

// Delete user
await deleteDoc(doc(db, 'users', uid));
```

**Full examples**: See [DATABASE_STRUCTURE.md](../DATABASE_STRUCTURE.md)

---

## 📈 Monitoring & Analytics

### Firebase Console Features
- **Authentication**: View users, auth methods, custom claims
- **Firestore**: View collections, documents, storage usage
- **Storage**: View files, storage usage, access patterns
- **Rules**: Test security rules in console

### Common Issues
| Issue | Solution |
|-------|----------|
| Permission denied | Check security rules in console |
| Document not found | Verify collection/document names |
| Upload failed | Check file size, MIME type, storage rules |
| Query slow | Check if indexes are applied |

---

## 🚀 Deployment Commands

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Rules
```bash
firebase deploy --only firestore:rules,storage
```

### Deploy Only Indexes
```bash
firebase deploy --only firestore:indexes
```

### Test Rules Locally
```bash
firebase emulators:start
```

---

## 📚 Documentation

- [DATABASE_STRUCTURE.md](../DATABASE_STRUCTURE.md) - Database schema & operations
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture overview
- [FRONTEND_BACKEND_GUIDE.md](../FRONTEND_BACKEND_GUIDE.md) - Backend guide

---

## 🔗 Related Frontend

Frontend code that uses these services:
- `/frontend/src/app/signup/page.tsx` - User registration
- `/frontend/src/app/login/page.tsx` - User login
- `/frontend/src/app/recipes/new/page.tsx` - Recipe creation
- `/frontend/src/lib/firebase.ts` - Firebase SDK config

---

## 📞 Firebase Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Security Rules Guide](https://firebase.google.com/docs/database/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Last Updated**: January 13, 2026  
**Status**: ✅ Ready for Deployment
