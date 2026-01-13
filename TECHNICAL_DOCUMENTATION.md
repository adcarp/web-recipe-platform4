# Recipe Platform -- Technical Documentation

## 1. General Overview

Recipe Platform is a comprehensive recipe sharing and management platform. The project uses the modern stack of Next.js and Firebase and is divided into two main components:

- Frontend: Next.js 16 with React 19, TypeScript, Tailwind CSS
- Backend: Firebase Cloud Services (Authentication, Firestore, Storage)

The platform allows users to authenticate, create and share recipes, manage favorites, and leave reviews with ratings.

---

## 2. Technical Objectives

- Modern web architecture with Next.js 16, React 19 and TypeScript
- Scalable serverless backend with Firebase Cloud Services
- Responsive interface with Tailwind CSS (Mobile-First)
- Secure authentication with Firebase Authentication
- NoSQL Database with Firestore (real-time sync)
- Persistent favorites system with real-time synchronization
- Review system with rating and sorting
- Optimized navigation with Next.js App Router
- Form validation and error handling

---

## 3. Features

### Users
- User registration and authentication via email/password
- User profile with photo (Firebase Auth)
- Persistent user session management

### Recipes
- Interactive recipe catalog with search and filtering
- Create recipes with ingredients, steps and images
- Edit and delete own recipes
- Scale ingredients based on number of servings
- Share recipes (Twitter, Facebook, LinkedIn, Email, Copy Link)

### Favorites
- Add/Remove favorites persistently
- Display number of favorites
- Real-time Firestore synchronization

### Reviews and Ratings
- Review system with 1-5 star rating
- Display average rating and total reviews
- CRUD operations for reviews (Create, Read, Delete)
- Display review author and date
- Validation: minimum 5 character review

### UI/UX
- Responsive design (Mobile, Tablet, Desktop)
- Toast notifications for feedback
- Loading states and skeleton loaders
- Hover effects and animations

---

## 4. Technologies Used

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.1 | Full-stack React framework |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Responsive styling |
| Firebase SDK | ^12.7.0 | Backend services |
| ESLint | ^9 | Code quality |

### Backend
| Service | Purpose |
|---------|---------|
| Firebase Auth | User authentication |
| Firestore | NoSQL database |
| Security Rules | Access control |

### Build & Deploy
| Tool | Purpose |
|------|---------|
| npm | Package manager |
| Vercel | Frontend deployment |
| Firebase CLI | Backend deployment |

---

## 5. Agile Methodology

The project followed an iterative Agile approach with sprints and continuous feedback.

### Implemented Sprints

**Sprint 1: Foundations**
- Next.js + TypeScript setup
- Firebase configuration
- Authentication pages (Login/Signup)

**Sprint 2: Recipe CRUD**
- Create recipes with form
- Display recipe catalog
- Edit and delete recipes

**Sprint 3: Favorites & Reviews**
- Persistent favorites system
- Review system with rating
- Real-time synchronization

**Sprint 4: Polish & Optimization**
- Responsiveness
- Toast notifications
- Error handling

**Sprint 5: Deployment**
- Vercel deployment
- Firebase rules deployment
- Production testing

### Development Flow

```
graph LR
A[Sprint Planning] --> B[Component Design]
B --> C[Feature Implementation]
C --> D[Unit Testing]
D --> E[Code Review]
E --> F[Staging Deployment]
F --> G[Feedback]
G --> H[Sprint Retrospective]
H --> A
```

---

## 6. Application Architecture

```
graph TB
subgraph "Frontend Layer - Next.js/React"
    A[Pages & Components] --> B[State Management]
    B --> C[React Hooks]
    C --> D[Client Components]
end

subgraph "API Layer - Firebase SDK"
    D --> E[Authentication]
    D --> F[Firestore Queries]
    D --> G[Storage Upload]
end

subgraph "Backend Services - Firebase Cloud"
    E --> H[Firebase Auth Service]
    F --> I[Firestore Database]
    G --> J[Cloud Storage]
    H --> K[Security Rules]
    I --> K
    J --> K
end

subgraph "Data Storage"
    I --> L[Collections: users, recipes, reviews]
    J --> M[Images Bucket]
end
```

---

## 7. React Component Architecture

```
graph TB
App[App Layout] --> Nav[Navbar]
App --> Pages

Nav --> AuthContext[Auth Context]
Pages --> Home[Homepage]
Pages --> Recipes[Recipes Pages]
Pages --> Auth[Auth Pages]

Recipes --> RecipeDetail[Recipe Detail Page]
Recipes --> RecipeNew[Create Recipe]
Recipes --> RecipeEdit[Edit Recipe]

RecipeDetail --> ReviewForm[Review Form]
RecipeDetail --> ReviewList[Review List]
RecipeDetail --> RecipeCard[Recipe Card]

Auth --> Login[Login Page]
Auth --> Signup[Signup Page]

Home --> RecipeCard
Home --> SearchFilter[Search Filter]
Home --> Navbar
```

---

## 8. API Documentation (Firebase Firestore)

### Collections & CRUD Operations

