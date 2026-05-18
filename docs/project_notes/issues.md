---

### 2026-05-18 - Comment System Implementation

- **Status**: Completed
- **Description**: Implemented a visual comment section with 1-level threading, sound effects, and moderation tools.
- **Key Contributions**:
    - **Backend**: Created the `comment` API with a custom lifecycle hook that enforces a maximum depth of 2 (1 comment + 1 reply) and a maximum of 1 reply per comment.
    - **Astro API**: Created `/api/comment` (POST) and `/api/comment/[id]` (DELETE) routes.
    - **Frontend**: Built `CommentSection.tsx` (React) with optimistic updates, "Crunch" sound effect integration, and a moderation "Delete" button for Editors.
    - **Moderation**: Established "Editor" role permissions on bootstrap, allowing administrators to moderate ill-tempered comments directly from the UI.
- **Notes**: See `bugs.md` for details on the Strapi 5 Document ID and connection syntax fixes required for this implementation.

---

### 2026-05-17 - Strapi 5.46 Migration & Population Error Fix

- **Status**: Completed
- **Description**: Resolved critical `Invalid populate parameter` errors following the upgrade to Strapi 5.46.
- **Key Contributions**:
    - **Backend Refactor**: Standardized all `strapi.documents` calls to use object-based population or non-empty arrays. Refactored the `findDoc` helper in reaction lifecycles to handle conditional population safely.
    - **Layout Fix**: Resolved a double `populate` key collision in `ClientLayout.astro` that crashed the Document Service. Standardized on the indexed array query format.
    - **Security Policy Update**: Updated `is-editor-or-owner` policy with strict population syntax for internal user role checks.
    - **Audit**: Conducted a full audit of `populate` parameters in all Astro API routes and backend controllers to ensure long-term stability in Strapi 5.46+.
- **Notes**: See `bugs.md` for the technical deep-dive into the "Mixed-Type Population" root cause.

---

### 2026-05-13 - Session Goals: Social & Economy Push

- **Status**: In Progress
- **Description**: Implementing core social features and refining the chip economy.
- **Tasks**:
    1. **Following Feed & Notifications**: Refine the homepage toggle and the "New Art" notification dot.
    2. **Chip Economy Polish**: Verify daily allowance resets and the "5 Classics = 1 Cheddar" reciprocal logic.
    3. **Flavor Pruning (Dashboard)**: Final UI polish for Rename/Merge/Delete category tools.
    4. **Anonymous User Protection**: Implement a "Strict Author" policy to prevent orphaned photos.

---

### 2026-04-27 - Initial Astro Frontend Setup

- **Status**: Completed
- **Description**: Configured `react/astro.config.mjs` with `output: 'static'` and created `react/src/env.d.ts` to resolve `astro:content` TypeScript errors in a fresh project clone
- **Notes**: See `bugs.md` — "astro:content Cannot Be Found"

---

### 2026-04-27 - Upgrade Loader to Fix Astro 6 Type Errors

- **Status**: Completed
- **Description**: Upgraded `strapi-community-astro-loader` from v2.0.6 to v4.0.0 in root `package.json` and rewrote `react/src/content.config.ts` to use the v4 API (`clientConfig.baseURL`, Zod schemas per collection)
- **Notes**: See `bugs.md` — "strapi-community-astro-loader v2 Type Errors with Astro 6" and `decisions.md` ADR-002

---

### 2026-04-27 - Fix Single Type 404 Errors (`about`, `global`)

- **Status**: Completed
- **Description**: Implemented custom `strapiSingleLoader` function in `content.config.ts` to fetch Strapi single types at their singular REST endpoints (`/api/about`, `/api/global`) instead of pluralized/paginated paths
- **Notes**: See `bugs.md` — "Single Type Collections Return 404" and `decisions.md` ADR-003

---

### 2026-04-27 - Set Up Project Memory System

- **Status**: Completed
- **Description**: Created `docs/project_notes/` with bugs, decisions, key facts, and issues files. Created agent instruction files for Claude (`CLAUDE.md`), Cline (`.clinerules`), Gemini (`GEMINI.md`), and GitHub Strapi (`.github/copilot-instructions.md`). Added `/log-memory` custom command
- **Notes**: Covers all issues and decisions from the initial setup session

---

### 2026-04-30 - Technical Flow & Memory Update

