# Converting kelnix-AI / ReelCraft to Vercel serverless functions

## What this package contains

```
api/
  _lib/
    ai.ts          <- shared Gemini + OpenRouter fallback helpers
    research.ts    <- shared Wikipedia/DuckDuckGo/Google News helpers
  health.ts        -> GET  /api/health
  generate-script.ts -> POST /api/generate-script
  analyze-photos.ts  -> POST /api/analyze-photos
  tts.ts              -> POST /api/tts
  research.ts         -> POST /api/research
  chat-command.ts      -> POST /api/chat-command
  facebook/
    publish-reel.ts    -> POST /api/facebook/publish-reel
vercel.json         <- replaces your current vercel.json
```

Vercel automatically turns every file in `/api` into its own serverless
function and routes `/api/<filename>` to it — no extra routing config needed
for the functions themselves.

## Steps to apply this to your repo

1. Copy the `api/` folder into the root of your `kelnix-AI` repo (same level
   as `src/`, `index.html`, `package.json`).
2. Replace your existing `vercel.json` with the one in this package. The key
   change: the rewrite now excludes `/api/*` so those requests reach your
   functions instead of being swallowed by the SPA catch-all.
3. Install the Vercel Node types as a dev dependency:
   ```
   npm install --save-dev @vercel/node
   ```
4. In the Vercel dashboard: Project -> Settings -> Environment Variables, add:
   - `GEMINI_API_KEY` (required for real AI output; without it every route
     falls back to canned/algorithmic responses)
   - `OPENCODE_API_KEY`, `OPENCODE_MODEL`, `OPENCODE_BASE_URL` (optional,
     only if you're using the OpenRouter fallback chain)
   Apply them to Production (and Preview if you want PR previews to work too).
5. Your **build command** on Vercel should just be `vite build` (building the
   frontend). You no longer need `esbuild server.ts ...` for the Vercel
   deployment — that bundling step is only needed if you deploy the old
   Express server elsewhere (Option B, a Node host like Render/Railway).
   You can leave `server.ts` and the `dev`/`start` scripts in package.json as
   they are, in case you ever want to self-host instead of using Vercel.
6. Commit and push. Vercel will pick up the `/api` folder on the next deploy
   automatically.
7. Test after deploy:
   ```
   curl https://kelnix-ai.vercel.app/api/health
   ```
   You should get back `{"status":"ok","timestamp":"..."}` as JSON, not HTML.
   Then test the chat command endpoint from the app UI.

## Note on function timeouts

`/api/research` calls three external sources plus an AI summary. On Vercel's
free/Hobby plan, serverless functions are capped at 10 seconds — I already
trimmed the internal AI-summary timeouts in `_lib/research.ts` down to 7s
each to fit under that ceiling. If you're on Vercel Pro (60s functions), you
can raise `maxDuration` in `api/research.ts` and the timeout values in
`_lib/research.ts` back up for more reliability on slow searches.

## Client-side: no changes needed

Since your frontend already calls relative paths like `fetch('/api/chat-command', ...)`,
nothing in `src/` needs to change — those requests will now correctly reach
your new serverless functions instead of `index.html`.