#### Users Collection (`/users/{uid}`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CREATE | `setDoc(db, 'users', uid)` | Create user profile |
| READ | `getDoc(db, 'users', uid)` | Read user profile |
| UPDATE | `updateDoc(db, 'users', uid)` | Update user profile |
| DELETE | `deleteDoc(db, 'users', uid)` | Delete user profile |

**Fields:**
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: timestamp;
}
```

#### Recipes Collection (`/recipes/{recipeId}`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CREATE | `addDoc(collection(db, 'recipes'))` | Create recipe |
| READ | `getDoc(db, 'recipes', recipeId)` | Read recipe |
| UPDATE | `updateDoc(db, 'recipes', recipeId)` | Update recipe |
| DELETE | `deleteDoc(db, 'recipes', recipeId)` | Delete recipe |
| LIST | `getDocs(query(collection(db, 'recipes')))` | List recipes |

**Fields:**
```typescript
{
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  ingredients: string[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  imageUrl?: string;
  favoritedBy: string[];
  favoritesCount: number;
  createdAt: timestamp;
}
```

#### Reviews Collection (`/review/{reviewId}`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| CREATE | `addDoc(collection(db, 'review'))` | Create review |
| READ | `getDocs(query(collection(db, 'review')))` | Read reviews |
| UPDATE | `updateDoc(db, 'review', reviewId)` | Update review |
| DELETE | `deleteDoc(db, 'review', reviewId)` | Delete review |

**Fields:**
```typescript
{
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: timestamp;
  updatedAt?: timestamp;
  likes?: number;
  likedBy?: string[];
}
```


## 9. Frontend Routes (Next.js App Router)

| Route | Component | Description | Auth |
|-------|-----------|-------------|------|
| `/` | `page.tsx` | Homepage with catalog | Public |
| `/login` | `login/page.tsx` | Login page | Public |
| `/signup` | `signup/page.tsx` | Registration page | Public |
| `/account` | `account/page.tsx` | User profile | Private |
| `/recipes/new` | `recipes/new/page.tsx` | Create recipe | Private |
| `/recipes/[id]` | `recipes/[id]/page.tsx` | Recipe details | Public |
| `/recipes/[id]/edit` | `recipes/[id]/edit/page.tsx` | Edit recipe | Private |

---

## 10. File Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── account/
│   │   ├── login/
│   │   ├── signup/
│   │   └── recipes/
│   │       ├── [id]/
│   │       ├── new/
│   │       └── edit/
│   ├── components/             # React components
│   │   ├── Navbar.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   └── Toast.tsx
│   ├── context/                # State management
│   │   └── AuthContext.tsx
│   ├── hooks/                  # Custom hooks
│   │   └── useFavorites.ts
│   ├── lib/                    # Utilities
│   │   └── firebase.ts
│   ├── types/                  # TypeScript interfaces
│   │   ├── recipe.ts
│   │   ├── review.ts
│   │   └── user.ts
│   └── __tests__/              # Tests
│
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts

backend/
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Database indexes
├── storage.rules               # Cloud Storage rules
└── .firebaserc                 # Firebase project config
```

---

## 11. Security & Validation

### Firestore Security Rules

```javascript
// Users: Public read, auth write own
match /users/{uid} {
  allow read: if true;
  allow create, update: if request.auth.uid == uid;
}

// Recipes: Public read, auth write
match /recipes/{recipeId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update: if request.auth.uid == resource.data.authorId;
  allow delete: if request.auth.uid == resource.data.authorId;
}

// Reviews: Public read, auth write own
match /review/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update: if request.auth.uid == resource.data.userId;
  allow delete: if request.auth.uid == resource.data.userId;
}
```

### Frontend Validation

- Email format validation
- Password strength (minimum 8 characters)
- Review text: minimum 5 characters
- Image upload: max 5MB
- Form required fields

---

## 12. Installation & Deployment

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Deploy backend rules
cd ../backend
firebase deploy --only firestore:rules,storage
```

### Production Deployment

**Frontend (Vercel):**
```bash
cd frontend
npm run build
# Push to GitHub, auto-deploy on Vercel
```

**Backend (Firebase):**
```bash
cd backend
firebase deploy
```

---

## 13. Performance & Optimizations

- Next.js Image optimization
- Code splitting with dynamic imports
- React Context for state management
- Firestore indexing for queries
- Cloud Storage CDN caching
- Lazy loading components
- TypeScript for type safety

---

## 14. Testing

### Unit Tests
- ReviewForm validation
- useFavorites hook
- Auth context

### Integration Tests
- Recipe CRUD operations
- Review system
- Favorites sync
- Authentication flow

**Run tests:**
```bash
cd frontend
npm test
```

---

## 15. Conclusions

Recipe Platform is a modern and complete web application built on the Next.js and Firebase architecture, with focus on:

- Scalability: Firebase serverless backend scales automatically
- Extensibility: Easy to add new features (e.g., payment integration)
- Security: Firestore rules and Firebase Auth
- UX/UI: Responsive design with Tailwind CSS
- Performance: Next.js and Firebase optimizations
- Developer Experience: TypeScript, modern tooling, clear architecture

The platform is production-ready and prepared for scaling to thousands of active users with real-time data synchronization.

---

**Last Updated**: January 14, 2026
**Status**: Deployed on Vercel
**Version**: 1.0.0