- **Status**: Completed
- **Description**: Defined full technical media flow (Strapi-ImageKit-Astro) and created `media_flow.mmd`. Updated `key_facts.md` and `decisions.md` with multi-role and external storage architecture.
- **Notes**: Added mandatory "check memory" instructions to agent config files.

---

### 2026-05-04 - Photorium Dynamic Features & Munch Economy

- **Status**: Completed
- **Description**: Implemented the full "Munch" economy and transitioned Astro to SSR.
- **Key Contributions**:
    - **Strapi 5**: Extended User/Photo schemas, implemented reciprocal munch logic in lifecycles.
    - **Astro SSR**: Enabled SSR, implemented middleware for secure session management.
    - **Auth**: Created login/logout API routes and UI.
    - **Dashboard**: Built Author Dashboard with ImageKit-powered upload proxy.
    - **Gallery**: Transitioned to dynamic Masonry grid with munch interaction chips.
- **Notes**: See `docs/photorium-dynamic-features-plan.md` for full technical details.

---

### 2026-05-06 - Daily Chips System & Dynamic Main Gallery

- **Status**: Completed
- **Description**: Implemented the daily chip allowance logic (1 potato per day, earn 1 cheddar chip every 5 potatoes). Created custom reaction controller in Strapi backend. Transitioned the main Astro page to dynamic SSR fetches for photos.
- **Notes**: Fixed a major bug in Strapi 5 lifecycle ID handling. Verified with automated Playwright browser tests.
- **New Skill**: Created `playwright-testing` skill to document best practices for Docker MCP browser tools.

---

### 2026-05-08 - Frontend Chips and Image Fixes

- **Status**: Completed
- **Description**: Resolved issues with the frontend Navbar displaying static chip counts and the PhotoGrid rendering broken image links.
- **Key Contributions**:
    - **Navbar**: Passed `Astro.locals.user` from `ClientLayout` to `Navbar.tsx` to dynamically render user chip balances (`classic_munch_given_total`, `cheddar_munch_balance`).
    - **PhotoGrid**: Updated image URL resolution logic to robustly handle the various shapes of nested media objects returned by the Strapi v5 REST API `populate` parameter.
- **Notes**: Tested by creating a `dummy_test` account, uploading a test photo programmatically, and verifying that the ArtistOne account can see the photo and successfully execute a Classic Munch.

---

### 2026-05-08 - Profile Builder & Discovery Enhancements

- **Status**: Completed
- **Description**: Implemented user personalization and enhanced content discovery.
- **Key Contributions**:
    - **UI/UX**: Fixed chip/number collision in Navbar; resolved various TypeScript errors across frontend.
    - **Profile Builder**: Created `/api/update-profile.ts` and dashboard modal for bio, nickname, and avatar updates.
    - **Discovery**: Implemented functional Search bar and homepage "Flavor Bar" that dynamically displays the Top 5 most recently used categories.
    - **Smart Categories**: Refactored photo upload to support free-form category tagging with "Find or Create" logic on the backend.
---

### 2026-05-10 - UI/UX Polish

- **Status**: Completed
- **Description**: Implemented toast notifications and loading states.
- **Key Contributions**:
    - **react-hot-toast**: Added to `PhotoGrid.tsx`, `dashboard.astro`, `login.astro`.
    - **Optimistic UI**: Updated `PhotoGrid.tsx` to optimistically increase munch counts without full reload.
    - **Button states**: Added disabling and text updates during uploads and profile edits.

---

### 2026-05-10 - Photo Detail Pages

- **Status**: Completed
- **Description**: Built dynamic `/photo/[id]` route for high-res art viewing.
- **Key Contributions**:
    - **Page Route**: Created `react/src/pages/photo/[id].astro` to fetch individual photo metadata from Strapi.
    - **Linking**: Updated `PhotoGrid.tsx` and `dashboard.astro` to link images and titles to the detail pages.

---

### 2026-05-10 - Artist Public Profiles

- **Status**: Completed
- **Description**: Built `/artist/[username]` public pages to showcase an artist's stash.
- **Key Contributions**:
    - **Backend Permissions**: Modified `photorium/src/index.ts` bootstrap script to grant public `find/findOne` access for users, ensuring Astro can fetch profile data without authentication.
    - **Page Route**: Created `react/src/pages/artist/[username].astro` to fetch and render the artist's avatar, bio, stats, and public grid of photos.
    - **Linking**: Updated `PhotoGrid.tsx` and Photo Detail pages to link authors' usernames to their respective public profiles.

