# kelnix-AI / ReelCraft — Agent Brief

Paste this whole file (or one task at a time) into a coding agent that has
write access to the `Jonathan97k/kelnix-AI` repo — Claude Code, Cursor,
Windsurf, etc. It's split into 3 independent tasks. Do them in order:
AI first (nothing else matters if the backend is broken), then the
full-screen redesign, then Google login.

---

## TASK 1 — Diagnose and fix why the AI features aren't working

```
You are working in the kelnix-AI / ReelCraft repo (Vite + React frontend,
serverless API on Vercel, Gemini as the primary AI provider with an
OpenRouter fallback).

Do the following, in order, and report back what you find at each step
before moving to the next:

1. Check whether an /api directory with individual serverless function
   files exists at the repo root (one file per route: generate-script.ts,
   analyze-photos.ts, tts.ts, research.ts, chat-command.ts, health.ts,
   facebook/publish-reel.ts). If it does NOT exist, that is the bug: the
   old vercel.json rewrites every request (including /api/*) to
   index.html, so the frontend gets HTML back instead of JSON. Create the
   /api functions by extracting each app.post/app.get handler out of
   server.ts into its own file, using @vercel/node types
   (import type { VercelRequest, VercelResponse } from "@vercel/node").
   Put shared logic (getAI, zenJSON, cannedReelScript, the research
   helpers) into api/_lib/ so it isn't duplicated across files.

2. Check vercel.json. It must NOT rewrite /api/* paths to index.html.
   The rewrite source should be "/((?!api/).*)" so only non-API routes
   fall through to the SPA.

3. Confirm the GEMINI_API_KEY environment variable is referenced
   correctly in code (process.env.GEMINI_API_KEY) and print out (in your
   report, not in code) whether it appears to be set in any committed
   .env file (it should NOT be committed — only in .env.example as a
   placeholder, and set for real in Vercel's dashboard).

4. Open the browser dev tools Network tab equivalent: trace what the
   frontend actually calls when the user sends a chat command (search the
   codebase for the fetch/axios call to "/api/chat-command" or similar).
   Confirm the request URL, method, and body shape match exactly what the
   corresponding /api function expects.

5. Add basic error surfacing: if a fetch to any /api/* route fails or
   returns non-JSON, show the user a readable message ("Something went
   wrong generating that — try again") instead of leaking a raw
   "Unexpected end of JSON input" style error into the chat UI.

6. After fixing, tell me exactly which environment variables I need to
   add in the Vercel dashboard (Project -> Settings -> Environment
   Variables) for this to work in production, and give me the exact curl
   command to test /api/health and /api/chat-command once deployed.

Do not remove server.ts/electron-main.cjs — those are needed if this app
is ever run as a desktop Electron app or self-hosted on a plain Node
server instead of Vercel. Just make sure the Vercel deployment path
works independently of them.
```

**Before you run this**, double check in the Vercel dashboard that
`GEMINI_API_KEY` is actually set for the Production environment — a
huge share of "AI isn't working" bugs are just a missing/typo'd env var,
not a code bug. Settings → Environment Variables → make sure it's applied
to Production, not just Preview/Development.

---

## TASK 2 — Redesign the dashboard to be full-screen

Right now the "AI Command Chat" is a small floating panel with a fixed
width/height that the user has to scroll and drag around — it feels like
a widget bolted onto a page rather than the app itself.

