# Recipe Platform - Architecture Overview

## 🏗️ Project Structure Summary

The Recipe Platform uses a **Next.js fullstack architecture** where the frontend and backend are integrated but clearly separated by concerns.

---

## Frontend vs Backend Separation

### 🎨 FRONTEND (Next.js + React)
**Location**: `src/`

**Responsibilities**:
- User interface rendering
- Form input validation
- Client-side state management
- User interactions
- Toast notifications
- Ingredient scaling display

**Key Folders**:
```
src/
├── app/              # Next.js pages (routing)
├── components/       # React components
├── context/          # State management
├── hooks/            # Custom hooks
├── types/            # TypeScript interfaces
└── lib/              # Frontend utilities
```

---

### 🔧 BACKEND (Firebase)
**Location**: Firebase Cloud Console

**Responsibilities**:
- User authentication & security
- Data persistence (Firestore)
- File storage (Storage)
- Server-side validation
- Access control rules
- Data relationships

**Firebase Services**:
```
Firebase Project
├── Authentication       # Email/password auth
├── Firestore Database   # /users, /recipes collections
└── Cloud Storage        # User images, recipe images
```

---

## 📊 Complete Data Flow

```
USER INTERACTION (Frontend)
         ↓
    HTML/CSS/JS
         ↓
    React Component
         ↓
    Form Validation
    (Frontend Validation)
         ↓
    Firebase SDK Call
    (e.g., createUserWithEmailAndPassword)
         ↓
    FIREBASE BACKEND
    ├── Auth: Verify credentials
    ├── Rules: Check permissions
    ├── Validate: Server-side checks
    └── Persist: Save to Firestore
         ↓
    Return Success/Error
         ↓
    Update Frontend State
         ↓
    Show Result to User
```

---

## 📁 Complete File Tree

```
recipe-platform/
│
├── 🎨 FRONTEND LAYER
│   ├── src/app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home (recipe list)
│   │   ├── globals.css             # Tailwind styles
│   │   ├── login/page.tsx          # Authentication
│   │   ├── signup/page.tsx         # Registration
│   │   ├── account/page.tsx        # User profile & dashboard
│   │   └── recipes/
│   │       ├── new/page.tsx        # Create recipe
│   │       ├── [id]/page.tsx       # Recipe detail
│   │       └── [id]/edit/page.tsx  # Edit recipe
│   │
│   ├── src/components/
│   │   ├── Navbar.tsx              # Navigation + user menu
│   │   ├── RecipeCard.tsx          # Recipe card component
│   │   ├── RecipeForm.tsx          # Form for create/edit
│   │   └── Toast.tsx               # Notification popup
│   │
│   ├── src/context/
│   │   └── AuthContext.tsx         # Auth state + user info
│   │
│   ├── src/hooks/
│   │   ├── useFavorites.ts         # Favorite logic
│   │   └── useToast.ts             # Toast notifications
│   │
│   ├── src/types/
│   │   ├── recipe.ts               # Recipe interface
│   │   └── user.ts                 # User interface
│   │
│   └── src/lib/
│       └── firebase.ts             # Firebase config
│
├── 🔧 BACKEND CONFIGURATION
│   ├── DATABASE_STRUCTURE.md       # Database schema
│   ├── ARCHITECTURE.md             # This file
│   ├── .firebaserc                 # Firebase project config
│   ├── firestore.rules             # Security rules
│   ├── firestore.indexes.json      # Index configuration
│   └── storage.rules               # Storage rules
│
└── 📦 PROJECT CONFIG
    ├── package.json                # npm dependencies
    ├── tsconfig.json               # TypeScript settings
    ├── next.config.ts              # Next.js settings
    ├── tailwind.config.ts           # Tailwind CSS
    ├── eslint.config.mjs            # Code quality
    └── postcss.config.mjs           # CSS processing
```

---

## 🔄 API Layer (Firebase SDK)

The bridge between frontend and backend is the **Firebase JavaScript SDK**.

```
FRONTEND
├── Firebase SDK
│   ├── firebase/auth        → Authentication
│   ├── firebase/firestore   → Database reads/writes
│   ├── firebase/storage     → File uploads
│   └── firebase/analytics   → Event tracking (optional)
└── Makes calls to Firebase Backend

BACKEND (Firebase)
├── Auth Service             → Manages users & passwords
├── Firestore               → Stores user & recipe data
├── Storage                 → Stores images
└── Returns responses to SDK
```

---

## 🔐 Authentication Flow (Frontend → Backend)