---

### 2026-05-09 - Photorium V1.1 Roadmap (Backlog)

- **Status**: Planned
- **Description**: Next phase focused on UX polish, deeper content discovery, and self-service management.
- **Backlog Items**:
    - **Self-Service Management**: Add "Delete" and "Edit" functionality for photos in the Author Dashboard.
    - **Flavor Pruning**: Build a tool for artists to manage (rename/merge/delete) their custom categories.
    - **Social Features**: Consider a "Following" system to notify users when favorite artists "Fry" new art.

### 2026-05-04 - Self-Service Management (Task 4)
- **Status**: Completed
- **Description**: Added Edit and Delete functionality to the author dashboard.
- **Resolution**:
  - Implemented `/api/update-photo` and `/api/delete-photo` endpoints.
  - Endpoints verify JWT ownership (user ID must match the photo's author ID) before calling Strapi's update/delete lifecycles.
  - UI in `dashboard.astro` displays Edit/Delete actions in `.self-service-actions` and manages interactions using React Hot Toast and native browser confirmations.

### 2026-05-10 - Flavor Pruning (Category Management)
- **Status**: Completed
- **Description**: Implemented self-service tools for artists to manage their custom categories (flavors).
- **Key Contributions**:
  - **Backend**: Added custom `merge` action to Strapi Category controller and registered a custom route.
  - **Astro API**: Created proxy routes for `rename`, `merge`, and `delete` category operations.
  - **UI/UX**: Added "Manage Flavors" modal to the dashboard with inline renaming, destination-targeted merging, and deletion.
  - **TypeScript**: All implementation follows strict typing and uses existing Strapi interfaces.

### 2026-05-10 - Social Media Sharing

- **Status**: Completed
- **Description**: Implemented "One-Click" social sharing and enhanced Open Graph metadata for better link previews.
- **Key Contributions**:
    - **Metadata**: Updated `ClientLayout.astro` with dynamic `og:` and `twitter:` meta tags.
    - **Component**: Created `SocialShare.astro` with stylized buttons for X, Facebook, Pinterest, and LinkedIn.
    - **Integration**: Added sharing buttons to the Photo Detail pages and implemented dynamic metadata for both Photo and Artist Profile pages.

---

### 2026-05-11 - "New Art" Notification Indicator

- **Status**: Completed
- **Description**: Implemented a client-side notification system to alert users of new uploads from artists they follow.
- **Key Contributions**:
    - **Navbar**: Updated `Navbar.tsx` with a `useEffect` hook that fetches the latest photo from followed artists and compares it to a `localStorage` timestamp.
    - **UI**: Added a pulsing yellow notification dot to the Navbar.
    - **Logic**: Integrated `localStorage` tracking in `index.astro` to reset the notification when the Following Feed is viewed.
    - **Middleware**: Enhanced `middleware.ts` to populate the `following` relationship in the session user object for efficient client-side checks.

---

### 2026-05-11 - Strapi 5 Document Service Migration

- **Status**: Completed
- **Description**: Refactored backend controllers and lifecycles to use the Strapi 5 Document Service API (`strapi.documents()`) instead of the legacy Entity Service or raw DB queries.
- **Key Contributions**:
    - **Controllers**: Refactored Category `merge` and Reaction `give` actions to use `documentId` and the Document Service.
    - **Lifecycles**: Updated Photo and Comment lifecycles to use type-safe Document Service methods.
    - **Relations**: Standardized on `documentId` for all relational updates across Astro API routes (`create-photo.ts`, `toggle-follow.ts`).

---

### 2026-05-11 - Strict TypeScript Refactor (Zero `any` Usage)

- **Status**: Completed
- **Description**: Performed a project-wide refactor to remove `as any` and `as unknown` casts, strictly adhering to the "TypeScript Architect" core mandates.
- **Key Contributions**:
    - **Strict Interfaces**: Implemented local interfaces for Strapi 5 internal types (e.g., `CategoryWithUser`, `StrapiUserStats`, `StrapiPhotoStats`).
    - **Type-Safe Controllers**: Correctly typed `ctx.state.user` and request bodies in custom Strapi controllers.
    - **Skill Update**: Updated the `typescript-architect` skill with documented patterns for handling Strapi 5's sparse internal types safely.
