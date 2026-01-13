# 🔄 File Migration Steps

## Quick Summary

Your project has been restructured into:
- `frontend/` - All Next.js/React code
- `backend/` - All Firebase configuration

## ⚠️ IMPORTANT: Manual Steps Required

The directory structure has been created, but you need to **manually move your existing files** since the editor cannot directly move files. Here's how:

---

## 📋 Step-by-Step Migration

### Step 1: Move Frontend Code to `frontend/src/`

**What to move from root `/src/` to `frontend/src/`:**

```bash
# From Windows File Explorer or Command Line

# Copy the entire src folder
FROM:   src/
TO:     frontend/src/

# Include all subfolders:
# - app/
# - components/
# - context/
# - hooks/
# - types/
# - lib/
```

**Or using terminal** (Windows PowerShell):
```powershell
# Move src folder
Move-Item -Path "src" -Destination "frontend/src" -Force

# Or copy then delete
Copy-Item -Path "src" -Destination "frontend/src" -Recurse -Force
Remove-Item -Path "src" -Recurse -Force
```

---

### Step 2: Move Public Assets to `frontend/public/`

**What to move from root `/public/` to `frontend/public/`:**

```bash
FROM:   public/
TO:     frontend/public/
```

**Terminal**:
```powershell
Move-Item -Path "public" -Destination "frontend/public" -Force
```

---

### Step 3: Copy Configuration Files to `frontend/`

**Copy these files from root to `frontend/`:**

```
tsconfig.json          →  frontend/tsconfig.json
next.config.ts         →  frontend/next.config.ts
tailwind.config.ts     →  frontend/tailwind.config.ts
postcss.config.mjs     →  frontend/postcss.config.mjs
eslint.config.mjs      →  frontend/eslint.config.mjs
.env.local (if exists) →  frontend/.env.local
```

**Terminal**:
```powershell
# Copy each file
Copy-Item -Path "tsconfig.json" -Destination "frontend/tsconfig.json"
Copy-Item -Path "next.config.ts" -Destination "frontend/next.config.ts"
Copy-Item -Path "tailwind.config.ts" -Destination "frontend/tailwind.config.ts"
Copy-Item -Path "postcss.config.mjs" -Destination "frontend/postcss.config.mjs"
Copy-Item -Path "eslint.config.mjs" -Destination "frontend/eslint.config.mjs"
```

---

### Step 4: Verify Frontend Structure

After migration, `frontend/` should contain:

```
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── types/
│   └── lib/
├── public/
├── package.json         ← Already created
├── tsconfig.json        ← Should be here now
├── next.config.ts       ← Should be here now
├── tailwind.config.ts   ← Should be here now
├── postcss.config.mjs   ← Should be here now
├── eslint.config.mjs    ← Should be here now
├── .env.local          ← Should be here now (if exists)
└── README.md           ← Already created
```

---

### Step 5: Verify Backend Structure

Backend folder should already have these files:

```
backend/
├── .firebaserc                 ✓ Created
├── firestore.rules             ✓ Created
├── storage.rules               ✓ Created
├── firestore.indexes.json      ✓ Created
└── README.md                   ✓ Created
```

---

### Step 6: Update Your Root `.gitignore`

**Replace root `.gitignore` content with**:

```
# Root level ignores
node_modules/
.env
.env.local

# Frontend (if keeping node_modules at root)
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/*.log
frontend/.DS_Store

# Backend
backend/.firebase/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

### Step 7: Reinstall Dependencies

```bash
# Frontend
cd frontend
npm install
npm run build

# Verify it works
npm run dev
```

---

### Step 8: Update Root Files (Optional)

If you still want a root `package.json` for development, update it to:

```json
{
  "name": "recipe-platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd frontend && npm start",
    "lint": "cd frontend && npm run lint",
    "deploy:backend": "cd backend && firebase deploy",
    "deploy:frontend": "cd frontend && npm run build"
  },
  "description": "Recipe sharing platform with Next.js and Firebase"
}
```

---

## ✅ Verification Checklist

After migration, verify:

- [ ] `frontend/src/` contains all your React code
- [ ] `frontend/public/` contains all static assets
- [ ] `frontend/` contains all config files
- [ ] `frontend/package.json` exists
- [ ] `backend/` contains Firebase config files
- [ ] Root `.gitignore` is updated
- [ ] Documentation files stay at root

---

## 🚀 Test Everything Works

### Test Frontend
```bash
cd frontend
npm install
npm run dev
```
→ Should start on http://localhost:3000

### Test Build
```bash
cd frontend
npm run build
```
→ Should complete without errors

### Test Backend Rules (Optional)
```bash
cd backend
firebase emulators:start
```
→ Should start Firestore emulator

---

## 📝 Git Commands

After migration, use these git commands:

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "chore: reorganize project structure into frontend and backend folders"

# Push
git push
```

---

## 🔧 Troubleshooting

### "Cannot find module" errors
**Solution**: Make sure:
- `src/` is now in `frontend/src/`
- All imports still work (they should - same relative paths)
- `tsconfig.json` is in `frontend/`

### "npm ERR! ENOENT" 
**Solution**: Make sure you're in the right folder:
```bash
cd frontend  # Always cd here before npm commands
npm install
```

### Module not found "@/..."
**Solution**: Check that:
- `tsconfig.json` in `frontend/` has correct path aliases
- Files exist at the expected path

### Port 3000 already in use
**Solution**: Either:
```bash
# Stop the existing process
# Or use a different port
npm run dev -- -p 3001
```

---

## 📞 Need Help?

**Read these files**:
1. `frontend/README.md` - Frontend setup guide
2. `backend/README.md` - Backend setup guide
3. `STRUCTURE_REORGANIZATION.md` - This guide
4. `DOCUMENTATION_INDEX.md` - Documentation guide

---

## 📊 Before vs After

### Before Migration
```
recipe-platform/
├── src/                    ← Frontend code mixed
├── public/                 ← Assets mixed
├── tsconfig.json          ← At root
├── package.json           ← At root
├── Documentation files
└── Firebase files mixed
```

### After Migration
```
recipe-platform/
├── frontend/
│   ├── src/               ← Frontend code
│   ├── public/            ← Assets
│   ├── tsconfig.json      ← Frontend config
│   ├── package.json       ← Frontend dependencies
│   └── README.md
├── backend/
│   ├── firestore.rules    ← Backend config
│   ├── storage.rules
│   └── README.md
├── Documentation files    ← At root
└── .gitignore
```

---

## ✨ What You Get

✅ **Clear separation** between frontend and backend  
✅ **Easier navigation** - Find files faster  
✅ **Independent scaling** - Add services separately  
✅ **Team collaboration** - Teams work independently  
✅ **Deployment flexibility** - Deploy separately  

---

## 🎯 Quick Start After Migration

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

**Status**: Structure ready, waiting for file migration  
**Time to Complete**: ~5 minutes  
**Difficulty**: Easy (just copy/move files)

Ready to migrate? Follow the steps above! 🚀