```
You are working in the kelnix-AI / ReelCraft repo. Redesign the main
dashboard so it is a true full-screen application shell, not a floating
panel.

Design direction:
- The dashboard should fill the entire viewport (100vw x 100dvh), with no
  outer page chrome around it and no fixed-pixel-width floating card.
- Build a proper app shell: a slim top bar (product name/logo, current
  project title, user avatar/account menu) and a main content area that
  uses the full remaining height. If there's a sidebar (project list,
  navigation), it should be a real flex/grid column, not an overlay.
- The AI Command Chat should be a full-height panel (e.g. a right-hand
  column or bottom-docked panel that resizes with the window), not a
  small modal-like box with its own internal scroll fighting the page
  scroll.
- Everything must be responsive: on narrower viewports, collapse the
  chat/sidebar into a slide-over rather than shrinking to something
  unusable.
- Avoid generic AI-tool-template look (dark near-black background +
  single bright accent + rounded card floating in empty space is the
  current look, and it's what to move away from). Pick a real palette and
  layout system that fits a video/reel editing tool: think timeline
  editors and creative tools (e.g. CapCut, Premiere) for layout
  inspiration — dense, purposeful use of space, clear visual hierarchy
  between the photo/reel canvas, the settings panel, and the command
  chat — rather than one centered floating box on a blank canvas.
- Use CSS Grid or Flexbox with height: 100dvh on the root app container;
  no component should rely on the user scrolling the whole page to see
  controls that should always be visible (send button, main actions).
- Preserve all existing functionality (theme/tone pickers, aspect ratio,
  captions, chat command bar) — this is a layout and visual redesign, not
  a feature change.
- Keep keyboard focus states visible and respect prefers-reduced-motion.

Before writing code: propose a short design plan (color palette as
4-6 hex values, type pairing, and an ASCII wireframe of the full-screen
layout) and show it to me before implementing, so I can confirm the
direction.
```

---

## TASK 3 — Add "Sign in with Google"

Given this is a Vite + React SPA with a Vercel serverless backend (no
existing session/auth system), the fastest reliable path is **Firebase
Authentication** — it's free at this scale, handles the Google OAuth flow
for you, and works cleanly with Vercel serverless functions for verifying
the logged-in user server-side.

```
You are working in the kelnix-AI / ReelCraft repo. Add "Sign in with
Google" using Firebase Authentication.

1. Add firebase as a dependency (client SDK only — no need for the full
   Firebase backend, just Auth). Create a firebase config file (e.g.
   src/lib/firebase.ts) that reads config from environment variables
   (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
   VITE_FIREBASE_PROJECT_ID, etc. — Vite exposes anything prefixed
   VITE_ to the client, which is fine since Firebase client config is
   not a secret).

2. Implement Google sign-in with signInWithPopup(auth,
   new GoogleAuthProvider()). Show a "Sign in with Google" button on a
   simple auth screen that appears before the dashboard if the user
   isn't logged in. Store the signed-in user in React context
   (AuthProvider) so the rest of the app can read the current user
   and a sign-out action.

3. Add a small user menu in the new full-screen top bar (Task 2) showing
   the user's Google avatar/name with a sign-out option.

4. Protect the AI API routes server-side: add
   firebase-admin as a dependency in the /api functions, verify the
   Firebase ID token sent from the client (Authorization: Bearer
   <idToken> header) using admin.auth().verifyIdToken(), and reject
   requests with no/invalid token with a 401. Update the client's fetch
   calls to include this header, using the current user's
   getIdToken() before each API call.

5. Tell me exactly what I need to set up in the Firebase console
   (create project, enable Google as a sign-in provider, add the Vercel
   domain to Authorized Domains) and which environment variables to add
   in Vercel (both the VITE_FIREBASE_* client ones, and a
   FIREBASE_SERVICE_ACCOUNT_KEY or equivalent for firebase-admin on the
   server side — tell me the safest way to store that JSON credential
   as a Vercel env var).

Do not build a custom email/password system — Google sign-in via
Firebase Auth only, per the brief.
```

### Why Firebase Auth instead of rolling this by hand
Google's raw OAuth flow requires you to run your own token exchange and
session management — extra backend work for no real benefit at this
scale. Firebase Auth wraps that entirely, keeps your Google Cloud/OAuth
setup to a few clicks in the Firebase console, and gives you server-side
`verifyIdToken()` to protect your `/api` routes with almost no code. If
you later want other providers (email/password, Apple, GitHub), Firebase
Auth supports those too without re-architecting anything.

---

## Suggested order of operations

1. Run Task 1, deploy, confirm `/api/health` and the chat command work
   in production.
2. Run Task 2, review the design plan the agent proposes before it
   builds.
3. Run Task 3, then in the Firebase console enable Google sign-in and
   add your Vercel domain to Authorized Domains before testing.

Each task is written to be handed to the agent as its own message, so if
something goes wrong partway through you can re-run just that task
without repeating the others.
