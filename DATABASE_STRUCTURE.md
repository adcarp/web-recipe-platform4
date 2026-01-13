# Recipe Platform - Architecture & Database Structure Guide

## Overview
The recipe platform uses a **Next.js fullstack architecture** with **Firebase** as the backend. This guide covers both the frontend (React components) and backend (Firebase services) structure.

---

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Next.js (React)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Pages Layer    │  │  Components      │  │   Hooks      │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  │
│  │ /app/page.tsx    │  │ Navbar           │  │ useAuth      │  │
│  │ /app/login       │  │ RecipeCard       │  │ useFavorites │  │
│  │ /app/signup      │  │ RecipeForm       │  │ useToast     │  │
│  │ /app/account     │  │ Toast            │  │              │  │
│  │ /app/recipes     │  │ AuthContext      │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                              ↓                                    │
│                    ┌─────────────────────┐                      │
│                    │   API Calls to      │                      │
│                    │   Firebase SDK      │                      │
│                    └─────────────────────┘                      │
│                              ↓                                    │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ↓
┌──────────────────────────────────────────────────────────────────┐
│              BACKEND - Firebase (Cloud Services)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Authentication      │  │ Firestore DB     │  │  Storage   │ │
│  ├─────────────────────┤  ├──────────────────┤  ├────────────┤ │
│  │ • Email/Password    │  │ /users/{uid}     │  │ /users/    │ │
│  │ • Session Mgmt      │  │ /recipes/{id}    │  │ /recipes/  │ │
│  │ • User Profiles     │  │                  │  │            │ │
│  └─────────────────────┘  └──────────────────┘  └────────────┘ │
│                              ↓                                    │
│                    ┌─────────────────────┐                      │
│                    │  Security Rules &   │                      │
│                    │  Data Validation    │                      │
│                    └─────────────────────┘                      │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Frontend Architecture - Component Hierarchy

```
App (Layout Root)
│
├── Navbar
│   └── User Menu (Profile, Logout, Settings)
│
└── Routes
    │
    ├── / (Home Page)
    │   └── RecipeCard (List View)
    │       ├── Favorite Button
    │       └── Share Button
    │
    ├── /login
    │   └── LoginForm
    │
    ├── /signup
    │   └── SignupForm
    │
    ├── /account
    │   ├── ProfileTab
    │   │   ├── Profile Info Display
    │   │   └── Image Upload
    │   ├── MyRecipesTab
    │   │   └── RecipeList (with Edit/Delete)
    │   ├── FavoritesTab
    │   │   └── RecipeCard (Favorites Only)
    │   └── DashboardTab
    │       └── Statistics Display
    │
    └── /recipes
        ├── /recipes/new
        │   └── RecipeForm (Create)
        │
        ├── /recipes/[id]
        │   ├── RecipeDetail
        │   ├── Ingredients (with Scaling)
        │   ├── Share Modal
        │   └── Favorite Button
        │
        └── /recipes/[id]/edit
            └── RecipeForm (Update)
```

---

## 🔐 Frontend - Hooks & Context Layer

### Authentication Context
```
AuthContext.tsx
├── useAuth() Hook
│   ├── user (current authenticated user)
│   ├── loading (authentication state)
│   └── logout() function
```

### Custom Hooks
```
hooks/
├── useFavorites.ts
│   ├── isFavorited (boolean state)
│   ├── favoritesCount (number)
│   └── toggleFavorite() function
│
└── useToast.ts
    ├── addToast() function
    ├── success() function
    ├── error() function
    └── info() function
```

---

## 🗄️ Backend Architecture - Firebase Services

### Firebase Authentication Flow
```
User Input
    ↓
[Frontend] signUpWithEmailAndPassword(email, password)
    ↓
[Firebase Auth] - Hashes & Stores Password
    ↓
[Frontend] createUserWithEmailAndPassword() Success
    ↓
[Frontend] updateProfile(displayName)
    ↓
[Frontend] setDoc() in /users/{uid}
    ↓
User Account Created ✓
```

