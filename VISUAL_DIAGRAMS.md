# Visual Architecture Diagrams

## 1. Application Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                     │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    NEXT.JS APPLICATION                            │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Pages Layer  │  │  Components  │  │  State Management        │ │ │
│  │  │              │  │              │  │  (Context + Hooks)       │ │ │
│  │  │ ├─ home      │  │ ├─ Navbar    │  │                          │ │ │
│  │  │ ├─ login     │  │ ├─ RecipeCard│  │ ├─ AuthContext          │ │ │
│  │  │ ├─ signup    │  │ ├─ RecipeForm│  │ ├─ useFavorites Hook    │ │ │
│  │  │ ├─ account   │  │ └─ Toast     │  │ └─ useToast Hook        │ │ │
│  │  │ └─ recipes   │  │              │  │                          │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │ │
│  │         ↑                  ↑                      ↑                 │ │
│  │         └──────────────────┴──────────────────────┘                 │ │
│  │                         │                                           │ │
│  │                         ↓                                           │ │
│  │          ┌──────────────────────────────────┐                      │ │
│  │          │  Form Validation & Error Handling │                      │ │
│  │          └──────────────────┬───────────────┘                      │ │
│  │                             │                                      │ │
│  │                             ↓                                      │ │
│  │          ┌──────────────────────────────────┐                      │ │
│  │          │   Firebase JavaScript SDK         │                      │ │
│  │          │ ├─ Auth                           │                      │ │
│  │          │ ├─ Firestore                      │                      │ │
│  │          │ └─ Storage                        │                      │ │
│  │          └──────────────────┬───────────────┘                      │ │
│  └─────────────────────────────┼────────────────────────────────────┘ │
│                                │                                        │
│                    ╔═══════════╩═══════════╗                           │
│                    ║   HTTPS Connection   ║                           │
│                    ║  (Secure Internet)   ║                           │
│                    ╚═══════════╤═══════════╝                           │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
                    ┌─────────────────────────┐
                    │    FIREWALL / HTTPS     │
                    └─────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────────────┐
│              GOOGLE FIREBASE CLOUD BACKEND                            │
├─────────────────────────────────┼────────────────────────────────────┤
│                                │                                      │
│                    ┌───────────────────────┐                         │
│                    │ Authentication Service │                         │
│                    │ ├─ Credential Verify   │                         │
│                    │ ├─ Password Hash       │                         │
│                    │ ├─ Session Management  │                         │
│                    │ └─ Token Generation    │                         │
│                    └───────────┬────────────┘                         │
│                                │                                      │
│                    ┌───────────────────────┐                         │
│                    │  Firestore Database   │                         │
│                    │ ├─ /users {uid}       │                         │
│                    │ ├─ /recipes {id}      │                         │
│                    │ ├─ Query Engine       │                         │
│                    │ └─ Transaction Handler│                         │
│                    └───────────┬────────────┘                         │
│                                │                                      │
│                    ┌───────────────────────┐                         │
│                    │ Cloud Storage         │                         │
│                    │ ├─ /users/{uid}/      │                         │
│                    │ ├─ /recipes/{id}/     │                         │
│                    │ └─ File Handler       │                         │
│                    └───────────┬────────────┘                         │
│                                │                                      │
│                    ┌───────────────────────┐                         │
│                    │  Security Rules Engine│                         │
│                    │ ├─ Auth Validation    │                         │
│                    │ ├─ Rule Checking      │                         │
│                    │ └─ Data Validation    │                         │
│                    └───────────────────────┘                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy Tree

