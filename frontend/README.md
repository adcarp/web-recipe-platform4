# 🎨 Frontend - Recipe Platform

## Overview
This folder contains all **frontend code** for the Recipe Platform - a Next.js 13+ React application.

## 📁 Structure

```
frontend/
├── src/
│   ├── app/              # Next.js pages (routes)
│   ├── components/       # Reusable React components
│   ├── context/          # Global state management
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript interfaces
│   └── lib/              # Utilities (Firebase config, etc.)
├── public/               # Static assets
├── package.json          # Frontend dependencies
├── tsconfig.json         # TypeScript config
├── next.config.ts        # Next.js config
├── tailwind.config.ts    # Tailwind CSS config
├── postcss.config.mjs    # PostCSS config
├── eslint.config.mjs     # ESLint config
└── .env.local            # Environment variables (not in repo)
```

## 🚀 Getting Started

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```
Opens http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## 📦 Key Dependencies

- **Next.js 16** - React framework with SSR
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Firebase SDK** - Backend services integration

## 📁 Detailed Directory Structure

### /src/app - Pages & Routes
```
app/
├── layout.tsx           # Root layout (Navbar, providers)
├── page.tsx             # Home page (/)
├── globals.css          # Global styles
├── login/page.tsx       # Login page
├── signup/page.tsx      # Signup page
├── account/page.tsx     # User account dashboard
└── recipes/
    ├── new/page.tsx     # Create recipe
    └── [id]/
        ├── page.tsx     # Recipe detail
        └── edit/page.tsx # Edit recipe
```

### /src/components - Reusable Components
```
components/
├── Navbar.tsx           # Navigation bar
├── RecipeCard.tsx       # Recipe card display
├── RecipeForm.tsx       # Recipe form (create/edit)
└── Toast.tsx            # Notification component
```

### /src/context - Global State
```
context/
└── AuthContext.tsx      # Authentication state & user info
```

### /src/hooks - Custom Hooks
```
hooks/
├── useFavorites.ts      # Favorite recipes management
└── useToast.ts          # Notification system
```

### /src/types - TypeScript Interfaces
```
types/
├── recipe.ts            # Recipe interface
└── user.ts              # User interface
```

### /src/lib - Utilities
```
lib/
└── firebase.ts          # Firebase SDK initialization
```

## 🔧 Configuration Files

- **tsconfig.json** - TypeScript compiler options
- **next.config.ts** - Next.js framework settings
- **tailwind.config.ts** - Tailwind CSS theme
- **postcss.config.mjs** - CSS processing
- **eslint.config.mjs** - Code quality rules
- **.env.local** - Environment variables (not in repo)

## 🔗 Backend Integration

Frontend communicates with Firebase backend via:
- **Firebase Authentication** - User auth
- **Firestore Database** - Data storage
- **Cloud Storage** - Image uploads

See `../backend/README.md` for backend setup.

## 📚 Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture overview
- [FRONTEND_BACKEND_GUIDE.md](../FRONTEND_BACKEND_GUIDE.md) - Frontend guide
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - File organization

## 🎯 Main Features

✅ Recipe browsing and discovery  
✅ User authentication (signup/login)  
✅ Recipe creation and editing  
✅ Recipe favorites management  
✅ Recipe sharing  
✅ User profile management  
✅ Toast notifications  
✅ Dark mode support  
✅ Responsive design  

## 🔐 Environment Variables

Create `.env.local` with Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablet, desktop)
- Dark mode support

## 🐛 Debugging

### Common Issues
- **Firebase not connecting**: Check `.env.local` variables
- **Styles not loading**: Run `npm run build` and restart
- **Module not found**: Run `npm install` in frontend folder

### Tools
- Chrome DevTools (F12)
- React DevTools browser extension
- VS Code Debugger

## 📞 Support

For questions or issues:
1. Check [FRONTEND_BACKEND_GUIDE.md](../FRONTEND_BACKEND_GUIDE.md)
2. Review [ARCHITECTURE.md](../ARCHITECTURE.md)
3. Check Firebase documentation

---

**Last Updated**: January 13, 2026  
**Status**: ✅ Complete & Ready