### Firestore Collections

**Collection 1: Users**
```
/users/{uid}
├── uid
├── displayName
├── email
├── photoURL
├── bio
├── createdAt
├── updatedAt
├── totalRecipes
├── totalFavorites
└── isVerified
```

**Collection 2: Recipes**
```
/recipes/{recipeId}
├── id
├── title
├── description
├── ingredients[]
├── steps[]
├── imageUrl
├── category
├── difficulty
├── prepTime
├── cookTime
├── tags[]
├── authorId (→ links to /users/{uid})
├── createdAt
├── updatedAt
├── favoritesCount
├── sharesCount
└── favoritedBy[] (→ array of user UIDs)
```

### Firebase Storage Buckets
```
Storage
├── users/
│   └── {uid}/
│       └── profile.jpg
│
└── recipes/
    └── {recipeId}/
        └── image.jpg
```

---

## 🔄 Data Flow Diagrams

### 1. User Registration Flow
```
┌─────────────────┐
│  Signup Page    │
│  (Frontend)     │
└────────┬────────┘
         │ 1. Submit Form
         ↓
┌──────────────────────────────┐
│ Firebase Authentication      │
│ createUserWithEmailAndPassword│
└────────┬─────────────────────┘
         │ 2. Validate & Create Auth Account
         ↓
┌──────────────────────────────┐
│ updateProfile (displayName)  │
└────────┬─────────────────────┘
         │ 3. Update Auth User Profile
         ↓
┌──────────────────────────────┐
│ setDoc /users/{uid}          │
│ (Firestore Database)         │
└────────┬─────────────────────┘
         │ 4. Create User Document
         ↓
┌─────────────────┐
│ Redirect to     │
│ Home Page       │
└─────────────────┘
```

### 2. Recipe Creation Flow
```
┌──────────────────┐
│  New Recipe      │
│  Page (Frontend) │
└────────┬─────────┘
         │ 1. Fill Form & Submit
         ↓
┌──────────────────────────────┐
│ RecipeForm Component         │
│ - Validate inputs            │
│ - Validate image file        │
└────────┬─────────────────────┘
         │ 2. All validations pass
         ↓
┌──────────────────────────────┐
│ uploadBytes (Firebase Storage)│
│ Upload image to /recipes/{id}│
└────────┬─────────────────────┘
         │ 3. Get image URL
         ↓
┌──────────────────────────────┐
│ addDoc /recipes (Firestore)  │
│ with imageUrl & authorId     │
└────────┬─────────────────────┘
         │ 4. Recipe saved
         ↓
┌────────────────────────────────┐
│ Show success Toast & Redirect  │
│ to Recipe Detail Page          │
└────────────────────────────────┘
```

### 3. Favorite Management Flow
```
┌──────────────────┐
│ Recipe Page or   │
│ Recipe Card      │
│ (Frontend)       │
└────────┬─────────┘
         │ 1. Click Favorite Button
         ↓
┌──────────────────────────────┐
│ useFavorites Hook            │
│ - Check if already favorited │
└────────┬─────────────────────┘
         │ 2. Determine action (add/remove)
         ↓
         ├─→ If NOT favorited:
         │   ┌────────────────────────────┐
         │   │ updateDoc /recipes/{id}    │
         │   │ - arrayUnion(userId)       │
         │   │ - increment(favoritesCount)│
         │   └────────────┬───────────────┘
         │                │ 3a. Add to favorites
         │                ↓
         │   ┌────────────────────────────┐
         │   │ updateDoc /users/{uid}     │
         │   │ - increment(totalFavorites)│
         │   └────────────┬───────────────┘
         │                │ 4a. Update user stats
         │
         └─→ If ALREADY favorited:
             ┌────────────────────────────┐
             │ updateDoc /recipes/{id}    │
             │ - arrayRemove(userId)      │
             │ - increment(favoritesCount)│
             └────────────┬───────────────┘
                          │ 3b. Remove from favorites
                          ↓
             ┌────────────────────────────┐
             │ updateDoc /users/{uid}     │
             │ - increment(totalFavorites)│
             └────────────┬───────────────┘
                          │ 4b. Update user stats
                          ↓
         ┌──────────────────────────┐
         │ Show success Toast       │
         │ Update UI (Count, Button)│
         └──────────────────────────┘
```