```
App Root
│
├── Navbar Component
│   ├── Logo
│   ├── Navigation Links
│   └── User Menu
│       ├── Profile Link
│       ├── Account Link
│       └── Logout Button
│
├── Layout Provider
│   └── Toast Provider
│
└── Page Routes
    │
    ├── HOME PAGE (/)
    │   └── Recipe List
    │       └── RecipeCard × N
    │           ├── Image
    │           ├── Title/Description
    │           ├── Tags
    │           ├── Favorite Button
    │           ├── Share Button
    │           └── View Details Link
    │
    ├── LOGIN PAGE (/login)
    │   └── LoginForm
    │       ├── Email Input
    │       ├── Password Input
    │       └── Login Button
    │
    ├── SIGNUP PAGE (/signup)
    │   └── SignupForm
    │       ├── Display Name Input
    │       ├── Email Input
    │       ├── Password Input
    │       ├── Confirm Password Input
    │       └── Signup Button
    │
    ├── ACCOUNT PAGE (/account)
    │   └── Tabs
    │       ├── Profile Tab
    │       │   ├── Profile Picture Upload
    │       │   ├── Display Name Input
    │       │   ├── Email Display
    │       │   ├── Bio Textarea
    │       │   └── Save Button
    │       │
    │       ├── My Recipes Tab
    │       │   └── Recipe List
    │       │       └── RecipeCard (Author's Recipes)
    │       │           ├── Edit Button
    │       │           └── Delete Button
    │       │
    │       ├── Favorites Tab
    │       │   └── Recipe List
    │       │       └── RecipeCard (Favorites Only)
    │       │           └── Remove Button
    │       │
    │       └── Dashboard Tab
    │           ├── Statistics
    │           │   ├── Total Recipes
    │           │   ├── Total Favorites
    │           │   └── Total Shares
    │           └── Charts/Graphs
    │
    ├── CREATE RECIPE PAGE (/recipes/new)
    │   └── RecipeForm
    │       ├── Title Input
    │       ├── Description Textarea
    │       ├── Image Upload
    │       ├── Category Dropdown
    │       ├── Difficulty Dropdown
    │       ├── Prep Time Input
    │       ├── Cook Time Input
    │       ├── Ingredients Section
    │       │   └── Add/Remove Ingredient Fields
    │       ├── Steps Section
    │       │   └── Add/Remove Step Fields
    │       ├── Tags Section
    │       │   └── Add/Remove Tag Fields
    │       └── Create Button
    │
    ├── RECIPE DETAIL PAGE (/recipes/[id])
    │   ├── Recipe Header
    │   │   ├── Image
    │   │   ├── Title
    │   │   └── Author Info
    │   ├── Recipe Info
    │   │   ├── Difficulty
    │   │   ├── Prep Time
    │   │   ├── Cook Time
    │   │   └── Category
    │   ├── Ingredients Section
    │   │   ├── Servings Input
    │   │   └── Ingredient List (Scaled)
    │   ├── Steps Section
    │   │   └── Step List
    │   ├── Action Buttons
    │   │   ├── Favorite Button
    │   │   ├── Share Button
    │   │   ├── Edit Button (If Author)
    │   │   └── Delete Button (If Author)
    │   └── Share Modal
    │       ├── Twitter Share
    │       ├── Facebook Share
    │       ├── LinkedIn Share
    │       ├── Email Share
    │       └── Copy Link Button
    │
    └── EDIT RECIPE PAGE (/recipes/[id]/edit)
        └── RecipeForm (Same as Create, Pre-filled with Data)
            └── Update Button
```

---

## 3. Data Flow Diagram - Recipe Creation

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                                     │
│ User visits /recipes/new                                             │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - PAGE LOAD                                                 │
│ Next.js loads RecipeForm component                                   │
│ Initialize form state (empty)                                        │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - USER INPUT                                                │
│ User fills:                                                          │
│ ├─ Title: "Pasta Carbonara"                                          │
│ ├─ Description: "Classic Italian..."                                 │
│ ├─ Selects image from device                                         │
│ ├─ Adds ingredients & steps                                          │
│ └─ Selects category & difficulty                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - FORM VALIDATION                                           │
│ Check:                                                               │
│ ├─ Title not empty → PASS                                            │
│ ├─ Title length 3-100 → PASS                                         │
│ ├─ Description 10-1000 chars → PASS                                  │
│ ├─ Image < 5MB → PASS                                                │
│ ├─ Image format (JPEG/PNG/WebP) → PASS                               │
│ ├─ At least 1 ingredient → PASS                                      │
│ └─ At least 1 step → PASS                                            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - SUBMIT                                                    │
│ Call: handleSubmit(e)                                                │
│ Disable submit button (loading state)                                │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - IMAGE UPLOAD (Firebase Storage)                           │
│ Call: uploadBytes(ref(storage, 'recipes/...'), imageFile)            │
│ Send image data via HTTPS                                            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ↓                             ↓
   [INTERNET]               ┌──────────────────────┐
   [HTTPS]          ┌──────→│ Firebase Storage     │
   [SECURE]         │       │                      │
                    │       │ 1. Receive file      │
                    │       │ 2. Validate MIME     │
                    │       │ 3. Store in bucket   │
                    │       │ 4. Generate URL      │
                    │       └──────┬───────────────┘
                    │              │
                    │  imageUrl ←──┘
                    │  gs://bucket/recipes/
                    │  abc123/image.jpg
                    │
                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - PREPARE RECIPE DATA                                       │
│ Create object:                                                       │
│ {                                                                    │
│   title: "Pasta Carbonara",                                          │
│   description: "...",                                                │
│   ingredients: [...],                                                │
│   steps: [...],                                                      │
│   imageUrl: "gs://bucket/...",  ← From storage                       │
│   category: "Dinner",                                                │
│   difficulty: "Medium",                                              │
│   prepTime: 15,                                                      │
│   cookTime: 20,                                                      │
│   tags: ["pasta", "italian"],                                        │
│   authorId: "user123",          ← From auth context                  │
│   createdAt: Timestamp.now(),                                        │
│ }                                                                    │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - CREATE FIRESTORE DOCUMENT                                 │
│ Call: addDoc(collection(db, 'recipes'), recipeData)                  │
│ Send JSON over HTTPS with Auth token                                 │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ↓                             ↓
   [INTERNET]                ┌──────────────────────┐
   [HTTPS]          ┌───────→│ Firebase Firestore   │
   [AUTH TOKEN]     │        │                      │
                    │        │ 1. Verify auth token │
                    │        │ 2. Check rules:      │
                    │        │    - User logged in? │
                    │        │    - Can create?     │
                    │        │ 3. Validate data:    │
                    │        │    - Required fields?│
                    │        │    - Types correct?  │
                    │        │ 4. Create document   │
                    │        │ 5. Auto-generate ID  │
                    │        │ 6. Index data        │
                    │        └──────┬───────────────┘
                    │               │
                    │  Success response
                    │  {id: "recipe_xyz"}
                    │
                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - HANDLE SUCCESS                                            │
