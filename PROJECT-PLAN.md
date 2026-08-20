# KELNIX AI / ReelCraft Project Plan

## Product Goal

Build a dependable AI-assisted short-form video studio for businesses and creators.

The finished product should let a user:

1. Sign in securely.
2. Create or select a business and project.
3. Describe a video idea in natural language.
4. Generate structured content and scene plans with AI.
5. Review and edit the generated content.
6. Open a real timeline-based editor with one item per scene.
7. Attach uploaded or library media to individual scenes.
8. Edit captions, narration, duration, effects, transitions, music, and format.
9. Preview and export a finished short-form video.
10. Eventually schedule and publish the video to social platforms.

The implementation must preserve a usable local fallback when cloud services are unavailable, while using Supabase and Cloudinary for production persistence and media storage.

## Working Rules

- Complete phases in order unless a dependency requires a small preparatory change.
- Keep changes focused on the current phase; do not start social publishing or AI visual generation early.
- Preserve existing authentication, projects, media, editor, export, Gemini, and fallback behavior while extending them.
- Before editing, identify the owning code path, one falsifiable hypothesis, and one focused validation check.
- After every substantive edit, run the narrowest relevant test or validation command before expanding the work.
- Do not commit secrets, real access tokens, service-role keys, or generated media.
- Do not use fake success responses for production features. Label demo or unavailable behavior clearly.
- Update this plan as phases are completed or requirements change.

## Phase 0: Baseline And Toolchain

### Tasks

- [x] Confirm the repository builds from a clean dependency install.
- [x] Fix the TypeScript and `@types/node` version mismatch blocking `npm run lint`.
- [ ] Review the existing dirty worktree and separate intentional project changes from unrelated changes.
- [ ] Confirm `.env`, `.env.local`, and production secrets are ignored and documented only through `.env.example`.
- [x] Establish the supported commands: `npm run dev`, `npm run build`, and `npm run lint`.

### Exit Criteria

- `npm run build` passes.
- `npm run lint` passes with no dependency-parser errors.
- A new developer can install dependencies and start the app using the README instructions.

## Phase 1: Data And Project Foundations

### Tasks

- [x] Ensure the Create flow creates or selects a real project record before saving generated content.
- [ ] Ensure project IDs are valid and consistent across Supabase and local fallback storage.
- [ ] Verify project, business, content, media, and editor-state relationships.
- [x] Review Supabase migrations for ordering, duplicate policies, malformed SQL, and safe reruns.
- [ ] Confirm Row Level Security policies isolate users' businesses, projects, media, content, and editor states.
- [ ] Add service-level tests for project and content persistence.

### Exit Criteria

- Project A and Project B have independent records and editor states.
- Refreshing either project loads the correct project.
- Missing or malformed records produce friendly fallback behavior.
- Supabase and local fallback behavior are both tested.

## Phase 2: Authentication And Authorization

### Decision Required

- [x] Choose one production authentication provider: Supabase Auth.
- [ ] Do not mix Supabase sessions with Firebase ID tokens without an explicit architecture decision.

### Tasks

- [ ] Complete email/password authentication if Supabase remains the provider.
- [x] Add Google OAuth through the chosen provider if required.
- [ ] Protect all authenticated application routes.
- [x] Protect every server API route that reads or mutates user data.
- [x] Send and validate session tokens consistently from the frontend to the backend.
- [ ] Add sign-out, expired-session, and unauthorized-request handling.
- [ ] Add a user menu with account identity and sign-out.

### Exit Criteria

- Unauthenticated users cannot access private data or AI mutation endpoints.
- Users can sign in, refresh, sign out, and recover from expired sessions.
- API authorization is tested independently from UI route protection.

## Phase 3: AI Content Engine

### Tasks

- [ ] Define and validate one canonical `AIContentResponse` schema.
- [ ] Normalize Gemini, OpenRouter/Zen, and canned fallback responses into that schema.
- [ ] Validate scene count, duration, text fields, hashtags, and suggested duration.
- [ ] Preserve complete generated content when saving, including hook, description, scripts, scenes, and metadata.
- [ ] Improve frontend API error handling for network errors, non-JSON responses, rate limits, and provider failures.
- [ ] Keep Gemini as primary, fallback provider as secondary, and canned content as last resort.
- [ ] Add tests for valid AI output, malformed AI output, provider failure, and fallback output.

### Exit Criteria

- Every successful generation returns valid structured content.
- Provider failure does not crash the creation flow.
- The user receives a readable error or clearly labeled fallback result.
- Saved content can be reopened without losing scene information.

## Phase 4: AI-To-Editor Handoff

### Status

The initial Phase 5B implementation is present and must be hardened during this phase.

### Tasks

- [x] Keep conversion logic in `contentToEditorAdapter.ts`.
- [x] Convert every AI scene into one editor slide.
- [x] Preserve duration, narration, on-screen text, visual description, and scene order.
- [x] Use explicit placeholders without fake media URLs.
- [x] Store project ID and generated content ID in editor state.
- [x] Use project-specific editor persistence with local fallback.
- [x] Replace a selected scene's placeholder through MediaPicker.
- [x] Add adapter unit tests.
- [x] Add project-isolation tests.
- [x] Add media-replacement tests.
- [x] Add a friendly loading state and missing-project state in the editor.
- [x] Prevent export of unresolved placeholders or render them with an explicit warning.

### Exit Criteria

- Multiple generated scenes appear in the correct timeline order.
- Scene metadata survives save, refresh, reorder, and edit operations.
- Replacing Scene 2 does not alter Scene 1 or Scene 3.
- Project A and Project B never share editor state.

## Phase 5: Editor Usability And Reliability

