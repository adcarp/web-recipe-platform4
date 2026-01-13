# 📂 Reorganized Project Structure

## Overview

Your Recipe Platform has been reorganized with **clear separation** between Frontend and Backend code.

---

## 🗂️ New Project Structure

```
recipe-platform/
│
├── 📁 frontend/                    ← ALL FRONTEND CODE
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   ├── components/             # React components
│   │   ├── context/                # Global state
│   │   ├── hooks/                  # Custom hooks
│   │   ├── types/                  # TypeScript interfaces
│   │   └── lib/                    # Utilities
│   ├── public/                     # Static assets
│   ├── package.json                # Frontend dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── next.config.ts              # Next.js config
│   ├── tailwind.config.ts          # Tailwind config
│   ├── postcss.config.mjs          # PostCSS config
│   ├── eslint.config.mjs           # ESLint config
│   ├── .env.local                  # Environment variables
│   └── README.md                   # Frontend guide
│
├── 📁 backend/                     ← ALL BACKEND CODE
│   ├── .firebaserc                 # Firebase project config
│   ├── firestore.rules             # Firestore security rules
│   ├── storage.rules               # Storage security rules
│   ├── firestore.indexes.json      # Composite indexes
│   └── README.md                   # Backend guide
│
├── 📚 DOCUMENTATION (Root Level)
│   ├── DATABASE_STRUCTURE.md       # Database schema
│   ├── ARCHITECTURE.md             # Architecture overview
│   ├── FRONTEND_BACKEND_GUIDE.md  # Quick reference
│   ├── VISUAL_DIAGRAMS.md         # Diagrams
│   ├── PROJECT_STRUCTURE.md       # File organization (updated)
│   ├── DOCUMENTATION_INDEX.md     # Documentation index
│   ├── DOCUMENTATION_SUMMARY.md   # Documentation summary
│   └── README.md                  # Project overview
│
└── 📦 ROOT CONFIG (Optional, for monorepo setup)
    ├── package.json               # Root workspace (optional)
    └── .gitignore                 # Git ignore patterns
```

---

## 🎨 Frontend Folder

**Location**: `frontend/`

**Purpose**: All Next.js/React application code

**Contains**:
- React components
- Next.js pages & routes
- TypeScript types
- Custom hooks
- Global state (Context)
- Firebase integration (SDK)
- Tailwind CSS styles
- Configuration files specific to Next.js

**Key Files**:
```
frontend/
├── src/app/*/page.tsx              ← Pages
├── src/components/*.tsx             ← Components
├── src/hooks/*.ts                  ← Custom hooks
├── src/context/AuthContext.tsx     ← Global state
├── src/lib/firebase.ts             ← Firebase config
├── package.json                    ← Dependencies (updated)
├── next.config.ts                  ← Next.js setup
└── README.md                       ← Frontend guide
```

**To Use**:
```bash
cd frontend
npm install
npm run dev
```

**Runs on**: http://localhost:3000

---

## 🔧 Backend Folder

**Location**: `backend/`

**Purpose**: Firebase cloud services configuration

**Contains**:
- Firestore security rules
- Cloud Storage security rules
- Composite indexes configuration
- Firebase project settings

**Key Files**:
```
backend/
├── .firebaserc                     ← Project config
├── firestore.rules                 ← Database rules
├── storage.rules                   ← Storage rules
├── firestore.indexes.json          ← Indexes
└── README.md                       ← Backend guide
```

**To Deploy**:
```bash
cd backend
firebase login
firebase deploy
```

**Note**: This is configuration only - no code to install

---

## 📚 Documentation (Root Level)

**Location**: `recipe-platform/` (root)

**Files**:
- `DATABASE_STRUCTURE.md` - Database schema & CRUD
- `ARCHITECTURE.md` - Architecture overview
- `FRONTEND_BACKEND_GUIDE.md` - Quick reference
- `VISUAL_DIAGRAMS.md` - Diagrams
- `PROJECT_STRUCTURE.md` - File organization
- `DOCUMENTATION_INDEX.md` - Documentation guide
- `DOCUMENTATION_SUMMARY.md` - What was created

**Why Root**: Documentation applies to both frontend and backend

---

## 🔄 Workflow

### Development Workflow

```
1. Start Frontend Dev Server
   cd frontend
   npm install (first time only)
   npm run dev
   → http://localhost:3000

2. Edit Code
   - Modify files in frontend/src/
   - Changes auto-reload

3. Test
   - Test features in browser
   - Check console for errors

4. Commit Changes
   cd .. (back to root)
   git add frontend/
   git commit -m "message"
```

### Deployment Workflow

```
1. Build Frontend
   cd frontend
   npm run build

2. Deploy Backend (Firebase)
   cd ../backend
   firebase deploy

3. Deploy Frontend
   cd ../frontend
   npm run build
   # Deploy to Vercel, Netlify, or Firebase Hosting
```

---

## 📦 Dependencies Management

### Frontend Dependencies
**File**: `frontend/package.json`