---

## 🔐 Security Architecture

```
Frontend
├── Input Validation
│   ├── Empty field checks
│   ├── Format validation (email, file size)
│   └── Character length limits
│
└── Auth Context
    └── Client-side auth state management

                    ↓↓↓ FIREBASE SDK ↓↓↓

Backend - Firestore Security Rules
├── Authentication Check
│   └── request.auth != null
│
├── Users Collection Rules
│   ├── Public Read: allow read if true;
│   ├── Authenticated Write Own: allow write if request.auth.uid == uid;
│   └── Delete Own: allow delete if request.auth.uid == uid;
│
└── Recipes Collection Rules
    ├── Public Read: allow read if true;
    ├── Create if Authenticated: allow create if request.auth != null;
    ├── Update Only Own: allow update if request.auth.uid == resource.data.authorId;
    └── Delete Only Own: allow delete if request.auth.uid == resource.data.authorId;
```

---

## 📊 Frontend State Management

Firestore Database Structure Guide

## Collections Structure

---

## 📁 Directory Structure

```
recipe-platform/
│
├── 🎨 FRONTEND (Next.js Pages & Components)
│   ├── src/
│   │   ├── app/                          # Next.js Pages (Route handlers)
│   │   │   ├── layout.tsx                # Root layout with Navbar
│   │   │   ├── page.tsx                  # Home page (recipe list)
│   │   │   ├── login/page.tsx            # Login page
│   │   │   ├── signup/page.tsx           # Signup page
│   │   │   ├── account/page.tsx          # User account/profile page
│   │   │   ├── globals.css               # Global styles
│   │   │   └── recipes/
│   │   │       ├── [id]/page.tsx         # Recipe detail page
│   │   │       ├── [id]/edit/page.tsx    # Recipe edit page
│   │   │       └── new/page.tsx          # Create recipe page
│   │   │
│   │   ├── components/                   # Reusable React Components
│   │   │   ├── Navbar.tsx                # Navigation bar
│   │   │   ├── RecipeCard.tsx            # Recipe card component
│   │   │   ├── RecipeForm.tsx            # Recipe form (create/edit)
│   │   │   └── Toast.tsx                 # Notification component
│   │   │
│   │   ├── context/                      # React Context (State Management)
│   │   │   └── AuthContext.tsx           # Authentication context
│   │   │
│   │   ├── hooks/                        # Custom React Hooks
│   │   │   ├── useFavorites.ts           # Favorite management hook
│   │   │   └── useToast.ts               # Notification hook
│   │   │
│   │   ├── types/                        # TypeScript Interfaces
│   │   │   ├── recipe.ts                 # Recipe interface
│   │   │   └── user.ts                   # User interface
│   │   │
│   │   └── lib/
│   │       └── firebase.ts               # Firebase SDK initialization
│   │
│   ├── public/                           # Static assets
│   ├── tsconfig.json                     # TypeScript config
│   └── next.config.ts                    # Next.js config
│
└── 🔧 BACKEND CONFIGURATION
    ├── DATABASE_STRUCTURE.md             # This file
    ├── package.json                      # Dependencies & scripts
    ├── eslint.config.mjs                 # Code linting config
    └── postcss.config.mjs                # CSS processing config
```

---

## 🔐 Backend Collections Structure

### 1. **Users Collection** (`/users`)
Stores user account information and profile data.