│ 1. Re-enable submit button                                           │
│ 2. Show toast: "Recipe created successfully!"                        │
│ 3. Clear form data                                                   │
│ 4. Redirect to /recipes/recipe_xyz                                   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│ RECIPE DETAIL PAGE                                                   │
│ Display the newly created recipe with all details                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    React Component Tree                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              AuthContext (Global State)                  │ │
│  │  ├─ currentUser: { uid, email, displayName, ... }        │ │
│  │  ├─ isLoading: boolean                                   │ │
│  │  ├─ logout(): void                                       │ │
│  │  └─ useAuth() hook                                       │ │
│  └──────┬───────────────────────────────────────────────────┘ │
│         │                                                     │
│         │ Provided to all child components                   │
│         │                                                     │
│    ┌────┴─────────────────────────────────────┐             │
│    │                                          │             │
│    ↓                                          ↓             │
│ ┌─────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│ │ Navbar  │  │ Account Page │  │ Recipe Detail Page   │   │
│ │         │  │              │  │                      │   │
│ │ useAuth │  │ useAuth()    │  │ useAuth()            │   │
│ │ ├─ user │  │ ├─ user      │  │ ├─ user              │   │
│ │ └─ logout│  │ ├─ recipes[] │  │ ├─ recipe data       │   │
│ └─────────┘  │ ├─ favorites[]│  │ ├─ isFavorited       │   │
│              │ └─ stats      │  │ └─ useFavorites()   │   │
│              └──────────────┘  └──────────────────────┘   │
│                                                             │
│  Local State Examples:                                     │
│  ├─ useState(formData)                                     │
│  ├─ useState(isLoading)                                    │
│  ├─ useState(error)                                        │
│  └─ useState(toasts[])                                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema Relationships

```
┌──────────────────────┐         ┌──────────────────────┐
│    /users/{uid}      │         │   /recipes/{id}      │
├──────────────────────┤         ├──────────────────────┤
│ uid ──────────┐      │         │ id                   │
│ displayName   │      │         │ title                │
│ email         │      │         │ description          │
│ photoURL      │      │         │ ingredients[]        │
│ bio           │      │         │ steps[]              │
│ createdAt     │      │         │ imageUrl             │
│ updatedAt     │      │         │ category             │
│ totalRecipes  │      │         │ difficulty           │
│ totalFavorites        │         │ prepTime             │
│ isVerified    │      │         │ cookTime             │
│               │      │         │ tags[]               │
└───────────────┼──────┘         │ authorId ────────┐   │
                │                 │ createdAt        │   │
                │ 1:N             │ updatedAt        │   │
                └─ (creates)      │ favoritesCount   │   │
                                  │ sharesCount      │   │
                                  │ favoritedBy[] ───┼──┐│
                                  │                  │  ││
                                  └──────────────────┼──┘│
                                                     │   │
                                           M:M Relationship
                                           (User ↔ Recipe)
```

---

## 6. Request/Response Example

### Request (Frontend → Backend)
```
POST /api/createUser HTTP/1.1
Host: firestore.googleapis.com
Authorization: Bearer eyJhbGc...token...
Content-Type: application/json
Content-Length: 245

{
  "database": "projects/recipe-app/databases/(default)",
  "writes": [{
    "update": {
      "name": "projects/recipe-app/databases/(default)/documents/users/abc123",
      "fields": {
        "uid": {"stringValue": "abc123"},
        "displayName": {"stringValue": "John Doe"},
        "email": {"stringValue": "john@example.com"},
        "createdAt": {"timestampValue": "2026-01-13T10:00:00Z"}
      }
    }
  }]
}
```

### Response (Backend → Frontend)
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 350

{
  "writeResults": [{
    "updateTime": "2026-01-13T10:00:00.123456Z"
  }],
  "commitTime": "2026-01-13T10:00:00.123456Z"
}
```

Frontend receives success → Updates state → Shows confirmation

---

## 7. Error Handling Flow

```
User Action
    ↓
Frontend Validation
├─ If invalid → Show error toast → Stop
└─ If valid → Continue
    ↓
Send to Firebase
    ↓
Firebase Receives Request
    ├─ Check Authentication
    │  ├─ If not auth → Return 401
    │  └─ If auth → Continue
    ├─ Check Firestore Rules
    │  ├─ If denied → Return 403
    │  └─ If allowed → Continue
    └─ Save to Database
       ├─ If error → Return 500
       └─ If success → Return 200
    ↓
Frontend Receives Response
├─ If error → Show error toast + log
└─ If success → Show success toast + update UI
```