**Install**:
```bash
cd frontend
npm install
```

**Update**:
```bash
cd frontend
npm update package-name
```

### Backend Dependencies
**None** - Firebase is managed via console

---

## 🔗 Frontend ↔ Backend Communication

### Frontend Calls Backend Via:
```
frontend/src/lib/firebase.ts
  ↓
Firebase SDK
  ↓
Backend (Firebase Cloud)
  ├── Authentication
  ├── Firestore
  └── Storage
```

### Example Flow:
```
1. User clicks "Create Recipe" 
   → frontend/src/app/recipes/new/page.tsx

2. Form submission 
   → frontend/src/components/RecipeForm.tsx

3. Firebase SDK call 
   → frontend/src/lib/firebase.ts

4. Request sent to Backend 
   → backend (Firebase Cloud)

5. Backend validates rules 
   → backend/firestore.rules

6. Data saved 
   → Firestore

7. Success response 
   → Frontend shows toast

8. Redirect to recipe detail
```

---

## 📝 File Migration Guide

### What Moved to `frontend/`
```
src/                 → frontend/src/
public/              → frontend/public/
tsconfig.json        → frontend/tsconfig.json
next.config.ts       → frontend/next.config.ts
tailwind.config.ts   → frontend/tailwind.config.ts
postcss.config.mjs   → frontend/postcss.config.mjs
eslint.config.mjs    → frontend/eslint.config.mjs
package.json         → frontend/package.json (updated)
.env.local          → frontend/.env.local
```

### What Moved to `backend/`
```
(New) .firebaserc                ← Backend config
(New) firestore.rules            ← Database rules
(New) storage.rules              ← Storage rules
(New) firestore.indexes.json     ← Indexes
```

### What Stays at Root
```
Documentation files
.gitignore
README.md
```

---

## ✅ Next Steps

### 1. Copy Configuration Files to Frontend
```bash
# Copy from root to frontend (one-time)
cp tsconfig.json frontend/
cp next.config.ts frontend/
cp tailwind.config.ts frontend/
cp postcss.config.mjs frontend/
cp eslint.config.mjs frontend/
cp .env.local frontend/
```

### 2. Copy Public Assets to Frontend
```bash
# Copy from root to frontend
cp -r public/* frontend/public/
```

### 3. Update Git
```bash
# Remove old files from root
cd recipe-platform
git rm -r src/ public/ (if moving)
git add frontend/ backend/
git commit -m "Reorganize: separate frontend and backend folders"
```

### 4. Update imports in Frontend
If needed, update any absolute imports:
```typescript
// Before: import from '@/types/recipe'
// After: import from '@/types/recipe' (no change needed - same location)
```

### 5. Test Everything
```bash
# Test frontend
cd frontend
npm install
npm run dev

# Test backend (in Firebase console)
# Deploy rules when ready
cd ../backend
firebase deploy
```

---

## 📊 Benefits of This Structure

✅ **Clear Separation** - Frontend and backend are physically separated  
✅ **Easy Navigation** - Find code faster  
✅ **Scalability** - Easy to add more services  
✅ **Team Collaboration** - Frontend and backend teams work independently  
✅ **CI/CD Pipeline** - Can deploy frontend and backend separately  
✅ **Monorepo Friendly** - Easy to set up workspace in future  

---

## 🚀 Running Everything

### Start Development
```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev

# Terminal 2: Firebase Emulator (optional)
cd backend
firebase emulators:start
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend (Firebase)
cd ../backend
firebase deploy
```

---

## 📚 Quick Reference

| Task | Command | Location |
|------|---------|----------|
| Add page | Create in `frontend/src/app/` | Frontend |
| Add component | Create in `frontend/src/components/` | Frontend |
| Add hook | Create in `frontend/src/hooks/` | Frontend |
| Update security rules | Edit `backend/firestore.rules` | Backend |
| Deploy rules | `firebase deploy` in `backend/` | Backend |
| Install package | `npm install pkg` in `frontend/` | Frontend |
| Start dev server | `npm run dev` in `frontend/` | Frontend |

---

## 🔐 Environment Variables

### Frontend (.env.local)
**Location**: `frontend/.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (.firebaserc)
**Location**: `backend/.firebaserc`

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## 📞 Documentation Quick Links

**Frontend Developers**: Read `frontend/README.md`  
**Backend Developers**: Read `backend/README.md`  
**Architects**: Read `ARCHITECTURE.md` and `DATABASE_STRUCTURE.md`  
**Everyone**: Read `DOCUMENTATION_INDEX.md` to get oriented  

---

## ✨ Summary

Your project is now organized as:
```
recipe-platform/
├── frontend/      (All React/Next.js code)
├── backend/       (All Firebase config)
└── docs/          (Documentation)
```

This makes it **easy to**:
- Find code
- Manage dependencies separately
- Deploy independently
- Collaborate with teams
- Scale the project

**Ready to start development!** 🚀

---

**Last Updated**: January 13, 2026  
**Status**: ✅ Structure Complete