```
/users/{uid}
├── uid (string) - Firebase Authentication UID
├── displayName (string) - User's display name
├── email (string) - User's email address
├── photoURL (string, optional) - Profile picture URL from Firebase Storage
├── bio (string, optional) - User bio/description
├── createdAt (timestamp) - Account creation date
├── updatedAt (timestamp, optional) - Last profile update
├── totalRecipes (number, optional) - Total recipes created (denormalized for performance)
├── totalFavorites (number, optional) - Total favorited recipes (denormalized)
└── isVerified (boolean, optional) - Email verification status
```

**Document ID**: The document ID is the user's Firebase UID (`userCredential.user.uid`)

**Example**:
```json
{
  "uid": "abc123xyz789",
  "displayName": "John Doe",
  "email": "john@example.com",
  "photoURL": "gs://bucket/users/abc123xyz789/profile.jpg",
  "bio": "Food enthusiast and home cook",
  "createdAt": "2026-01-13T10:00:00Z",
  "updatedAt": "2026-01-13T15:30:00Z",
  "totalRecipes": 5,
  "totalFavorites": 12,
  "isVerified": true
}
```

---

### 2. **Recipes Collection** (`/recipes`)
Stores all recipe data with references to users.

```
/recipes/{recipeId}
├── id (string) - Document ID (same as Firebase document ID)
├── title (string) - Recipe name
├── description (string) - Recipe description
├── ingredients (array<string>) - List of ingredients with quantities
├── steps (array<string>) - Cooking instructions
├── imageUrl (string) - Recipe image URL from Firebase Storage
├── category (string) - Recipe category (Breakfast, Lunch, Dinner, etc.)
├── difficulty (string) - Difficulty level (Easy, Medium, Hard)
├── prepTime (number) - Prep time in minutes
├── cookTime (number) - Cook time in minutes
├── tags (array<string>) - Recipe tags for search/filtering
├── authorId (string) - Reference to /users/{uid}
├── createdAt (timestamp) - Recipe creation date
├── updatedAt (timestamp, optional) - Last modification date
├── favoritesCount (number) - Total number of favorites (denormalized)
├── sharesCount (number) - Total number of shares (denormalized)
└── favoritedBy (array<string>) - Array of user UIDs who favorited
```

**Document ID**: Auto-generated by Firestore or can be custom

**Example**:
```json
{
  "id": "recipe_001",
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "ingredients": [
    "2 cups flour",
    "1 cup butter",
    "3/4 cup sugar",
    "2 eggs",
    "2 cups chocolate chips"
  ],
  "steps": [
    "Preheat oven to 350°F",
    "Mix butter and sugar",
    "Add eggs and mix well",
    "Fold in flour and chocolate chips",
    "Bake for 12 minutes"
  ],
  "imageUrl": "gs://bucket/recipes/recipe_001/image.jpg",
  "category": "Dessert",
  "difficulty": "Easy",
  "prepTime": 15,
  "cookTime": 12,
  "tags": ["dessert", "quick", "family-favorite"],
  "authorId": "abc123xyz789",
  "createdAt": "2026-01-10T08:00:00Z",
  "updatedAt": "2026-01-13T12:00:00Z",
  "favoritesCount": 45,
  "sharesCount": 12,
  "favoritedBy": ["user1", "user2", "user3"]
}
```

---

## Relationships & CRUD Operations

### User ↔ Recipe Relationship
- **One User** → **Many Recipes** (One-to-Many)
- A user (via `authorId`) can create multiple recipes
- A recipe belongs to one author

### User ↔ Favorites Relationship
- **Many Users** → **Many Recipes** (Many-to-Many)
- Stored in the recipe's `favoritedBy` array
- Track count in `favoritesCount` field

---

## CRUD Operations

### **CREATE Operations**

#### Create User (Signup)
```typescript
// In /src/app/signup/page.tsx (already implemented)
await setDoc(doc(db, 'users', userCredential.user.uid), {
  uid: userCredential.user.uid,
  displayName: displayName,
  email: email,
  photoURL: '',
  createdAt: new Date(),
});
```

