# KELNIX AI / ReelCraft

## What This Is
AI-powered video content creation platform. Users describe an idea, AI generates scripts/scenes/captions, then publishes to Facebook/Instagram. Built with React + Vite frontend and Express backend, deployed on Vercel.

## Tech Stack
- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS, Lucide icons
- **Backend:** Express (local dev), Vercel Serverless Functions (production)
- **AI:** Gemini API (primary) + OpenRouter fallback (openai/gpt-oss-20b:free)
- **Auth:** Supabase (JWT + OAuth Google)
- **Storage:** Supabase PostgreSQL + localStorage fallback
- **Media:** Cloudinary (signed uploads + destroy)
- **Publishing:** Facebook Graph API v21.0 (video_reels endpoint)

## Environment Variables (in .env — NOT committed)
```
GEMINI_API_KEY=...          # Primary AI model
OPENCODE_API_KEY=...        # Fallback AI via OpenRouter
OPENCODE_BASE_URL=https://openrouter.ai/api/v1
OPENCODE_MODEL=openai/gpt-oss-20b:free
SUPABASE_URL=...            # Database + auth
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...       # Frontend Supabase client
VITE_SUPABASE_ANON_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## What Was Done (Session 2026-08-20)
1. **Implemented real Facebook Graph API publishing** — `api/facebook/publish-reel.ts` and `server.ts` now use actual `video_reels` endpoint (start → finish upload flow). No more mock post IDs.
2. **Fixed hardcoded userId** — `CreateContent.tsx` now uses `useAuth()` from Supabase context instead of `'user-123'`.
3. **Removed debug endpoint** — `api/debug-env.ts` deleted.
4. **Removed dead code** — `api/cloudinary.ts` (unused top-level file) deleted. Working `api/cloudinary/sign-upload.ts` and `api/cloudinary/destroy.ts` remain.
5. **Fixed stray text** — `Editor.tsx:684` had a stray `fix` that broke TypeScript compilation.
6. **Verified** — TypeScript compiles clean, production build passes.

## What's Left (3 Tasks Remaining)

### Task 2: Dashboard Redesign — Full-Screen App Shell
Current `Dashboard.tsx` is a basic card layout. Needs redesign to a full-screen app shell (sidebar + content area) that feels like a real desktop app. Key areas:
- Left sidebar: navigation (Dashboard, Create Content, Editor, Settings)
- Main content: greeting, stats, recent projects, quick actions
- Top bar: search, notifications, user profile
- Full viewport height, no scroll bleed, smooth transitions

### Task 3: Firebase Google Sign-In
Current auth uses Supabase OAuth for Google sign-in. Needs Firebase Google sign-in integration:
- Add Firebase config to `.env` (VITE_FIREBASE_*, FIREBASE_*)
- Create Firebase config/service initialization
- Add Firebase Google sign-in button alongside Supabase
- Handle Firebase token → Supabase session bridge (or use Firebase standalone)
- Update AuthContext to support both auth methods

### Post-Implementation
- Run `npm run lint` and `npm run build` to verify
- Test all three changes work together
- Update PROJECT-PLAN.md checkboxes

## Key Files
- `server.ts` — Express server with all API routes (1010 lines)
- `api/_lib/ai.ts` — Gemini client + OpenRouter fallback
- `api/_lib/auth.ts` — Supabase JWT verification with fallback
- `api/facebook/publish-reel.ts` — Real Facebook Graph API
- `src/pages/Dashboard.tsx` — Current dashboard (needs redesign)
- `src/pages/CreateContent.tsx` — AI content creation UI
- `src/contexts/AuthContext.tsx` — Auth provider (Supabase)
- `src/services/api/apiClient.ts` — Frontend HTTP client
- `AGENT-BRIEF.md` — Original task brief
- `PROJECT-PLAN.md` — Phased plan with checkboxes
