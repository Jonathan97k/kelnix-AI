<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# KELNIX AI / ReelCraft

KELNIX AI is an AI-assisted short-form video studio for creating, editing, and exporting reels for platforms such as Instagram, TikTok, Facebook, and YouTube Shorts.

View your app in AI Studio: https://ai.studio/apps/c8d37c53-1c60-4d12-a1af-6d6c39d8a884

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`.
3. Configure `GEMINI_API_KEY` for Gemini generation. `OPENCODE_API_KEY` is optional and provides a fallback provider.
4. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable authentication and cloud persistence. Without them, the app uses local fallback storage.
5. Configure the server-side `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and Cloudinary variables when using uploads and protected server routes.
6. Run the app:
   `npm run dev`

## Validation

```text
npm run lint
npm run build
```

The build produces the Vite frontend and the self-hosted Express bundle. The root `api/` directory contains the Vercel serverless routes.

## Current Workflow

```text
Idea -> AI content and scenes -> project -> editor timeline -> media attachment -> preview -> export
```

AI scenes intentionally begin as editable placeholders. Real images and videos are attached through the Media Library or Upload New Media flow.

## Database Setup

Apply the Supabase migrations in order:

1. `supabase_migration_phase2.sql`
2. `supabase_migration_phase3_auth.sql`
3. `supabase_migration_phase4_media.sql`
4. `supabase_migration_phase5_editor_state.sql`

Review and apply them in the Supabase SQL editor for the target project. Never commit real API keys, service-role keys, Cloudinary secrets, or social access tokens.