#### Create Recipe
```typescript
// In /src/app/recipes/new/page.tsx
const docRef = await addDoc(collection(db, 'recipes'), {
  title: formData.title,
  description: formData.description,
  ingredients: formData.ingredients,
  steps: formData.steps,
  imageUrl: formData.imageUrl,
  category: formData.category,
  difficulty: formData.difficulty,
  prepTime: formData.prepTime,
  cookTime: formData.cookTime,
  tags: formData.tags,
  authorId: user.uid,  // Link to user
  createdAt: new Date(),
  updatedAt: new Date(),
  favoritesCount: 0,
  sharesCount: 0,
  favoritedBy: [],
});
```

---

### **READ Operations**

#### Get All Recipes
```typescript
const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
const querySnapshot = await getDocs(q);
const recipes = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

#### Get User's Recipes
```typescript
const q = query(
  collection(db, 'recipes'),
  where('authorId', '==', userId),
  orderBy('createdAt', 'desc')
);
const querySnapshot = await getDocs(q);
```

#### Get User Profile
```typescript
const userDoc = await getDoc(doc(db, 'users', userId));
const userData = userDoc.data();
```

#### Get User's Favorite Recipes
```typescript
const q = query(
  collection(db, 'recipes'),
  where('favoritedBy', 'array-contains', userId)
);
const querySnapshot = await getDocs(q);
```

---

### **UPDATE Operations**

#### Update User Profile
```typescript
await updateDoc(doc(db, 'users', userId), {
  displayName: newDisplayName,
  photoURL: newPhotoURL,
  bio: newBio,
  updatedAt: new Date(),
});
```

#### Update Recipe
```typescript
await updateDoc(doc(db, 'recipes', recipeId), {
  title: newTitle,
  description: newDescription,
  ingredients: newIngredients,
  steps: newSteps,
  updatedAt: new Date(),
});
```

#### Add Recipe to Favorites
```typescript
await updateDoc(doc(db, 'recipes', recipeId), {
  favoritedBy: arrayUnion(userId),
  favoritesCount: increment(1),
});

// Also update user's totalFavorites (optional denormalization)
await updateDoc(doc(db, 'users', userId), {
  totalFavorites: increment(1),
});
```

#### Remove Recipe from Favorites
```typescript
await updateDoc(doc(db, 'recipes', recipeId), {
  favoritedBy: arrayRemove(userId),
  favoritesCount: increment(-1),
});

// Also update user's totalFavorites (optional denormalization)
await updateDoc(doc(db, 'users', userId), {
  totalFavorites: increment(-1),
});
```

#### Increment Share Count
```typescript
await updateDoc(doc(db, 'recipes', recipeId), {
  sharesCount: increment(1),
});
```

---

### **DELETE Operations**

#### Delete Recipe
```typescript
// First, delete recipe image from Storage
await deleteObject(ref(storage, `recipes/${recipeId}/image.jpg`));

// Then, delete recipe document
await deleteDoc(doc(db, 'recipes', recipeId));

// Update author's totalRecipes count (optional)
await updateDoc(doc(db, 'users', authorId), {
  totalRecipes: increment(-1),
});
```

#### Delete User Account
```typescript
// 1. Delete user document
await deleteDoc(doc(db, 'users', userId));

// 2. Delete user's profile image from Storage
await deleteObject(ref(storage, `users/${userId}/profile.jpg`));

// 3. Delete all user's recipes (get them first)
const recipesQuery = query(
  collection(db, 'recipes'),
  where('authorId', '==', userId)
);
const recipes = await getDocs(recipesQuery);

for (const recipeDoc of recipes.docs) {
  // Delete recipe images and documents
  await deleteDoc(recipeDoc.ref);
}