```
FRONTEND                          FIREBASE BACKEND
┌─────────────────────┐           ┌─────────────────────┐
│  Signup Page        │           │  Auth Service       │
└──────────┬──────────┘           └─────────────────────┘
           │                                 
           │ 1. Form submit                  
           ├─────────────────────────────→  Verify email format
           │                                 │
           │                          Validate password strength
           │                                 │
           │ 2. Create user request   Generate password hash
           ├─────────────────────────────→  │
           │                          Create Auth record
           │                                 │
           │ 3. Success + Auth token ←──────┤
           ├─────────────────────────────  
           │
           │ 4. Call setDoc (Firestore)
           ├─────────────────────────────→  Create /users/{uid}
           │                          Firestore Collection
           │                                 │
           │ 5. Success response  ←──────────┤
           └─────────────────────────────
           │
           │ Redirect to home
           ↓
        ✓ User Created
```

---

## 📝 Recipe CRUD Flow (Frontend → Backend)

### CREATE Recipe
```
Frontend                Backend
RecipeForm ────→ Validation ────→ Firebase Storage
    ↓                                  ↓
  Image               Upload image    Get URL
    ↓                                  ↓
Firestore ────→ Create document ────→ /recipes/{id}
    ↓                                  ↓
Show toast                          Success
```

### READ Recipes
```
Frontend              Backend
Home page ────→ getDocs() ────→ Query /recipes
    ↓                              ↓
Display      ←────── Firestore ────← Sort by createdAt
recipes                Results
```

### UPDATE Recipe
```
Frontend                Backend
Edit page ────→ Validation ────→ updateDoc()
    ↓                                  ↓
Form data      Check ownership    /recipes/{id}
    ↓                                  ↓
Show toast                        Updated
```

### DELETE Recipe
```
Frontend              Backend
Delete btn ────→ Confirm ────→ deleteDoc()
    ↓                             ↓
Redirect      ←──── Delete ──← /recipes/{id}
                  image from Storage
```

---

## 🔒 Security Layers

### Frontend Layer
```
User Input
    ↓
HTML5 Validation (type, required)
    ↓
JavaScript Validation
├── Empty checks
├── Format checks (email, URL)
├── Length checks (3-100 chars)
└── File checks (5MB max, image type)
    ↓
Form submission blocked if invalid
```

### Firebase Backend Layer
```
Firebase SDK Call
    ↓
Authentication Check
├── Is user logged in?
├── Is token valid?
└── Is token not expired?
    ↓
Firestore Security Rules
├── Can this user read?
├── Can this user write?
└── Validate data structure
    ↓
Database Operation
├── Store/retrieve data
└── Log operation
    ↓
Return to Frontend
```

---

## 🛠️ Technology Stack

### Frontend Stack
```
Runtime:           Node.js / Browser
Framework:         Next.js 13+
UI Library:        React 18+
Language:          TypeScript
Styling:           Tailwind CSS
State Management:  React Context + Hooks
HTTP Client:       Firebase SDK
Form Handling:     React Hooks (useState, useCallback)
```

### Backend Stack
```
Provider:          Google Firebase
Authentication:    Firebase Auth (Email/Password)
Database:          Cloud Firestore
File Storage:      Firebase Cloud Storage
Hosting:           Firebase Hosting (optional)
```

---

## 📊 Data Models

### User Model (Firestore)
```typescript
/users/{uid}
{
  uid: string              // Firebase Auth UID
  displayName: string      // User's name
  email: string           // User's email
  photoURL?: string       // Profile picture URL
  bio?: string            // User biography
  createdAt: timestamp    // Account creation
  updatedAt?: timestamp   // Last update
  totalRecipes?: number   // Count (denormalized)
  totalFavorites?: number // Count (denormalized)
  isVerified?: boolean    // Email verification status
}
```

### Recipe Model (Firestore)
```typescript
/recipes/{recipeId}
{
  id: string              // Document ID
  title: string           // Recipe name
  description: string     // Details
  ingredients: string[]   // List with quantities
  steps: string[]         // Cooking instructions
  imageUrl: string        // Image URL
  category: string        // Category type
  difficulty: string      // Easy/Medium/Hard
  prepTime: number        // Minutes
  cookTime: number        // Minutes
  tags: string[]          // Keywords
  authorId: string        // Link to /users/{uid}
  createdAt: timestamp    // Created date
  updatedAt?: timestamp   // Modified date
  favoritesCount: number  // Total favorites
  sharesCount: number     // Total shares
  favoritedBy: string[]   // User UIDs who favorited
}
```

---

## ✅ Implementation Status

### Completed ✓
- Frontend pages structure
- React components
- Firebase authentication (signup/login)
- Firestore initialization
- Storage integration
- Favorite system
- Toast notifications
- Form validation
- Ingredient scaling

### In Progress 🔄
- Backend database operations
- Security rules testing
- Index optimization

### TODO 📋
- Firestore rules deployment
- Index configuration
- Batch operations
- Advanced error handling
- Data archival strategy