### Tasks

- [ ] Make the editor layout reliable on desktop, tablet, and mobile widths.
- [ ] Keep preview, inspector, timeline, and primary actions accessible without confusing nested scrolling.
- [ ] Add direct Add Media affordances for placeholder scenes.
- [ ] Show save status as `Saving`, `Saved`, or `Save failed`.
- [ ] Handle empty slides, deleted media, invalid URLs, and unsupported media types.
- [ ] Confirm duration edits, scene order, captions, filters, transitions, audio, and configuration all persist.
- [ ] Ensure playback stops and audio resources are cleaned up when leaving the editor.
- [ ] Add focused editor interaction tests.

### Exit Criteria

- A user can complete a reel without encountering a broken preview or inaccessible control.
- All core editor changes survive refresh.
- Media failures degrade gracefully and explain the next action.

## Phase 6: Media And Cloudinary Production Flow

### Tasks

- [ ] Verify upload signing and server-side Cloudinary configuration with real production credentials.
- [ ] Verify image, video, and audio validation limits.
- [x] Persist Cloudinary metadata consistently in Supabase.
- [ ] Scope media queries by authenticated user and, where appropriate, business/project.
- [ ] Handle upload progress, cancellation, retry, and failed cleanup.
- [ ] Prevent deleting media that is still referenced without a clear warning.
- [ ] Verify thumbnails and video previews for all supported formats.
- [ ] Add media service tests and upload integration checks.

### Exit Criteria

- A user can upload, view, select, replace, and delete supported media.
- Media remains available after refresh and across sessions.
- Unauthorized users cannot access or delete another user's media.

## Phase 7: Export And Rendering

### Tasks

- [ ] Verify all aspect ratios: 9:16, 1:1, 4:5, and 16:9.
- [ ] Render images, videos, captions, stickers, transitions, filters, overlays, music, and narration correctly.
- [ ] Handle missing or placeholder media before rendering.
- [ ] Add export cancellation and clearer progress reporting.
- [ ] Verify browser compatibility for `MediaRecorder` and canvas capture.
- [ ] Test short, long, image-only, video-only, mixed-media, and audio projects.
- [ ] Document output format and browser limitations.

### Exit Criteria

- Exported videos play correctly and match the editor preview closely.
- Export failures provide an actionable message.
- Placeholder scenes cannot silently become blank or misleading output.

## Phase 8: Dashboard And Product Workflow

### Tasks

- [x] Replace hardcoded dashboard counts with live project/content data.
- [x] Make recent projects open the correct editor project.
- [x] Implement live Content, Businesses, Analytics, and Settings screens.
- [ ] Implement Social Accounts after platform connection requirements are defined.
- [ ] Add project creation, project search, project status, and empty states.
- [ ] Redesign the app shell as a full-height creative workspace without breaking editor usability.
- [ ] Keep keyboard focus, responsive layouts, and reduced-motion behavior accessible.

### Exit Criteria

- The dashboard reflects real user data.
- Every visible navigation item leads to a working screen.
- A user can move from dashboard to creation to editor and back without losing context.

## Phase 9: Social Publishing And Scheduling

### Tasks

- [x] Remove or clearly label demo Facebook publishing behavior.
- [ ] Implement real Facebook Graph API publishing only after secure token handling is complete.
- [ ] Decide the supported social platforms and API permissions.
- [ ] Add connected social account records and token lifecycle handling.
- [ ] Add scheduled publishing and status tracking.
- [ ] Add retry and failure reporting.
- [ ] Never send fake video previews as if they were uploaded media.

### Exit Criteria

- A successful publish has a verifiable platform response.
- Failed publishing does not report success.
- Tokens are never exposed in client logs, URLs, or persisted editor state.

## Phase 10: Quality, Security, And Release

### Tasks

- [ ] Add unit tests for services, validation, and state migration.
- [ ] Add integration tests for authentication, generation, saving, media selection, and export.
- [ ] Add browser tests for the main user journey.
- [ ] Run dependency and secret scans.
- [ ] Review API request limits, payload sizes, timeouts, and abuse protection.
- [ ] Review Supabase RLS and Cloudinary permissions in production.
- [ ] Add production logging that excludes secrets and personal data.
- [x] Update README with setup, environment variables, migrations, deployment, and troubleshooting.
- [ ] Create a release checklist and rollback procedure.

### Final Acceptance Journey

- [ ] New user signs in.
- [ ] User creates or selects a business.
- [ ] User creates a project.
- [ ] User generates AI content with at least three scenes.
- [ ] User reviews and saves the content.
- [ ] Editor opens with one timeline item per scene.
- [ ] User attaches different media to different scenes.
- [ ] User edits captions, durations, order, effects, and audio.
- [ ] User refreshes and confirms the project is preserved.
- [ ] User opens a second project and confirms isolation.
- [ ] User exports a valid video.
- [ ] User receives clear errors for unavailable AI, media, storage, and publishing services.

## Current Starting Point

- Phase 4 AI-to-editor handoff: initial implementation complete, tests and hardening remain.
- Phase 0 toolchain: build and lint pass after pinning `@types/node`.
- Authentication: Supabase Auth and Google OAuth are wired; production provider configuration remains.
- Dashboard: live project data is connected; deeper product screens remain.
- Publishing: Facebook endpoint is not production-ready.
- AI image/video generation: intentionally out of scope until the editor and persistence foundations are stable.

## Definition Of Done

The project is finished when the final acceptance journey passes with real Supabase, Cloudinary, and AI configuration, the local fallback still works for development, all critical routes are protected, no visible feature is falsely labeled as complete, and build, lint, tests, and browser checks pass.