// 4. Delete Firebase Auth account
await deleteUser(auth.currentUser);
```

---

## Storage Structure (Firebase Storage)

```
bucket/
├── users/
│   └── {uid}/
│       └── profile.jpg
├── recipes/
│   └── {recipeId}/
│       └── image.jpg
```

---

## Firestore Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - public read, authenticated write own
    match /users/{uid} {
      allow read: if true;
      allow create, update: if request.auth.uid == uid;
      allow delete: if request.auth.uid == uid;
    }
    
    // Recipes collection - public read, authenticated write
    match /recipes/{recipeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.authorId;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

---

## Indexing Strategy

**Recommended Composite Indexes**:

1. **For user recipes**:
   - Collection: `recipes`
   - Fields: `authorId` (Ascending) + `createdAt` (Descending)

2. **For favorite recipes by user**:
   - Collection: `recipes`
   - Fields: `favoritedBy` (Contains) + `createdAt` (Descending)

3. **For category filtering**:
   - Collection: `recipes`
   - Fields: `category` (Ascending) + `createdAt` (Descending)

Firestore will suggest these indexes automatically when you run queries.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────┐
│         Firebase Authentication        │
│        (Email/Password Sign-up)         │
└──────────────────┬──────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   /users/{uid}       │
        │  (User Profile)      │
        └──────────────────────┘
                   │
      ┌────────────┴────────────┐
      ↓                         ↓
┌──────────────────┐    ┌──────────────────┐
│  Creates many    │    │  Favorites many  │
│   recipes        │    │   recipes        │
└──────────────────┘    └──────────────────┘
      │                         │
      └────────────┬────────────┘
                   ↓
        ┌──────────────────────┐
        │ /recipes/{recipeId}  │
        │  (Recipe Details)    │
        │  - authorId (links   │
        │    back to user)     │
        │  - favoritedBy[]     │
        │    (links to users)  │
        └──────────────────────┘
```

---

## 📋 Implementation Checklist

### Frontend ✓
- [x] Pages structure (/login, /signup, /account, /recipes/[id], etc.)
- [x] Components (Navbar, RecipeCard, RecipeForm, Toast)
- [x] Authentication context (AuthContext.tsx)
- [x] Custom hooks (useFavorites, useToast)
- [x] Form validation (inputs, file size, file format)
- [x] TypeScript interfaces (User, Recipe)
- [x] Toast notifications system
- [x] Ingredient scaling with servings
- [x] Favorite functionality UI
- [x] Recipe sharing UI

### Backend (Firebase) - In Progress
- [x] Firebase Authentication setup
- [x] Firestore initialization
- [x] Firebase Storage initialization
- [ ] User document creation on signup (basic done, enhance with all fields)
- [ ] Recipe CRUD operations in database
- [ ] Firestore Security Rules deployment
- [ ] Firestore Indexes configuration
- [ ] Storage bucket structure setup
- [ ] Error handling middleware
- [ ] Data validation at backend level

### Backend (Firebase) - To Do
- [ ] Implement batch delete for multiple recipes
- [ ] Add transaction support for atomic operations
- [ ] Set up Firestore backup policies
- [ ] Configure Storage retention policies
- [ ] Implement rate limiting on create operations
- [ ] Add audit logging for sensitive operations
- [ ] Set up automated data cleanup jobs
- [ ] Implement data archival strategy

---

## 🚀 Next Steps

### Immediate Priority
1. **Deploy Firestore Security Rules** - Copy the rules from this guide to Firebase Console
2. **Configure Firestore Indexes** - Create composite indexes as recommended
3. **Test All CRUD Operations** - Verify database operations work correctly
4. **Set up Storage Bucket Rules** - Configure image upload security

### Short-term Goals
1. Create **database utility functions** (`src/lib/database.ts`) for common operations
2. Add **comprehensive error handling** with user-friendly error messages
3. Implement **batch operations** for efficiency
4. Add **data validation** at the database level (Firestore rules)

### Long-term Goals
1. Add **real-time listeners** for live updates
2. Implement **pagination** for large recipe lists
3. Add **search and filtering** capabilities
4. Implement **user analytics** tracking
5. Add **backup and recovery** procedures
